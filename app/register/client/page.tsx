"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowLeft,
  CheckCircle,
  ChevronDown,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import SectionHeaderPill from "@/components/ui/SectionHeaderPill";
import { Container } from "@/components/ui/Container";
import { supabase } from "@/lib/supabase-client";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  postcode: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  postcode?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

export default function ClientRegistration() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    postcode: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [verificationToken, setVerificationToken] = useState<string>("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Postcode validation
    if (!formData.postcode.trim()) {
      newErrors.postcode = "Postcode is required";
    } else if (formData.postcode.length < 5) {
      newErrors.postcode = "Please enter a valid postcode";
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.length < 10) {
      newErrors.address = "Please enter a complete address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("clients")
        .select("email")
        .eq("email", formData.email);

      if (existingUser && existingUser.length > 0) {
        setErrorMessage("An account with this email already exists");
        setIsLoading(false);
        return;
      }

      // Create new client account in database
      const { data, error } = await supabase
        .from("clients")
        .insert({
          email: formData.email,
          password_hash: formData.password, // Store password in password_hash column
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          postcode: formData.postcode,
          address: formData.address,
          is_verified: false,
            is_active: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Registration error:", error);
        setErrorMessage("Registration failed. Please try again.");
      } else {
        // Send verification email
        await sendVerificationEmail(formData.email);
        setIsEmailSent(true);
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          postcode: "",
          address: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationEmail = async (email: string) => {
    try {
      // Create a verification token
      const token =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      setVerificationToken(token);

      // Send verification email via API
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          firstName: formData.firstName,
          token: token,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Verification email sent successfully");
        setIsEmailSent(true);
      } else {
        console.error("Error sending verification email:", result.error);
        setErrorMessage("Failed to send verification email. Please try again.");
      }
    } catch (error) {
      console.error("Error in email verification:", error);
      setErrorMessage("Failed to send verification email. Please try again.");
    }
  };

  if (isEmailSent) {
    return (
      <div className="relative min-h-screen bg-brand-slate flex items-center justify-center p-6 overflow-hidden -mt-[var(--header-height)] pt-[120px] sm:pt-[140px] pb-16">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, #F5A623 1px, transparent 1px), linear-gradient(to bottom, #F5A623 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623] rounded-full blur-[150px] opacity-10" />
        
        <div className="relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-3xl blur-xl" />
          <Card className="relative w-full max-w-2xl rounded-3xl border border-white/20 bg-gradient-to-br from-brand-navy to-brand-navy backdrop-blur-md shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-3xl" />
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-brand-navy/20 border border-blue-400/30 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                    <Mail className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2">
                  Email Verification Sent!
                </h2>
                <p className="text-blue-100 mb-4">
                  We have sent a verification email to{" "}
                  <strong className="text-yellow-400">{formData.email}</strong>
                </p>
                <p className="text-blue-200 text-sm mb-6">
                  Please check your inbox and click the verification link to
                  activate your account.
                </p>
              </div>

              {/* Email Sent Message */}
              <div className="bg-white/10 border border-white/20 rounded-xl p-6 mb-6 text-center backdrop-blur-sm">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-400/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Mail className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <h4 className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2">
                  Check Your Email!
                </h4>
                <p className="text-blue-100 mb-4">
                  We have sent a verification email to{" "}
                  <strong className="text-yellow-400">{formData.email}</strong>
                </p>
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-4 backdrop-blur-sm">
                  <p className="text-sm text-blue-100">
                    <strong>Next Steps:</strong>
                  </p>
                  <ol className="text-sm text-blue-200 mt-2 space-y-1 text-left">
                    <li>1. Check your email inbox</li>
                    <li>2. Look for email from MyApproved All</li>
                    <li>3. Copy the 3-digit verification code</li>
                    <li>4. Enter it on the next page</li>
                  </ol>
                </div>
                <p className="text-sm text-blue-300">
                  Can not find the email? Check your spam folder or request a
                  new code.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full h-12 bg-brand-amber hover:bg-brand-amberDark hover:scale-105 transition-all duration-200 text-black text-base font-semibold rounded-xl shadow-lg"
                style={{ fontWeight: 800 }}
                >
                  <Link href={`/verify-captcha?email=${formData.email}`}>
                    Enter Verification Code
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full h-12 bg-white/10 border-2 border-white/20 hover:bg-white/20 hover:border-yellow-400/50 transition-all duration-200 text-white text-base font-semibold rounded-xl backdrop-blur-sm"
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-blue-100">
                  <strong>Note:</strong> Check your email inbox for the
                  verification code. If you do not see it, check your spam
                  folder.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
    return (
      <div className="relative min-h-screen bg-brand-slate flex flex-col items-center justify-center overflow-hidden -mt-[var(--header-height)] pt-[120px] sm:pt-[140px] pb-16">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, #F5A623 1px, transparent 1px), linear-gradient(to bottom, #F5A623 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F5A623] rounded-full blur-[150px] opacity-10" />

        <Section>
        <Container size="wide" className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left: Registration form */}
          <div className="order-1 md:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-blue-400/20 rounded-3xl blur-xl" />
            <Card className="relative rounded-3xl bg-sky-50 border border-gray-100 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-amber to-brand-amberDark rounded-t-3xl" />
                <div className="flex items-center justify-center mb-4">
                  <Link
                    href="/"
                    className="flex items-center text-brand-amber hover:text-brand-amberDark transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Home
                  </Link>
                </div>
                <div className="mx-auto mb-3 flex justify-center">
                  <SectionHeaderPill variant="navy">Approved Customers Only</SectionHeaderPill>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-brand-navy rounded-full flex items-center justify-center shadow-md">
                    <Image src="/logo-icon.svg" alt="MyApproved logo" width={40} height={40} className="w-10 h-10" />
                  </div>
                </div>
                <CardTitle className="text-[26px] sm:text-3xl font-bold tracking-tight text-brand-navy mb-1" style={{ fontWeight: 800 }}>
                  Create Client Account
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
            {errorMessage && (
              <Alert className="mb-6 border-red-400/50 bg-red-50">
                <AlertDescription className="text-red-700">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                  >
                    <User className="w-4 h-4 mr-2" />
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className={`h-12 text-base bg-white border-2 ${
                      errors.firstName
                        ? "border-red-400/50"
                        : "border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber"
                    } focus:ring-2 focus:ring-brand-amber/20 transition-all duration-200 rounded-xl text-brand-navy placeholder:text-gray-400`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="lastName"
                    className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={`h-12 text-base bg-white border-2 ${
                      errors.lastName
                        ? "border-red-400/50"
                        : "border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber"
                    } focus:ring-2 focus:ring-brand-amber/20 transition-all duration-200 rounded-xl text-brand-navy placeholder:text-gray-400`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label
                  htmlFor="email"
                  className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-12 text-base bg-white border-2 ${
                    errors.email
                      ? "border-red-400/50"
                      : "border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber"
                  } focus:ring-2 focus:ring-brand-amber/20 transition-all duration-200 rounded-xl text-brand-navy placeholder:text-gray-400`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label
                  htmlFor="phone"
                  className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`h-12 text-base bg-white border-2 ${
                    errors.phone
                      ? "border-red-400/50"
                      : "border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber"
                  } focus:ring-2 focus:ring-brand-amber/20 transition-all duration-200 rounded-xl text-brand-navy placeholder:text-gray-400`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="postcode"
                    className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Postcode *
                  </Label>
                  <Input
                    id="postcode"
                    type="text"
                    value={formData.postcode}
                    onChange={(e) =>
                      handleInputChange("postcode", e.target.value)
                    }
                    className={`h-12 text-base bg-white border-2 ${
                      errors.postcode
                        ? "border-red-400/50"
                        : "border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber"
                    } focus:ring-2 focus:ring-brand-amber/20 transition-all duration-200 rounded-xl text-brand-navy placeholder:text-gray-400`}
                    placeholder="Enter your postcode"
                  />
                  {errors.postcode && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.postcode}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="address"
                    className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Address *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className={`h-12 text-base bg-white border-2 ${
                      errors.address
                        ? "border-red-400/50"
                        : "border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber"
                    } focus:ring-2 focus:ring-brand-amber/20 transition-all duration-200 rounded-xl text-brand-navy placeholder:text-gray-400`}
                    placeholder="Enter your full address"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="password"
                    className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className={`h-12 text-base bg-white border-2 ${
                        errors.password
                          ? "border-red-400/50"
                          : "border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber"
                      } focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 rounded-2xl text-white placeholder:text-blue-200 backdrop-blur-sm pr-10`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="flex items-center mb-2 text-sm font-semibold text-brand-navy"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className={`h-12 text-base bg-white border-2 ${
                        errors.confirmPassword
                          ? "border-red-400/50"
                          : "border-gray-300 hover:border-brand-amber/50 focus:border-brand-amber"
                      } focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 rounded-2xl text-white placeholder:text-blue-200 backdrop-blur-sm pr-10`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-brand-navy transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-brand-amber hover:bg-brand-amberDark hover:scale-105 transition-all duration-200 text-black text-base font-semibold rounded-xl shadow-lg"
                style={{ fontWeight: 800 }}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/login/client"
                    className="text-brand-amber hover:text-brand-amberDark font-medium hover:underline"
                  >
                    Login here
                  </Link>
                </p>
              </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Hero-style feature cards */}
        <div className="order-2 md:order-2 flex flex-col gap-6 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 to-indigo-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-sky-50 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-amber to-brand-amberDark rounded-t-3xl" />
              <h2 className="text-xl font-extrabold text-brand-navy mb-4">Why Choose MyApproved</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shrink-0">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navyDark">Verified Professionals</p>
                    <p className="text-sm text-brand-navy/80">Identity, business and insurance checks passed before a pro is listed.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shrink-0">
                    <Star className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navyDark">Book With Confidence</p>
                    <p className="text-sm text-brand-navy/80">Compare quotes and book trusted local specialists in minutes.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 to-indigo-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-sky-50 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-amber to-brand-amberDark rounded-t-3xl" />
              <h3 className="text-xl font-extrabold text-brand-navy mb-3" style={{ fontWeight: 800 }}>Everything you need</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Secure messaging</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Quotes & bookings in one place</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">UK‑wide coverage</span></li>
              </ul>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 to-indigo-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-sky-50 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-amber to-brand-amberDark rounded-t-3xl" />
              <h3 className="text-xl font-extrabold text-brand-navy mb-3" style={{ fontWeight: 800 }}>Peace of mind</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Public liability insurance verified and kept current</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Clear pricing</span></li>
                <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Dedicated support</span></li>
              </ul>
            </div>
          </div>

          {/* How it works card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 to-indigo-600/20 rounded-3xl blur-xl" />
            <div className="relative bg-sky-50 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-amber to-brand-amberDark rounded-t-3xl" />
              <h3 className="text-xl font-extrabold text-brand-navy mb-4" style={{ fontWeight: 800 }}>How it works</h3>
              <ol className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-amber/20 border border-brand-amber/50 text-brand-amberDark text-xs font-bold backdrop-blur-sm">1</span>
                  <span className="text-brand-navy/80">Tell us what you need and your location</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-amber/20 border border-brand-amber/50 text-brand-amberDark text-xs font-bold backdrop-blur-sm">2</span>
                  <span className="text-brand-navy/80">Get matched with Approved pros</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-brand-amber/20 border border-brand-amber/50 text-brand-amberDark text-xs font-bold backdrop-blur-sm">3</span>
                  <span className="text-brand-navy/80">Compare quotes and book with confidence</span>
                </li>
              </ol>
            </div>
          </div>

          </div>
        </Container>
      </Section>
    </div>
  );
}
