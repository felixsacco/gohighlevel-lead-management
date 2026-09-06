"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Key, CheckCircle } from "lucide-react";
import Link from "next/link";

// Mirrors the server-side rule enforced by POST /api/auth/reset/confirm.
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_COMPLEXITY = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

function ResetPasswordContent() {
  // The emailed reset link is /reset-password?token=<signed token>. The token
  // proves ownership of the account (15-min HMAC, purpose-locked); no email
  // re-entry is needed here, and the account id comes from the token, never
  // from anything typed in this browser.
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side mirror of the server's rules — short/weak passwords are
    // rejected here before a round-trip, but the server enforces the same
    // floor and would reject them anyway.
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!PASSWORD_COMPLEXITY.test(password)) {
      setError("Password must contain uppercase, lowercase, and number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
      return;
    }

    setIsLoading(true);

    try {
      // POST /api/auth/reset/confirm verifies the HMAC token server-side and
      // scrypt-hashes the new password before writing it, keyed by the account
      // id signed into the token. The raw password never leaves this form
      // except to that route over HTTPS.
      const res = await fetch("/api/auth/reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          data?.error || "Unable to reset your password. Please try again."
        );
        return;
      }

      // Token successfully redeemed — clear any legacy split-flow state left
      // behind by the old forgot-password page.
      try {
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetUserType");
      } catch {
        // localStorage unavailable (private mode, blocked storage) — non-fatal.
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess(
        "Your password has been reset. Please sign in with your new password."
      );
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-blue-600 mr-2" />
            <CardTitle
              className="font-bold tracking-tight"
              style={{ fontWeight: 700 }}
            >
              Reset Password
            </CardTitle>
          </div>
          <p className="text-gray-600">
            {success
              ? ""
              : "Enter a new password for your account."}
          </p>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
              <p className="text-sm text-gray-600">
                Sign in with your new password:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button asChild className="w-full bg-brand-amber hover:bg-brand-amberDark text-black font-semibold" style={{ fontWeight: 800 }}>
                  <Link href="/login/client">Client Login</Link>
                </Button>
                <Button asChild className="w-full bg-brand-navy hover:bg-brand-navyDark text-white font-semibold" style={{ fontWeight: 800 }}>
                  <Link href="/login/trade">Tradesperson Login</Link>
                </Button>
              </div>
            </div>
          ) : !token ? (
            <div className="space-y-4 text-center">
              <Alert variant="destructive">
                <AlertDescription>
                  This password reset link is invalid or has expired. Please
                  request a new one.
                </AlertDescription>
              </Alert>
              <Button asChild className="w-full bg-brand-amber hover:bg-brand-amberDark text-black font-semibold" style={{ fontWeight: 800 }}>
                <Link href="/forgot-password">Request a New Reset Link</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="pr-10 rounded-2xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Show password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  At least 8 characters with an uppercase letter, a lowercase
                  letter and a number.
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="pr-10 rounded-2xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Show confirm password"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-amber hover:bg-brand-amberDark text-black font-semibold"
                style={{ fontWeight: 800 }}
              >
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
