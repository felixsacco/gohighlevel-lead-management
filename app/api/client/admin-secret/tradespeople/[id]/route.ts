import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: "Missing tradesperson id" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { data: tradesperson, error: tpError } = await supabaseAdmin
      .from("tradespeople")
      .select("*")
      .eq("id", id)
      .single();

    if (tpError || !tradesperson) {
      return NextResponse.json({ error: "Tradesperson not found" }, { status: 404 });
    }

    const { data: docs, error: docsError } = await supabaseAdmin
      .from("documents")
      .select("id, doc_type, file_path, upload_date, expiry_date, doc_number, status")
      .eq("trade_id", id)
      .order("upload_date", { ascending: false });

    if (docsError) {
      console.warn("Failed to load documents for tradesperson", id, docsError.message);
    }

    const documents = await Promise.all(
      (docs || []).map(async (doc: any) => {
        let signedUrl: string | null = null;
        if (doc.file_path) {
          const { data: signed, error: signedErr } = await supabaseAdmin.storage
            .from("documents")
            .createSignedUrl(doc.file_path, 60 * 30);
          if (!signedErr && signed?.signedUrl) {
            signedUrl = signed.signedUrl;
          }
        }

        return {
          ...doc,
          signed_url: signedUrl,
        };
      }),
    );

    return NextResponse.json({
      tradesperson,
      documents,
    });
  } catch (error) {
    console.error("Error loading tradesperson details", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
