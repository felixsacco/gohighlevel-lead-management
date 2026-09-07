import { getSupabaseAdmin } from "@/lib/supabase";

interface TaskContext {
  taskName: string;
  payload: Record<string, any>;
}

/**
 * Persist a task failure to the dead_letter_queue audit table so a failed
 * asynchronous operation can be re-driven later without dropping its payload.
 *
 * Writes go through the service-role client (getSupabaseAdmin), which bypasses
 * the table's RLS (enabled with zero policies — payloads carry customer PII).
 * If the admin client is unavailable or the insert fails, the error is logged
 * loudly and null is returned rather than thrown, so callers can still surface
 * the original failure without the DLQ write masking it.
 *
 * Returns the inserted row id (or null when the DLQ write itself failed).
 */
export async function recordDeadLetter(
  context: TaskContext,
  errorMessage: string,
): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error(
        "[DLQ Fatal] Supabase admin not available; failed to write to dead-letter queue:",
        context.taskName,
      );
      return null;
    }
    const { data, error } = await supabase
      .from("dead_letter_queue")
      .insert({
        task_name: context.taskName,
        payload: context.payload,
        error_message: errorMessage,
        status: "failed",
      })
      .select("id");
    if (error) {
      console.error("[DLQ Fatal] Failed to write to dead-letter queue:", error);
      return null;
    }
    return data?.[0]?.id ?? null;
  } catch (dlqErr) {
    console.error("[DLQ Fatal] Failed to write to dead-letter queue:", dlqErr);
    return null;
  }
}

/**
 * executeWithResilience wraps a single asynchronous worker hop (notification
 * dispatch, CRM sync trigger, …) so that an unhandled exception never surfaces
 * as a silent/masked success. On failure it logs a structured error line and
 * persists the full task context to the dead-letter queue (via recordDeadLetter)
 * so the operation can be re-driven later without dropping data.
 */
export async function executeWithResilience<T>(
  context: TaskContext,
  taskFn: () => Promise<T>,
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await taskFn();
    return { success: true, data: result };
  } catch (err: any) {
    const errorMessage =
      err?.message || "Unknown background worker error";
    console.error(`[Worker Failure] Task: ${context.taskName}`, errorMessage);

    await recordDeadLetter(context, errorMessage);

    return { success: false, error: errorMessage };
  }
}
