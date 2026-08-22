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
  Wrench,
  Star,
  Briefcase,
  Upload,
  X,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import SectionHeaderPill from "@/components/ui/SectionHeaderPill";
import { Container } from "@/components/ui/Container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type SubscriptionPlan = "pay_per_lead" | "unlimited_monthly";

interface FormData {
  fullName: string;
  trade: string;
  email: string;
  phone: string;
  city: string;
  postcode: string;
  password: string;
  confirmPassword: string;
  yearsExperience: string;
  subscriptionPlan: SubscriptionPlan;
  terms: boolean;
}

interface FormErrors {
  fullName?: string;
  trade?: string;
  email?: string;
  phone?: string;
  city?: string;
  postcode?: string;
  password?: string;
  confirmPassword?: string;
  yearsExperience?: string;
  subscriptionPlan?: string;
  terms?: string;
}

const MAX_FILE_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB per document
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB total request budget

const trades = [
  "Plumber",
  "Electrician",
  "Builder",
  "Painter",
  "Roofer",
  "Gardener",
  "Tiler",
  "Carpenter",
  "Locksmith",
  "Cleaner",
  "Handyman",
  "Plasterer",
  "Flooring",
  "Kitchen Fitter",
  "Bathroom Fitter",
  "Window Cleaner",
  "Pest Control",
  "Appliance Repair",
  "HVAC",
  "Decorator",
  "Driveway",
  "Fencing",
  "Guttering",
  "Insulation",
  "Aircon Engineer",
  "Other",
];

const STEPS = ["Personal", "Business", "Documents", "Account", "Plan"] as const;

const inputClass = (
  hasError?: boolean
) => `h-12 text-base bg-white border-2 ${
  hasError
    ? "border-red-400"
    : "border-gray-200 hover:border-brand-amber/50 focus:border-brand-amber"
} focus:ring-2 focus:ring-brand-amber/20 transition-all duration-200 rounded-2xl text-brand-navy placeholder:text-gray-400`;

