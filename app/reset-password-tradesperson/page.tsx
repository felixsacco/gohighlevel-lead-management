"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Key, ArrowLeft, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  "https://jismdkfjkngwbpddhomx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imppc21ka2Zqa25nd2JwZGRob214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzc2MzksImV4cCI6MjA2ODUxMzYzOX0.1pK4G-Mu5v8lSdDJUAsPsoDAlK9d7ocFaUH9dd2vl3A"
);

export default function ResetPasswordTradespersonPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1); // 1: Email verification, 2: Password reset
  
  const router = useRouter();

  useEffect(() => {
    // Check if email was passed from forgot password page
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      setStep(2); // Skip email verification if email is already provided
      localStorage.removeItem("resetEmail"); // Clean up
    }
  }, []);

  const handleEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Check ONLY tradespeople table
      const { data: tradespersonData, error: tradespersonError } = await supabase
        .from("tradespeople")
        .select("id, email, first_name, is_verified")
        .eq("email", email)
        .single();

      if (tradespersonError || !tradespersonData) {
        setError("No tradesperson account found with this email address.");
        setIsLoading(false);
        return;
      }

      if (!tradespersonData.is_verified) {
        setError("Please verify your email address first before resetting your password.");
        setIsLoading(false);
        return;
      }

      setStep(2);
      setSuccess(`Email verified! Hello ${tradespersonData.first_name}, please enter your new password.`);
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      // Update password in tradespeople table ONLY
      const { error } = await supabase
        .from("tradespeople")
        .update({ password_hash: password })
        .eq("email", email);

      if (error) {
        setError("Failed to update password. Please try again.");
      } else {
        setSuccess("Password updated successfully! Redirecting to login...");
        
        setTimeout(() => {
          router.push("/login/trade");
        }, 2000);
      }
    } catch (error) {
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
            <CardTitle>Reset Tradesperson Password</CardTitle>
          </div>
          <p className="text-gray-600">
            {step === 1 
              ? "Enter your email address to verify your tradesperson account." 
              : "Enter your new password below."
            }
          </p>
        </CardHeader>

        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleEmailVerification} className="space-y-4">
              <div>
                <Label htmlFor="email">Tradesperson Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your tradesperson email address"
                    className="pl-10"
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
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Verifying..." : "Verify Tradesperson Email"}
              </Button>

              <div className="text-center">
                <Link
                  href="/login/trade"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Tradesperson Login
                </Link>
              </div>
            </form>
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
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Updating..." : "Update Tradesperson Password"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Email Verification
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


