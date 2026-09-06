// @ts-nocheck
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, Key, User, Wrench } from "lucide-react";
import Link from "next/link";

function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userType, setUserType] = useState("client"); // "client" or "tradesperson"
  const searchParams = useSearchParams();

  useEffect(() => {
    // Detect user type from URL parameter or referrer
    const type = searchParams.get("type");
    if (type === "tradesperson") {
      setUserType("tradesperson");
    } else if (type === "client") {
      setUserType("client");
    } else {
      // Try to detect from referrer
      const referrer = document.referrer;
      if (referrer.includes("/login/trade")) {
        setUserType("tradesperson");
      } else if (referrer.includes("/login/client")) {
        setUserType("client");
      }
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const emailValue = email.trim().toLowerCase();
    if (!emailValue) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      // The account lookup + reset email are handled server-side
      // (POST /api/auth/reset/request). This page never queries a table, so it
      // cannot learn whether an email is registered, and the response is
      // deliberately identical in every branch — only a real, verified account
      // actually receives the emailed reset link. No account state is written
      // to localStorage here.
      const res = await fetch("/api/auth/reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType, email: emailValue }),
      });

      const data = await res.json().catch(() => ({}));

      // Always show the same neutral confirmation whether or not an account
      // exists — never reveal which emails are registered.
      setSuccess(
        data?.message ||
          "If an account with that email exists and is verified, we've sent a link to reset your password. Please check your inbox (and spam folder)."
      );
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center p-4">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-brand-navy mr-2" />
            <CardTitle className="font-bold tracking-tight text-brand-navy" style={{ fontWeight: 700 }}>Forgot Password</CardTitle>
          </div>
          <p className="text-gray-600">
            Enter your email address and we will send you a link to reset your
            password.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label>Account Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setUserType("client")}
                  className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 text-sm font-semibold transition-all ${
                    userType === "client"
                      ? "border-brand-amber bg-brand-amber/10 text-brand-navyDark"
                      : "border-gray-300 bg-white text-gray-600 hover:border-brand-amber/50"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("tradesperson")}
                  className={`flex items-center justify-center gap-2 h-11 rounded-xl border-2 text-sm font-semibold transition-all ${
                    userType === "tradesperson"
                      ? "border-brand-amber bg-brand-amber/10 text-brand-navyDark"
                      : "border-gray-300 bg-white text-gray-600 hover:border-brand-amber/50"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Tradesperson
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 rounded-2xl"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full bg-brand-amber hover:bg-brand-amberDark text-black font-semibold" style={{ fontWeight: 800 }}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <Link
                href={userType === "tradesperson" ? "/login/trade" : "/login/client"}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>

            <div className="text-center text-sm text-gray-600">
              Do not have an account?{" "}
              <Link
                href={userType === "tradesperson" ? "/register/tradesperson" : "/register/client"}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Register here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}