function FileUpload({
  id,
  label,
  file,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-semibold text-brand-navy mb-2 block">
        {label}
      </Label>
      <div className="relative">
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
          className="hidden"
          id={id}
        />
        <label
          htmlFor={id}
          className="flex items-center justify-center h-12 px-4 bg-white border-2 border-gray-200 hover:border-brand-amber/50 rounded-xl cursor-pointer transition-all text-gray-600 hover:text-brand-navy"
        >
          <Upload className="w-4 h-4 mr-2" />
          <span className="truncate">{file ? file.name : "Choose file"}</span>
        </label>
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 hover:text-red-600"
            aria-label={`Remove ${label}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function TradespersonRegistration() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    trade: "",
    email: "",
    phone: "",
    city: "",
    postcode: "",
    password: "",
    confirmPassword: "",
    yearsExperience: "",
    subscriptionPlan: "pay_per_lead",
    terms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(0);

  // Document upload states
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  const [qualificationDocument, setQualificationDocument] = useState<File | null>(null);
  const [tradeCardDocument, setTradeCardDocument] = useState<File | null>(null);
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [qualificationNumber, setQualificationNumber] = useState("");
  const [tradeCardNumber, setTradeCardNumber] = useState("");

  const needsTradeCard = ["Plumber", "Electrician", "Aircon Engineer"].includes(formData.trade);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value as never }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Validate only the fields belonging to the current step.
  const validateStep = (current: number): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

    if (current === 0) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      else if (formData.fullName.length < 2) newErrors.fullName = "Full name must be at least 2 characters";
      if (!formData.trade.trim()) newErrors.trade = "Trade/profession is required";
      if (!formData.yearsExperience) newErrors.yearsExperience = "Years of experience is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) newErrors.phone = "Please enter a valid phone number";
    }

    if (current === 1) {
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.postcode.trim()) newErrors.postcode = "Postcode is required";
      else if (formData.postcode.length < 5) newErrors.postcode = "Please enter a valid postcode";
    }

    if (current === 2) {
      if (!idDocument || !insuranceDocument || !qualificationDocument) {
        newErrors.fullName = "ID document, insurance document, and proof of qualifications are required.";
      } else if (!insuranceExpiry || !qualificationNumber) {
        newErrors.fullName = "Insurance expiry date and qualification number are required.";
      }
      if (needsTradeCard && !tradeCardDocument) {
        newErrors.fullName = "Trade card is required for your trade.";
      }
    }

    if (current === 3) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
        newErrors.password = "Password must contain uppercase, lowercase, and number";
      if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
      if (!formData.terms) newErrors.terms = "You must accept the terms and conditions";
    }

    if (current === 4) {
      if (
        formData.subscriptionPlan !== "pay_per_lead" &&
        formData.subscriptionPlan !== "unlimited_monthly"
      ) {
        newErrors.subscriptionPlan = "Please choose a subscription plan";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setErrorMessage("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setErrorMessage("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const validateDocuments = (): string | null => {
    if (!idDocument || !insuranceDocument || !qualificationDocument) {
      return "ID document, insurance document, and proof of qualifications are required for all tradespeople.";
    }
    if (needsTradeCard && !tradeCardDocument) {
      return "Trade card is required for Plumbers, Electricians, and Aircon Engineers.";
    }
    if (!insuranceExpiry || !qualificationNumber) {
      return "Insurance expiry date and qualification number are required.";
    }
    if (needsTradeCard && !tradeCardNumber) {
      return "Trade card number is required for this trade.";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Run full validation before submit in one consolidated pass.
    const docError = validateDocuments();
    if (docError) {
      setErrorMessage(docError);
      return;
    }

    const selectedDocs: File[] = [
      idDocument,
      insuranceDocument,
      qualificationDocument,
      ...(tradeCardDocument ? [tradeCardDocument] : []),
    ].filter((f): f is File => f !== null);

    const tooLarge = selectedDocs.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (tooLarge) {
      setErrorMessage(
        `File "${tooLarge.name}" is ${formatBytes(tooLarge.size)}. Maximum allowed per file is ${formatBytes(MAX_FILE_SIZE_BYTES)}. Please compress the file or upload a smaller JPG/PNG/PDF.`
      );
      return;
    }

    const totalBytes = selectedDocs.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      setErrorMessage(
        `Total upload size is ${formatBytes(totalBytes)}. Maximum allowed is ${formatBytes(MAX_TOTAL_UPLOAD_BYTES)}. Please use smaller files.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("trade", formData.trade);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("postcode", formData.postcode);
      formDataToSend.append("yearsExperience", formData.yearsExperience);
      formDataToSend.append("subscriptionPlan", formData.subscriptionPlan);

      if (idDocument) formDataToSend.append("idDocument", idDocument);
      if (insuranceDocument) formDataToSend.append("insuranceDocument", insuranceDocument);
      if (qualificationDocument) formDataToSend.append("qualificationDocument", qualificationDocument);
      if (tradeCardDocument) formDataToSend.append("tradeCardDocument", tradeCardDocument);

      formDataToSend.append("insuranceExpiry", insuranceExpiry);
      formDataToSend.append("qualificationNumber", qualificationNumber);
      if (tradeCardNumber) formDataToSend.append("tradeCardNumber", tradeCardNumber);

      const response = await fetch("/api/trades/register", {
        method: "POST",
        body: formDataToSend,
      });

      let data:
        | {
            error?: string;
            subscriptionPlan?: string;
          }
        | null = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => "");
        data = { error: text || undefined };
      }

      if (!response.ok) {
        if (response.status === 413) {
          setErrorMessage(
            "Registration documents are too large to upload in one request. Please upload smaller files (recommended: each under 1.5 MB)."
          );
          return;
        }
        setErrorMessage(data?.error || "Registration failed. Please try again.");
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="relative min-h-screen bg-brand-slate flex items-center justify-center p-6 overflow-hidden -mt-[var(--header-height)] pt-[120px] sm:pt-[140px] pb-16">
        <div className="relative z-10">
          <Card className="relative w-full max-w-2xl rounded-3xl bg-sky-50 border border-gray-100 shadow-xl">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-[#16A34A]/15 border border-[#16A34A]/30 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-8 h-8 text-[#16A34A]" />
                  </div>
                </div>
                <h2 className="text-3xl font-extrabold text-brand-navy mb-2" style={{fontWeight: 800}}>
                  Registration Successful!
                </h2>
                <p className="text-brand-navy mb-4">
                  Thank you for registering with MyApproved!
                </p>
                <p className="text-gray-600 text-sm mb-6">
                  Your account is approved. Log in now to view available jobs and start applying.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  asChild
                  className="w-full h-12 bg-brand-amber hover:bg-brand-amberDark hover:scale-105 transition-all duration-200 text-black text-base font-semibold rounded-xl shadow-lg"
                  style={{fontWeight: 800}}
                >
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-brand-slate flex flex-col items-center justify-center overflow-hidden -mt-[var(--header-height)] pt-[120px] sm:pt-[140px] pb-16">
      <Section>
        <Container size="wide" className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left: Registration form */}
          <div className="order-1 md:order-1 relative">
            <Card className="relative rounded-3xl bg-sky-50 border border-gray-100 shadow-xl">
              <CardHeader className="text-center pb-6">
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
                  <SectionHeaderPill variant="navy">Approved Tradespeople Only</SectionHeaderPill>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-brand-navy rounded-full flex items-center justify-center shadow-md">
                    <Image src="/logo-icon.svg" alt="MyApproved logo" width={40} height={40} className="w-10 h-10" />
                  </div>
                </div>
                <CardTitle className="text-[26px] sm:text-3xl font-extrabold text-brand-navy mb-1" style={{fontWeight: 800}}>
                  Create Tradesperson Account
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {errorMessage && (
                  <Alert className="mb-6 border-red-300 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* STEP 1 — Personal */}
                  {step === 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-extrabold text-brand-navy">Personal Information</h3>

                      <div>
                        <Label htmlFor="fullName" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                          <User className="w-4 h-4 mr-2" />
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className={inputClass(!!errors.fullName)}
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="trade" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                          <Wrench className="w-4 h-4 mr-2" />
                          Trade/Profession *
                        </Label>
                        <Select value={formData.trade} onValueChange={(value) => handleInputChange("trade", value)}>
                          <SelectTrigger className={`h-12 bg-white border-2 ${errors.trade ? "border-red-400" : "border-gray-200 hover:border-brand-amber/50"} text-brand-navy`}>
                            <SelectValue placeholder="Select your trade" />
                          </SelectTrigger>
                          <SelectContent>
                            {trades.map((trade) => (
                              <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.trade && (
                          <p className="text-red-600 text-sm mt-1">{errors.trade}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="yearsExperience" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                          <Briefcase className="w-4 h-4 mr-2" />
                          Years of Experience *
                        </Label>
                        <Select value={formData.yearsExperience} onValueChange={(value) => handleInputChange("yearsExperience", value)}>
                          <SelectTrigger className={`h-12 bg-white border-2 ${errors.yearsExperience ? "border-red-400" : "border-gray-200 hover:border-brand-amber/50"} text-brand-navy`}>
                            <SelectValue placeholder="Select years of experience" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, "20+"].map((years) => (
                              <SelectItem key={years} value={String(years)}>
                                {years} {years === 1 ? "year" : "years"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.yearsExperience && (
                          <p className="text-red-600 text-sm mt-1">{errors.yearsExperience}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                          <Mail className="w-4 h-4 mr-2" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={inputClass(!!errors.email)}
                          placeholder="Enter your email address"
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className={inputClass(!!errors.phone)}
                          placeholder="Enter your phone number"
                        />
                        {errors.phone && (
                          <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2 — Business */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-extrabold text-brand-navy">Business Information</h3>

                      <div>
                        <Label htmlFor="city" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                          <MapPin className="w-4 h-4 mr-2" />
                          City *
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className={inputClass(!!errors.city)}
                          placeholder="Enter your city"
                        />
                        {errors.city && (
                          <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="postcode" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                          <MapPin className="w-4 h-4 mr-2" />
                          Postcode *
                        </Label>
                        <Input
                          id="postcode"
                          type="text"
                          value={formData.postcode}
                          onChange={(e) => handleInputChange("postcode", e.target.value.toUpperCase())}
                          className={inputClass(!!errors.postcode)}
                          placeholder="Enter your postcode"
                        />
                        {errors.postcode && (
                          <p className="text-red-600 text-sm mt-1">{errors.postcode}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 3 — Documents */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-extrabold text-brand-navy">Required Documents</h3>
                      <p className="text-sm text-gray-600">All tradespeople must upload the following documents for verification:</p>

                      {errors.fullName && (
                        <Alert className="mb-2 border-red-300 bg-red-50">
                          <AlertDescription className="text-red-700">{errors.fullName}</AlertDescription>
                        </Alert>
                      )}

                      <FileUpload
                        id="idDocument"
                        label="ID Documents (Passport/Driving License) *"
                        file={idDocument}
                        onChange={setIdDocument}
                      />

                      <FileUpload
                        id="insuranceDocument"
                        label="Insurance Document *"
                        file={insuranceDocument}
                        onChange={setInsuranceDocument}
                      />

                      <div>
                        <Label htmlFor="insuranceExpiry" className="text-sm font-semibold text-brand-navy mb-2 block">
                          Insurance Expiry Date *
                        </Label>
                        <Input
                          id="insuranceExpiry"
                          type="date"
                          value={insuranceExpiry}
                          onChange={(e) => setInsuranceExpiry(e.target.value)}
                          className={inputClass()}
                        />
                      </div>

                      <FileUpload
                        id="qualificationDocument"
                        label="Proof of Qualifications *"
                        file={qualificationDocument}
                        onChange={setQualificationDocument}
                      />

                      <div>
                        <Label htmlFor="qualificationNumber" className="text-sm font-semibold text-brand-navy mb-2 block">
                          Qualification Number *
                        </Label>
                        <Input
                          id="qualificationNumber"
                          type="text"
                          value={qualificationNumber}
                          onChange={(e) => setQualificationNumber(e.target.value)}
                          className={inputClass()}
                          placeholder="Enter your qualification/certification number"
                        />
                      </div>

                      {needsTradeCard && (
                        <>
                          <FileUpload
                            id="tradeCardDocument"
                            label="Trade Card (Required for Plumbers, Electricians, Aircon Engineers) *"
                            file={tradeCardDocument}
                            onChange={setTradeCardDocument}
                          />

                          <div>
                            <Label htmlFor="tradeCardNumber" className="text-sm font-semibold text-brand-navy mb-2 block">
                              Trade Card Number *
                            </Label>
                            <Input
                              id="tradeCardNumber"
                              type="text"
                              value={tradeCardNumber}
                              onChange={(e) => setTradeCardNumber(e.target.value)}
                              className={inputClass()}
                              placeholder="Enter your trade card number"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* STEP 4 — Account */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-extrabold text-brand-navy">Account Setup</h3>

                      <div>
                        <Label htmlFor="password" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                          <Lock className="w-4 h-4 mr-2" />
                          Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className={`${inputClass(!!errors.password)} pr-10`}
                            placeholder="Create a strong password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-brand-navy transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with uppercase, lowercase, and number</p>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="flex items-center mb-2 text-sm font-semibold text-brand-navy">
                          <Lock className="w-4 h-4 mr-2" />
                          Confirm Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            className={`${inputClass(!!errors.confirmPassword)} pr-10`}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-brand-navy transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <div className="flex items-start gap-2 pt-2">
                        <Checkbox
                          id="terms"
                          checked={formData.terms}
                          onCheckedChange={(checked) => handleInputChange("terms", checked === true)}
                          className="mt-1"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600">
                          I agree to the{" "}
                          <Link href="/terms" className="text-brand-amber hover:text-brand-amberDark underline">
                            Terms and Conditions
                          </Link>
                        </label>
                      </div>
                      {errors.terms && (
                        <p className="text-red-600 text-sm mt-1">{errors.terms}</p>
                      )}
                    </div>
                  )}

                  {/* STEP 5 — Plan */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-extrabold text-brand-navy">
                        Choose Your Plan
                      </h3>
                      <p className="text-sm text-gray-600">
                        Pick how you want to pay for the leads MyApproved sends you. You can change this later from your dashboard.
                      </p>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {/* Pay Per Lead */}
                        <button
                          type="button"
                          onClick={() => handleInputChange("subscriptionPlan", "pay_per_lead")}
                          aria-pressed={formData.subscriptionPlan === "pay_per_lead"}
                          className={`relative text-left rounded-xl p-4 border-2 transition-all ${
                            formData.subscriptionPlan === "pay_per_lead"
                              ? "border-brand-amber bg-brand-amber/10 shadow-xl ring-2 ring-brand-amber/40"
                              : "border-gray-200 bg-gray-50 hover:border-brand-amber/50"
                          }`}
                        >
                          <span
                            className={`absolute -top-2 left-3 inline-flex items-center gap-1 rounded-full text-[10px] font-bold px-2 py-0.5 shadow ${
                              formData.subscriptionPlan === "pay_per_lead"
                                ? "bg-brand-amber text-black"
                                : "bg-brand-navy text-white"
                            }`}
                          >
                            Recommended · Free
                          </span>
                          <div className="flex items-center justify-between mb-1 mt-2">
                            <span className="text-sm font-semibold text-brand-navy">Pay Per Lead</span>
                            {formData.subscriptionPlan === "pay_per_lead" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-navy">
                                <CheckCircle className="w-4 h-4" /> Selected
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-500">Tap to select</span>
                            )}
                          </div>
                          <div className="text-2xl font-extrabold text-brand-navy">
                            Free<span className="text-sm font-medium text-gray-600"> to join</span>
                          </div>
                          <div className="mt-1 text-sm text-brand-amber font-semibold">
                            £4.99 per lead
                          </div>
                          <ul className="mt-3 space-y-1 text-xs text-gray-600">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-[#16A34A] flex-shrink-0" />
                              <span>No card needed at signup</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-[#16A34A] flex-shrink-0" />
                              <span>Pay £4.99 only when you unlock a lead</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-[#16A34A] flex-shrink-0" />
                              <span>Cancel anytime</span>
                            </li>
                          </ul>
                        </button>

                        {/* Unlimited Monthly */}
                        <button
                          type="button"
                          onClick={() => handleInputChange("subscriptionPlan", "unlimited_monthly")}
                          aria-pressed={formData.subscriptionPlan === "unlimited_monthly"}
                          className={`relative text-left rounded-xl p-4 border-2 transition-all ${
                            formData.subscriptionPlan === "unlimited_monthly"
                              ? "border-brand-amber bg-brand-amber/10 shadow-xl ring-2 ring-brand-amber/40"
                              : "border-gray-200 bg-gray-50 hover:border-brand-amber/50"
                          }`}
                        >
                          <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-brand-navy text-white text-[10px] font-bold px-2 py-0.5 shadow">
                            Heavy users
                          </span>
                          <div className="flex items-center justify-between mb-1 mt-2">
                            <span className="text-sm font-semibold text-brand-navy">Unlimited</span>
                            {formData.subscriptionPlan === "unlimited_monthly" ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-navy">
                                <CheckCircle className="w-4 h-4" /> Selected
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-500">Tap to select</span>
                            )}
                          </div>
                          <div className="text-2xl font-extrabold text-brand-navy">
                            £1,000<span className="text-sm font-medium text-gray-600">/month</span>
                          </div>
                          <div className="mt-1 text-sm text-brand-amber font-semibold">
                            Unlimited leads
                          </div>
                          <ul className="mt-3 space-y-1 text-xs text-gray-600">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-[#16A34A] flex-shrink-0" />
                              <span>All the leads you can handle</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-[#16A34A] flex-shrink-0" />
                              <span>No per-lead fees</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-3.5 h-3.5 mt-0.5 text-[#16A34A] flex-shrink-0" />
                              <span>Priority placement in search</span>
                            </li>
                          </ul>
                        </button>
                      </div>

                      {formData.subscriptionPlan === "unlimited_monthly" ? (
                        <div className="rounded-xl border border-brand-amber/40 bg-brand-amber/10 p-3 text-sm text-brand-navy">
                          <strong className="block text-brand-navy">Heads up:</strong>
                          You are selecting the Unlimited plan at{" "}
                          <strong>£1,000 / month</strong>. After signup, GoHighLevel will
                          handle your payment and invoicing.{" "}
                          <button
                            type="button"
                            onClick={() => handleInputChange("subscriptionPlan", "pay_per_lead")}
                            className="underline font-semibold hover:text-brand-amberDark"
                          >
                            Switch to the free Pay Per Lead plan instead
                          </button>
                          .
                        </div>
                      ) : (
                        <div className="rounded-xl border border-[#16A34A]/30 bg-[#16A34A]/10 p-3 text-sm text-brand-navy">
                          <strong className="block text-[#16A34A]">No payment at signup.</strong>
                          Your account will be created on the free Pay Per Lead plan.
                          You will only be charged <strong>£4.99</strong> per lead
                          you choose to unlock - no card details needed today.
                        </div>
                      )}

                      {errors.subscriptionPlan && (
                        <p className="text-red-600 text-sm">{errors.subscriptionPlan}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Billing is managed by GoHighLevel. No payment details are collected at signup.
                      </p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3 pt-2">
                    {step > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        className="h-12 px-6 rounded-xl text-brand-navy border-gray-300 hover:bg-gray-50 flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    )}

                    {step < STEPS.length - 1 ? (
                      <Button
                        type="button"
                        onClick={goNext}
                        className="h-12 bg-brand-amber hover:bg-brand-amberDark hover:scale-105 transition-all duration-200 text-black text-base font-semibold rounded-xl shadow-lg flex-1"
                        style={{fontWeight: 800}}
                      >
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-12 bg-brand-amber hover:bg-brand-amberDark hover:scale-105 transition-all duration-200 text-black text-base font-semibold rounded-xl shadow-lg flex-1"
                        style={{fontWeight: 800}}
                      >
                        {isLoading
                          ? formData.subscriptionPlan === "unlimited_monthly"
                            ? "Redirecting to secure payment..."
                            : "Creating Account..."
                          : formData.subscriptionPlan === "unlimited_monthly"
                          ? "Create Account & Pay £1,000 / month"
                          : "Create Free Account"}
                      </Button>
                    )}
                  </div>

                  {/* Login Link */}
                  <div className="text-center">
                    <p className="text-gray-600">
                      Already have an account?{" "}
                      <Link
                        href="/login/trade"
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
                <h2 className="text-xl font-extrabold text-brand-navy mb-4" style={{fontWeight: 800}}>Grow Your Business</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shrink-0">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-navyDark">Reach Verified Customers</p>
                      <p className="text-sm text-brand-navy/80">Join a trusted network of customers who value approved pros.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shrink-0">
                      <Star className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-navyDark">Build Your Reviews</p>
                      <p className="text-sm text-brand-navy/80">Collect ratings that help you win more local work.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shrink-0">
                      <Briefcase className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-navyDark">Manage Jobs Neatly</p>
                      <p className="text-sm text-brand-navy/80">Respond to requests and track work from one dashboard.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 to-indigo-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-sky-50 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-amber to-brand-amberDark rounded-t-3xl" />
                <h3 className="text-xl font-extrabold text-brand-navy mb-3" style={{fontWeight: 800}}>Everything you need</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Secure messaging</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Quotes & bookings in one place</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">UK-wide coverage</span></li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/20 to-indigo-600/20 rounded-3xl blur-xl" />
              <div className="relative bg-sky-50 backdrop-blur-md rounded-3xl border border-gray-100 p-6 shadow-xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-amber to-brand-amberDark rounded-t-3xl" />
                <h3 className="text-xl font-extrabold text-brand-navy mb-3" style={{fontWeight: 800}}>Peace of mind</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Approved & insured pros</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Clear pricing</span></li>
                  <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-brand-amber" /> <span className="text-brand-navy/80">Dedicated support</span></li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
