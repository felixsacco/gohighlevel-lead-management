"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Switch } from "@/components/ui/switch";
import {
  LogOut,
  CheckCircle,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Search,
  Filter,
  Clock,
  Star,
  RefreshCw,
  MessageCircle,
  Wrench,
  TrendingUp,
  Shield,
  Eye,
  Plus,
  X,
  Bell,
  Phone,
  Mail,
  Flag,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import DatabaseChatSystem from "@/components/DatabaseChatSystem";
import AISupportChat from "@/components/AISupportChat";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  type: string;
}

interface Job {
  id: string;
  trade: string;
  job_description: string;
  postcode: string;
  budget: number;
  budget_type: string;
  preferred_date: string;
  status: string;
  is_approved: boolean;
  created_at: string;
  distance: number;
  distanceText: string;
  images?: string[];
  clients: {
    id?: string;
    first_name: string;
    last_name: string;
    email?: string;
    profile_photo_url?: string | null;
  };
  is_completed?: boolean;
  completed_at?: string;
  completed_by?: string;
  client_rating?: number;
  client_review?: string;
  job_reviews?: {
    id: string;
    tradesperson_id: string;
    reviewer_type: string;
    reviewer_id: string;
    rating: number;
    review_text: string;
    reviewed_at: string;
  }[];
}

export default function TradespersonDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tradesperson, setTradesperson] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [inProgressJobs, setInProgressJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("available");
  const [showChat, setShowChat] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(10);
  const [notifyMe, setNotifyMe] = useState<boolean>(false);
  const [highlightBell, setHighlightBell] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [applicationData, setApplicationData] = useState({
    quotation_amount: "",
    quotation_notes: "",
  });
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [quotationAmount, setQuotationAmount] = useState("");
  const [quotationNotes, setQuotationNotes] = useState("");
  const [applying, setApplying] = useState(false);
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [dashboardSummary, setDashboardSummary] = useState<{
    pendingAwaitingCustomer: number;
    inProgressJobs: number;
  } | null>(null);

  // AI suggestions for job applications
  const getAISuggestions = (trade: string, jobDescription: string) => {
    const suggestions = {
      'Electrical': [
        "I'll start by conducting a thorough site survey to assess the wall structure and identify the best locations for the new sockets. I'll use a cable detector to locate existing wiring and ensure safe installation routes. All work will be completed to BS 7671 standards with proper earthing and RCD protection. I'll provide a full electrical safety certificate upon completion. Timeline: 1 day.",
        "As a qualified electrician with [X] years experience, I'll install your 3 new power sockets using high-quality materials and proper cable management. I'll ensure minimal disruption to your living space and clean up thoroughly after completion. All work comes with a 12-month guarantee and will be tested and certified to current regulations.",
        "I'll carefully plan the socket positions to maximize convenience while maintaining safety standards. Using proper chasing techniques for plasterboard walls, I'll run new circuits from your consumer unit with appropriate cable sizing. Each socket will be properly earthed and tested. I can complete this work efficiently in one day with minimal mess."
      ],
      'Plumbing': [
        "I'll assess your current plumbing system and provide the most cost-effective solution. Using quality materials and proper pipe sizing, I'll ensure excellent water pressure and long-lasting results. All joints will be pressure tested and I'll provide a guarantee on workmanship. I can typically complete this type of work within [timeframe] with minimal disruption.",
        "With [X] years of plumbing experience, I'll handle your project professionally from start to finish. I'll protect your property during work, use dust sheets, and clean up thoroughly. All work will comply with current building regulations and I'll provide certification where required. Materials included in quote.",
        "I'll start with a detailed assessment to understand your specific requirements. Using modern techniques and quality fittings, I'll ensure a professional finish that lasts. I carry full insurance and all work comes with a comprehensive guarantee. I can work around your schedule to minimize inconvenience."
      ],
      'General': [
        "I'll approach this job with careful planning and attention to detail. Using quality materials and proven techniques, I'll ensure excellent results that exceed your expectations. I'll keep you informed throughout the process and ensure minimal disruption to your daily routine. All work comes with a guarantee.",
        "With extensive experience in [trade], I understand the importance of quality workmanship and customer satisfaction. I'll complete your project efficiently while maintaining the highest standards. I carry full insurance and can provide references from recent similar projects.",
        "I'll provide a professional service from initial assessment through to completion. Using the right tools and materials for the job, I'll ensure lasting results. I'll work cleanly and efficiently, respecting your property and schedule. Happy to discuss any specific requirements you may have."
      ]
    };
    
    return suggestions[trade as keyof typeof suggestions] || suggestions.General;
  };

  // Calculate completion percentage
  const calculateCompletionPercentage = () => {
    let score = 0;
    const maxScore = 100;
    
    // Quotation amount (40 points)
    if (quotationAmount && parseFloat(quotationAmount) > 0) {
      score += 40;
    }
    
    // Notes length and quality (60 points)
    if (quotationNotes) {
      const charCount = quotationNotes.trim().length;
      const wordCount = quotationNotes.trim().split(/\s+/).length;
      const hasKeywords = /\b(experience|guarantee|quality|professional|timeline|approach|materials|certified?|insured?|years?)\b/i.test(quotationNotes);
      const hasSpecifics = /\b(\d+\s*(day|hour|week)|timeline|schedule|complete|finish)\b/i.test(quotationNotes);
      
      // Character/Length scoring (0-30 points) - reaches max at 200 characters
      if (charCount >= 200) score += 30;
      else if (charCount >= 150) score += 25;
      else if (charCount >= 100) score += 20;
      else if (charCount >= 50) score += 15;
      else if (charCount >= 20) score += 10;
      else if (charCount >= 10) score += 5;
      
      // Quality scoring (0-30 points)
      if (hasKeywords) score += 15;
      if (hasSpecifics) score += 15;
    }
    
    return Math.min(score, maxScore);
  };

  // Update completion percentage when inputs change
  useEffect(() => {
    const percentage = calculateCompletionPercentage();
    setCompletionPercentage(percentage);
  }, [quotationAmount, quotationNotes]);
  const [approvedQuoteRequests, setApprovedQuoteRequests] = useState<any[]>([]);
  const [quoteSubmittingId, setQuoteSubmittingId] = useState<string | null>(
    null
  );
  const [quoteAmountById, setQuoteAmountById] = useState<
    Record<string, string>
  >({});
  const [quoteNotesById, setQuoteNotesById] = useState<Record<string, string>>(
    {}
  );
  const [approvedQuoteBanner, setApprovedQuoteBanner] = useState<{
    customerName: string;
    amount?: number;
  } | null>(null);
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [selectedJobForFlag, setSelectedJobForFlag] = useState<Job | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagging, setFlagging] = useState(false);
  const [tpActivitySummary, setTpActivitySummary] = useState<{
    pendingAwaitingCustomer: number;
    inProgressJobs: number;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login/trade");
      return;
    }

    const userObj = JSON.parse(userData);
    if (userObj.type !== "tradesperson") {
      router.push("/login/trade");
      return;
    }

    setUser(userObj);
    loadTradespersonData(userObj.id);
    const savedNotify = localStorage.getItem("tp_notify_me");
    if (savedNotify) setNotifyMe(savedNotify === "true");

    // Add event listener to refresh data when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && userObj) {
        loadTradespersonData(userObj.id);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  useEffect(() => {
    // Close notifications dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest(".notification-dropdown") &&
        !target.closest(".notification-button")
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Auto-refresh chat unread count every 10 seconds
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(() => {
        loadChatUnreadCount(user.id);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // Load chat unread count
  const loadChatUnreadCount = async (userId: string) => {
    try {
      const response = await fetch(
        `/api/chat/unread-count?userId=${userId}&userType=tradesperson`
      );
      const data = await response.json();

      if (response.ok) {
        setChatUnreadCount(data.unreadCount || 0);
      } else {
        console.error("Failed to load chat unread count:", data.error);
      }
    } catch (error) {
      console.error("Error loading chat unread count:", error);
    }
  };

  const loadDashboardSummary = async (userId: string) => {
    try {
      const res = await fetch(
        `/api/tradesperson/dashboard-summary?userId=${encodeURIComponent(userId)}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as {
        pendingAwaitingCustomer?: number;
        inProgressJobs?: number;
      };
      if (res.ok) {
        setDashboardSummary({
          pendingAwaitingCustomer: Number(data.pendingAwaitingCustomer ?? 0),
          inProgressJobs: Number(data.inProgressJobs ?? 0),
        });
      }
    } catch {
      // non-blocking
    }
  };

  const loadTradespersonData = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/trade-data/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setTradesperson(data.tradesperson);
        // initialize radius and avatar from profile/local
        if (typeof data.tradesperson?.search_radius_km === "number") {
          setSearchRadiusKm(data.tradesperson.search_radius_km);
        }
        try {
          const local = localStorage.getItem("tp_avatar_" + data.tradesperson?.id);
          if (local) setAvatarUrl(local);
          else if (data.tradesperson?.profile_picture_url) setAvatarUrl(data.tradesperson.profile_picture_url);
        } catch {}

        // Load all data in parallel (no user-facing error on partial failure)
        console.log("Starting to load dashboard data...");

        await Promise.allSettled([
          loadAppliedJobs(userId).then(() =>
            console.log("Applied jobs loaded")
          ),
          loadInProgressJobs(userId).then(() =>
            console.log("In-progress jobs loaded")
          ),
          loadCompletedJobs(userId).then(() =>
            console.log("Completed jobs loaded")
          ),
          loadFilteredJobs({...data.tradesperson, id: userId}).then(() =>
            console.log("Filtered jobs loaded")
          ),
          loadNotifications(userId).then(() =>
            console.log("Notifications loaded")
          ),
          loadChatUnreadCount(userId).then(() =>
            console.log("Chat unread count loaded")
          ),
          loadApprovedQuoteRequests(userId).then(() =>
            console.log("Approved quote requests loaded")
          ),
          loadQuoteApprovals(userId).then(() =>
            console.log("Quote approvals loaded")
          ),
          loadDashboardSummary(userId).then(() =>
            console.log("Dashboard summary loaded")
          ),
        ]);

        console.log("Dashboard data load finished");
      } else {
        console.error("Failed to load tradesperson data:", data.error);
        // Don't show blocking error – dashboard can still show jobs/notifications; user can refresh
      }
    } catch (err) {
      // Log only – don't show "Failed to load dashboard data" so the dashboard still renders with whatever loaded
      console.error("Error loading tradesperson/dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAppliedJobs = async (tradespersonId: string) => {
    try {
      const { data: applications, error } = await supabase
        .from("job_applications")
        .select(
          `
          *,
          jobs (
            id,
            trade,
            job_description,
            postcode,
            budget,
            budget_type,
            preferred_date,
            images,
            clients (
              first_name,
              last_name,
              email,
              profile_photo_url
            )
          )
        `
        )
        .eq("tradesperson_id", tradespersonId)
        .order("applied_at", { ascending: false });

      if (error) {
        console.error("Error loading applied jobs:", error);
        return;
      }

      setAppliedJobs(applications || []);
    } catch (err) {
      console.error("Error in loadAppliedJobs:", err);
    }
  };

  const loadInProgressJobs = async (tradespersonId: string) => {
    try {
      const { data: inProgressJobs, error } = await supabase
        .from("jobs")
        .select(
          `
          *,
          clients (
            first_name,
            last_name,
            email,
            profile_photo_url
          )
        `
        )
        .eq("assigned_tradesperson_id", tradespersonId)
        .eq("application_status", "in_progress")
        .is("completed_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading in-progress jobs:", error);
        return;
      }

      setInProgressJobs(inProgressJobs || []);
    } catch (err) {
      console.error("Error in loadInProgressJobs:", err);
    }
  };

  const loadCompletedJobs = async (tradespersonId: string) => {
    try {
      const { data: completedJobs, error } = await supabase
        .from("jobs")
        .select(
          `
          *,
          clients (
            id,
            first_name,
            last_name,
            email,
            profile_photo_url
          ),
          job_reviews (
            id,
            tradesperson_id,
            reviewer_type,
            reviewer_id,
            rating,
            review_text,
            reviewed_at
          )
        `
        )
        .eq("assigned_tradesperson_id", tradespersonId)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error loading completed jobs:", error);
        return;
      }

      // Reviews linked to this TP, or client reviews on the job before tradesperson_id was set
      const filteredCompletedJobs =
        completedJobs?.map((job) => {
          const fromTable =
            job.job_reviews?.filter((review: any) => {
              if (review.tradesperson_id === tradespersonId) return true;
              const rt = String(review.reviewer_type || "").toLowerCase();
              if (rt === "client" && !review.tradesperson_id) return true;
              return false;
            }) || [];

          let job_reviews = fromTable;
          if (
            job_reviews.length === 0 &&
            typeof job.client_rating === "number" &&
            job.client_rating >= 1 &&
            String(job.client_review || "").trim().length > 0
          ) {
            job_reviews = [
              {
                id: `from-job-row-${job.id}`,
                tradesperson_id: tradespersonId,
                reviewer_type: "client",
                reviewer_id: job.clients?.id || "",
                rating: job.client_rating,
                review_text: String(job.client_review).trim(),
                reviewed_at:
                  job.review_submitted_at ||
                  job.completed_at ||
                  "",
              },
            ];
          }

          return { ...job, job_reviews };
        }) || [];

      setCompletedJobs(filteredCompletedJobs);
    } catch (err) {
      console.error("Error in loadCompletedJobs:", err);
    }
  };

  // Client-side filter to ensure applied jobs are excluded
  const filterOutAppliedJobs = async (jobs: any[], tradespersonId: string) => {
    try {
      const { data: applications, error } = await supabase
        .from("job_applications")
        .select("job_id")
        .eq("tradesperson_id", tradespersonId);

      if (error) {
        console.error("Error getting applications for filtering:", error);
        return jobs; // Return original jobs if we can't filter
      }

      const appliedJobIds = applications?.map(app => app.job_id) || [];
      console.log(`Client-side filtering: excluding ${appliedJobIds.length} applied jobs:`, appliedJobIds);
      
      return jobs.filter(job => !appliedJobIds.includes(job.id));
    } catch (err) {
      console.error("Error in client-side filtering:", err);
      return jobs; // Return original jobs if filtering fails
    }
  };

  const loadFilteredJobs = async (tradespersonData: any) => {
    try {
      console.log("Loading filtered jobs for tradesperson:", {
        id: tradespersonData.id,
        trade: tradespersonData.trade,
        postcode: tradespersonData.postcode,
      });
      console.log("Full tradesperson data object:", tradespersonData);

      // Check if we have a valid tradesperson ID
      const tradespersonId = tradespersonData.id || tradespersonData.user_id || '';
      console.log("Using tradesperson ID:", tradespersonId);

      // Try the new approved jobs API first
      const apiUrl = `/api/jobs/tradesperson?trade=${tradespersonData.trade}&location=${tradespersonData.postcode}&tradespersonId=${tradespersonId}&page=1&limit=50`;
      console.log("API URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok) {
        console.log(`Loaded ${data.data?.jobs?.length || 0} approved jobs`);
        
        // Additional client-side filter to ensure applied jobs are excluded
        const availableJobs = data.data?.jobs || [];
        const filteredJobs = await filterOutAppliedJobs(availableJobs, tradespersonData.id);
        console.log(`After client-side filtering: ${filteredJobs.length} jobs (excluded applied jobs)`);
        
        setJobs(filteredJobs);
      } else {
        console.error("Error loading approved jobs:", data.error);
        // Fallback to old API if new one fails
        const fallbackResponse = await fetch(
          `/api/jobs/filtered?trade=${tradespersonData.trade}&postcode=${tradespersonData.postcode}&tradespersonId=${tradespersonData.id}`
        );
        const fallbackData = await fallbackResponse.json();

        if (fallbackResponse.ok) {
          console.log(`Loaded ${fallbackData.jobs?.length || 0} filtered jobs (fallback)`);
          
          // Apply client-side filtering to fallback results too
          const fallbackJobs = fallbackData.jobs || [];
          const filteredFallbackJobs = await filterOutAppliedJobs(fallbackJobs, tradespersonData.id);
          console.log(`After fallback filtering: ${filteredFallbackJobs.length} jobs`);
          
          setJobs(filteredFallbackJobs);
        } else {
          console.error("Error loading filtered jobs:", fallbackData.error);
        }
      }
    } catch (err) {
      console.error("Error in loadFilteredJobs:", err);
    }
  };

  const loadApprovedQuoteRequests = async (tradespersonId: string) => {
    try {
      const res = await fetch(
        `/api/tradesperson/quote-requests?tradespersonId=${tradespersonId}&ts=${Date.now()}`,
        { cache: "no-store" } as RequestInit
      );
      const data = await res.json();
      if (res.ok) {
        setApprovedQuoteRequests(data.quoteRequests || []);
      } else {
        console.error("Failed to load approved quote requests:", data.error);
      }
    } catch (err) {
      console.error("Error loading approved quote requests:", err);
    }
  };

  const loadQuoteApprovals = async (tradespersonId: string) => {
    try {
      const { data: quotes, error } = await supabase
        .from("quotes")
        .select(
          `id, quote_amount, status, created_at, quote_requests:quote_request_id ( customer_name )`
        )
        .eq("tradesperson_id", tradespersonId)
        .eq("status", "client_approved")
        .order("created_at", { ascending: false })
        .limit(1);
      if (!error && quotes && quotes.length > 0) {
        const q = quotes[0] as any;
        setApprovedQuoteBanner({
          customerName: q.quote_requests?.customer_name || "client",
          amount: q.quote_amount,
        });
      }
    } catch (e) {
      // ignore
    }
  };

  const handleApplyToJob = (job: Job) => {
    setSelectedJob(job);
    setQuotationAmount("");
    setQuotationNotes("");
    setShowApplicationDialog(true);
  };

  const handleFlagJob = (job: Job) => {
    setSelectedJobForFlag(job);
    setFlagReason("");
    setShowFlagDialog(true);
  };

  const submitFlagJob = async () => {
    if (!selectedJobForFlag || !user?.id) {
      setError("Unable to flag job. Please log in and try again.");
      return;
    }

    if (flagReason.trim().length < 10) {
      setError("Please provide a detailed reason (at least 10 characters)");
      return;
    }

    setFlagging(true);
    setError("");

    try {
      const response = await fetch("/api/jobs/flag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJobForFlag.id,
          flagReason: flagReason.trim(),
          userId: user.id,
          userType: 'tradesperson',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Job flagged successfully. Admin will review your concern.");
        setShowFlagDialog(false);
        setFlagReason("");
        setSelectedJobForFlag(null);
        
        // Refresh jobs list to remove flagged job
        if (tradesperson) {
          await loadFilteredJobs({...tradesperson, id: user?.id || tradesperson.id});
        }
      } else {
        setError(result.message || "Failed to flag job");
      }
    } catch (err) {
      console.error("Error flagging job:", err);
      setError("Failed to flag job. Please try again.");
    } finally {
      setFlagging(false);
    }
  };

  const submitApplication = async () => {
    if (!selectedJob || !user) return;

    if (!quotationAmount || parseFloat(quotationAmount) <= 0) {
      setError("Please enter a valid quotation amount");
      return;
    }

    if (!quotationNotes.trim()) {
      setError("Please describe how you'll complete this job - this helps you win more jobs!");
      return;
    }

    setApplying(true);
    setError("");

    try {
      const response = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJob.id,
          tradespersonId: user.id,
          quotationAmount: parseFloat(quotationAmount),
          quotationNotes: quotationNotes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Application submitted successfully!");
        setShowApplicationDialog(false);
        setQuotationAmount("");
        setQuotationNotes("");
        setSelectedJob(null);

        // Refresh the jobs list to remove the applied job from Available
        if (tradesperson) {
          await loadFilteredJobs({...tradesperson, id: user?.id || tradesperson.id});
          await loadAppliedJobs(user.id);
          await loadDashboardSummary(user.id);
        }
      } else {
        setError(data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      setError("Failed to submit application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userType");
    router.push("/login/trade");
  };

  // Update radius in profile and reload jobs
  const updateSearchRadius = async (radius: number) => {
    try {
      setSearchRadiusKm(radius);
      if (!tradesperson?.id) return;
      await supabase
        .from("tradespeople")
        .update({ search_radius_km: radius })
        .eq("id", tradesperson.id);
      // Reload jobs (backend can use radius via tradespersonId)
      await loadFilteredJobs({ ...tradesperson, id: user?.id || tradesperson.id, search_radius_km: radius });
    } catch (e) {
      console.error("Failed to update search radius", e);
    }
  };

  // Avatar upload to Supabase storage (fallback to local)
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tradesperson?.id) return;
    try {
      setUploadingAvatar(true);
      const path = `avatars/${tradesperson.id}-${Date.now()}.jpg`;
      const { data: up, error: upErr } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("documents").getPublicUrl(path);
      const url = pub?.publicUrl || null;
      if (url) {
        await supabase.from("tradespeople").update({ profile_picture_url: url }).eq("id", tradesperson.id);
        setAvatarUrl(url);
      }
    } catch (err) {
      console.error("Avatar upload failed, falling back to local", err);
      // Fallback: local preview only
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAvatarUrl(dataUrl);
        try {
          localStorage.setItem("tp_avatar_" + tradesperson.id, dataUrl);
        } catch {}
      };
      reader.readAsDataURL(file as File);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const refreshNotifications = async () => {
    if (user) {
      await loadNotifications(user.id);
    }
  };

  const loadNotifications = async (tradespersonId: string) => {
    try {
      // Load unread chat messages
      // Get chat rooms for this tradesperson
      const { data: chatRooms, error: roomsError } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("tradesperson_id", tradespersonId);

      if (roomsError) {
        console.error("Error loading chat rooms:", roomsError);
      }

      let chatMessages = [];
      if (chatRooms && chatRooms.length > 0) {
        const roomIds = chatRooms.map((room) => room.id);

        // Get unread messages where tradesperson is not the sender
        const { data: messages, error: chatError } = await supabase
          .from("chat_messages")
          .select(
            `
            *,
            chat_rooms (
              jobs (
                trade,
                job_description
              )
            )
          `
          )
          .in("chat_room_id", roomIds)
          .neq("sender_id", tradespersonId)
          .eq("is_read", false);

        if (chatError) {
          console.error("Error loading chat notifications:", chatError);
        } else {
          chatMessages = messages || [];
        }
      }

      // Load job application status changes (recent)
      let applicationUpdates = [];
      try {
        const { data: apps, error: appError } = await supabase
          .from("job_applications")
          .select(
            `
            *,
            jobs (
              trade,
              job_description,
              postcode
            )
          `
          )
          .eq("tradesperson_id", tradespersonId)
          .in("status", ["accepted", "rejected"])
          .gte(
            "applied_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ); // Last 7 days

        if (appError) {
          console.error("Error loading application updates:", appError);
        } else {
          applicationUpdates = apps || [];
        }
      } catch (error) {
        console.error("Error in application updates query:", error);
      }

      // Load new job matches (jobs that match tradesperson's trade and location)
      let newJobs = [];
      try {
        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .eq("trade", tradesperson?.trade)
          .eq("is_approved", true)
          .eq("status", "approved")
          .eq("application_status", "open")
          .gte(
            "created_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          ); // Last 24 hours

        if (jobsError) {
          console.error("Error loading new job notifications:", jobsError);
        } else {
          newJobs = jobs || [];
        }
      } catch (error) {
        console.error("Error in new jobs query:", error);
      }

      // In-app job notifications (fired when job is posted – instant alerts)
      type JobNotifRow = {
        id: string;
        job_id: string;
        title: string | null;
        message: string | null;
        created_at: string;
        jobs?: { id: string; trade: string; postcode: string; budget?: number } | { id: string; trade: string; postcode: string; budget?: number }[] | null;
      };
      let jobNotificationRows: JobNotifRow[] = [];
      try {
        const { data: rows, error: notifError } = await supabase
          .from("job_notifications")
          .select("id, job_id, title, message, created_at, jobs(id, trade, postcode, budget)")
          .eq("tradesperson_id", tradespersonId)
          .eq("is_read", false)
          .order("created_at", { ascending: false })
          .limit(50);

        if (!notifError && rows) {
          jobNotificationRows = rows as JobNotifRow[];
        }
      } catch (error) {
        console.error("Error loading job_notifications:", error);
      }

      // Load completed jobs where tradesperson was assigned
      let completedJobs = [];
      try {
        const { data: jobs, error: completedError } = await supabase
          .from("jobs")
          .select("*")
          .eq("assigned_tradesperson_id", tradespersonId)
          .not("completed_at", "is", null)
          .gte(
            "completed_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ); // Last 7 days

        if (completedError) {
          console.error(
            "Error loading completed job notifications:",
            completedError
          );
        } else {
          completedJobs = jobs || [];
        }
      } catch (error) {
        console.error("Error in completed jobs query:", error);
      }

      // Load new reviews received
      let newReviews = [];
      try {
        const { data: reviews, error: reviewsError } = await supabase
          .from("job_reviews")
          .select(
            `
            *,
            jobs (
              trade,
              job_description
            )
          `
          )
          .eq("tradesperson_id", tradespersonId)
          .gte(
            "reviewed_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ); // Last 7 days

        if (reviewsError) {
          console.error("Error loading review notifications:", reviewsError);
        } else {
          newReviews = reviews || [];
        }
      } catch (error) {
        console.error("Error in reviews query:", error);
      }

      // Load job assignments (when admin assigns you to a job)
      let jobAssignments = [];
      try {
        const { data: jobs, error: assignmentError } = await supabase
          .from("jobs")
          .select("*")
          .eq("assigned_tradesperson_id", tradespersonId)
          .not("assigned_tradesperson_id", "is", null)
          .gte(
            "updated_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ); // Last 7 days

        if (assignmentError) {
          console.error(
            "Error loading job assignment notifications:",
            assignmentError
          );
        } else {
          jobAssignments = jobs || [];
        }
      } catch (error) {
        console.error("Error in job assignments query:", error);
      }

      // Load quote approvals (client approved your quote)
      let quoteApprovals: any[] = [];
      try {
        const { data: quotes, error: quotesErr } = await supabase
          .from("quotes")
          .select("id, quote_amount, status, created_at")
          .eq("tradesperson_id", tradespersonId)
          .eq("status", "client_approved")
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          );
        if (!quotesErr) {
          quoteApprovals = quotes || [];
        }
      } catch (error) {
        console.error("Error in quote approvals query:", error);
      }

      // Combine notifications
      const allNotifications = [
        // Chat messages
        ...(chatMessages || []).map((msg) => ({
          id: `chat-${msg.id}`,
          type: "chat",
          title: "New Message",
          message: `New message about ${msg.chat_rooms?.jobs?.trade || "job"}`,
          timestamp: msg.created_at,
          data: msg,
        })),

        // Application updates
        ...(applicationUpdates || []).map((app) => ({
          id: `app-${app.id}`,
          type: "application",
          title: `Application ${
            app.status.charAt(0).toUpperCase() + app.status.slice(1)
          }`,
          message: `Your application for ${app.jobs?.trade} job was ${app.status}`,
          timestamp: app.updated_at,
          data: app,
        })),

        // New job matches (from jobs table – approved jobs)
        ...(newJobs || []).map((job) => ({
          id: `job-${job.id}`,
          type: "new_job",
          title: "New Job Available",
          message: `New ${job.trade} job in ${job.postcode} - £${
            job.budget || "TBC"
          }`,
          timestamp: job.created_at,
          data: job,
        })),

        // In-app job notifications (fired when job posted – instant)
        ...(jobNotificationRows || []).map((n) => {
          const job = Array.isArray(n.jobs) ? n.jobs[0] : n.jobs;
          return {
            id: `notif-${n.id}`,
            type: "new_job",
            title: n.title || "New Job Available",
            message: n.message || (job ? `New ${job.trade} job in ${job.postcode}` : "New job in your area"),
            timestamp: n.created_at,
            data: { ...n, job_id: n.job_id },
          };
        }),

        // Completed jobs
        ...(completedJobs || []).map((job) => ({
          id: `completed-${job.id}`,
          type: "job_completed",
          title: "Job Completed",
          message: `Your ${job.trade} job has been marked as completed`,
          timestamp: job.completed_at,
          data: job,
        })),

        // New reviews
        ...(newReviews || []).map((review) => ({
          id: `review-${review.id}`,
          type: "review_received",
          title: "New Review Received",
          message: `You received a ${review.rating}/5 star review for your ${review.jobs?.trade} work`,
          timestamp: review.reviewed_at,
          data: review,
        })),

        // Job assignments
        ...(jobAssignments || []).map((job) => ({
          id: `assignment-${job.id}`,
          type: "job_assigned",
          title: "Job Assigned to You",
          message: `You've been assigned to a ${job.trade} job in ${job.postcode}`,
          timestamp: job.assigned_at || job.updated_at,
          data: job,
        })),
        // Quote approvals
        ...(quoteApprovals || []).map((qa) => ({
          id: `quote-approved-${qa.id}`,
          type: "quote_approved",
          title: "Quote Approved",
          message: `A client approved your quote${
            qa.quote_amount ? ` (£${qa.quote_amount})` : ""
          }. Chat is now enabled.`,
          timestamp: qa.created_at,
          data: qa,
        })),
      ];

      // Sort by timestamp (newest first)
      allNotifications.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications);
      setNotificationCount(allNotifications.length);
      // Highlight bell when new jobs appear
      const hasNewJobs = allNotifications.some((n: any) => n.type === "new_job");
      setHighlightBell(hasNewJobs);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const submitQuoteForRequest = async (qr: any) => {
    if (!user) return;
    const amount = quoteAmountById[qr.id];
    const notes = quoteNotesById[qr.id] || "";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a valid quotation amount");
      return;
    }
    try {
      setQuoteSubmittingId(qr.id);
      const res = await fetch("/api/tradesperson/submit-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteRequestId: qr.id,
          tradespersonId: user.id,
          quoteAmount: amount,
          quoteDescription: notes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Quote submitted successfully");
        // Remove the request from the approved list
        setApprovedQuoteRequests((prev) => prev.filter((r) => r.id !== qr.id));
        // Clear inputs
        setQuoteAmountById((prev) => {
          const n = { ...prev };
          delete n[qr.id];
          return n;
        });
        setQuoteNotesById((prev) => {
          const n = { ...prev };
          delete n[qr.id];
          return n;
        });
      } else {
        setError(data.error || "Failed to submit quote");
      }
    } catch (e: any) {
      setError("Failed to submit quote");
    } finally {
      setQuoteSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page-level header removed; global header is used */}

      {/* Main Content */}
      <Section>
      <Container size="wide" className="py-8">
        {dashboardSummary &&
          (dashboardSummary.pendingAwaitingCustomer > 0 ||
            dashboardSummary.inProgressJobs > 0) && (
            <div className="mb-4 space-y-2">
              {dashboardSummary.pendingAwaitingCustomer > 0 && (
                <Alert className="border-amber-300 bg-amber-50 text-amber-950">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    You have{" "}
                    <strong>{dashboardSummary.pendingAwaitingCustomer}</strong>{" "}
                    application
                    {dashboardSummary.pendingAwaitingCustomer === 1
                      ? ""
                      : "s"}{" "}
                    still waiting on the customer on live jobs. Check{" "}
                    <strong>Applied</strong> for status.
                  </AlertDescription>
                </Alert>
              )}
              {dashboardSummary.inProgressJobs > 0 && (
                <Alert className="border-sky-200 bg-sky-50 text-sky-950">
                  <Wrench className="h-4 w-4" />
                  <AlertDescription>
                    You have <strong>{dashboardSummary.inProgressJobs}</strong>{" "}
                    job
                    {dashboardSummary.inProgressJobs === 1 ? "" : "s"} in
                    progress. Keep the client updated in chat.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

        <Alert className="mb-4 border-slate-200 bg-slate-50">
          <AlertDescription>
            Issue with a client or job?{" "}
            <Link href="/report-issue" className="font-medium text-slate-900 underline">
              Report an issue
            </Link>
            {" · "}
            <Link href="/contact" className="font-medium text-slate-900 underline">
              Contact support
            </Link>
            {" · "}
            <Link href="/notifications" className="font-medium text-slate-900 underline">
              Notifications
            </Link>
            {" — or use "}
            <strong>AI Help</strong> below. Include job trade and postcode.
          </AlertDescription>
        </Alert>

        {/* Top actions: Chat + Notifications + Logout */}
        <div className="mb-4 flex items-center justify-end gap-3">
          {/* Open Chat Button */}
          <Button
            onClick={() => setShowChat(true)}
            variant="outline"
            className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold border-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open Chat ({appliedJobs.length})</span>
          </Button>

          {/* Notification Bell */}
          <div className="relative notification-button">
            <Button
              onClick={() => setShowNotifications(!showNotifications)}
              variant="outline"
              className={`flex items-center space-x-2 bg-white hover:bg-gray-50 relative ${highlightBell ? 'ring-2 ring-yellow-400 border-yellow-300 text-yellow-700' : ''}`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {notificationCount > 99 ? "99+" : notificationCount}
                </Badge>
              )}
            </Button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border z-50 max-h-96 overflow-y-auto notification-dropdown">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-brand-navy">Notifications</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshNotifications}
                      className="h-6 w-6 p-0"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No new notifications</p>
                      <p className="text-xs mt-1">You'll see notifications for:</p>
                      <div className="text-xs mt-2 space-y-1 text-gray-400">
                        <p>• New job matches in Postal Code</p>
                        <p>• Application status updates</p>
                        <p>• Job assignments and completions</p>
                        <p>• New reviews and messages</p>
                      </div>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          if (notification.type === "chat") {
                            setShowChat(true);
                          }
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {notification.type === "chat" && (
                                <MessageCircle className="w-4 h-4 text-blue-600" />
                              )}
                              {notification.type === "application" && (
                                <Clock className="w-4 h-4 text-yellow-600" />
                              )}
                              {notification.type === "new_job" && (
                                <Search className="w-4 h-4 text-green-600" />
                              )}
                              {notification.type === "job_completed" && (
                                <CheckCircle className="w-4 h-4 text-purple-600" />
                              )}
                              {notification.type === "review_received" && (
                                <Star className="w-4 h-4 text-orange-600" />
                              )}
                              {notification.type === "job_assigned" && (
                                <TrendingUp className="w-4 h-4 text-indigo-600" />
                              )}
                              {notification.type === "quote_approved" && (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                              <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                            </div>
                            <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                            <p className="text-gray-400 text-xs mt-1">{formatDate(notification.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Controls: Search radius + Notify me */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Search radius</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={searchRadiusKm}
              onChange={(e) => updateSearchRadius(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              className="w-24"
            />
            <span className="text-sm text-gray-600">km</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={notifyMe}
              onCheckedChange={(v) => {
                setNotifyMe(!!v);
                try { localStorage.setItem('tp_notify_me', String(!!v)); } catch {}
              }}
            />
            <span className="text-sm text-gray-700">Notify me when new jobs appear</span>
          </div>
        </div>
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-brand-navy to-brand-navy rounded-xl p-6 md:p-8 mb-4 text-white shadow-lg overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
                Welcome back, {tradesperson?.first_name || user?.firstName || 'there'}!
              </h1>
              <p className="text-blue-100 mb-4">
                Ready to find your next job? Here are the latest opportunities
                in your area.
              </p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4" />
                  <span>{tradesperson?.trade}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{tradesperson?.postcode}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1">
                  <Shield className="w-4 h-4" />
                  <span className="text-xs">Verified Professional</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1">
                  <Star className="w-4 h-4" />
                  <span className="text-xs">Top rated</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{jobs.length}</div>
                <div className="text-sm text-blue-100">Available Jobs</div>
              </div>
            </div>
            {/* Avatar upload */}
            <div className="ml-4">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="h-12 w-12 rounded-full object-cover border border-white/30" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-bold border border-white/30">
                    {(tradesperson?.first_name || user?.firstName || 'TP').slice(0,1)}
                  </div>
                )}
                <label className="absolute -bottom-1 -right-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-amber text-blue-900 text-[10px] font-bold shadow cursor-pointer" aria-label="Upload avatar">
                  {uploadingAvatar ? '…' : '+'}
                  <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Approved Banner */}
        {approvedQuoteBanner && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <div className="flex items-start justify-between w-full">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-700 mt-0.5 mr-2 flex-shrink-0" />
                <AlertDescription className="text-green-800">
                  Your quote
                  {approvedQuoteBanner.amount
                    ? ` (£${approvedQuoteBanner.amount})`
                    : ""}{" "}
                  has been approved by {approvedQuoteBanner.customerName}. Chat
                  is now enabled.
                </AlertDescription>
              </div>
              <button
                onClick={() => setApprovedQuoteBanner(null)}
                className="text-green-800 hover:text-green-900 text-sm"
              >
                Dismiss
              </button>
            </div>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Available Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Applied Jobs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {appliedJobs.length}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {inProgressJobs.length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedJobs.length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="sticky top-16 z-30">
            <TabsList className="grid w-full grid-cols-5 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 p-1 rounded-xl shadow-sm border">
            <TabsTrigger
              value="available"
              className="flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Available Jobs</span>
            </TabsTrigger>
            <TabsTrigger
              value="applied"
              className="flex items-center space-x-2"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Applied</span>
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">In Progress</span>
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Completed</span>
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Quote Requests</span>
            </TabsTrigger>
            </TabsList>
          </div>

          {/* Available Jobs Tab */}
          <TabsContent value="available" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-brand-navy">
                  Available Jobs
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Open jobs in your area that you can apply to
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => loadFilteredJobs({...tradesperson, id: user?.id || tradesperson.id})}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {jobs.length === 0 ? (
              <Card className="rounded-xl border border-white/60 bg-white/95 backdrop-blur text-center py-10 shadow-sm">
                <CardContent>
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-extrabold text-brand-navy mb-1">No open jobs available</h3>
                  <p className="text-gray-600 mb-4 max-w-md mx-auto">
                    There are currently no open jobs in your area that match your trade.
                  </p>
                  <div className="flex gap-2 justify-center mb-4">
                    <Button onClick={() => loadFilteredJobs({...tradesperson, id: user?.id || tradesperson.id})} className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold">
                      <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                    <Button variant="outline" onClick={() => setShowChat(true)}>
                      <MessageCircle className="w-4 h-4 mr-2" /> Open Chat ({appliedJobs.length})
                    </Button>
                  </div>
                  <div className="text-[12px] text-gray-500">
                    Tips:
                    <div className="mt-1 grid sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">Widen your postcode radius in your profile.</div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">Check back later—new jobs appear throughout the day.</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      {/* Job Images */}
                      {job.images && job.images.length > 0 && (
                        <div className="relative h-48 bg-gray-100">
                          <img
                            src={job.images[0]}
                            alt="Job"
                            className="w-full h-full object-cover"
                          />
                          {job.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                              +{job.images.length - 1} more
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-extrabold text-brand-navy mb-1">
                              {job.trade}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {job.job_description}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {formatCurrency(job.budget)}
                          </Badge>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{job.postcode}</span>
                            {job.distanceText && (
                              <span className="ml-2 text-blue-600">
                                ({job.distanceText})
                              </span>
                            )}
                          </div>

                          {job.preferred_date && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>
                                Preferred: {formatDate(job.preferred_date)}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-2" />
                            <span>
                              Budget: {formatCurrency(job.budget)} (
                              {job.budget_type})
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                        <Button
                          onClick={() => handleApplyToJob(job)}
                          className="w-full bg-gradient-to-r from-brand-navy to-brand-navy hover:from-brand-navy hover:to-brand-navy text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Apply Now
                        </Button>
                          <Button
                            onClick={() => handleFlagJob(job)}
                            variant="outline"
                            size="sm"
                            className="w-full border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Flag className="w-4 h-4 mr-1" />
                            Flag Issue
                        </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Applied Jobs Tab */}
          <TabsContent value="applied" className="space-y-6">
            <h2 className="text-2xl font-extrabold text-brand-navy">Applied Jobs</h2>

            {appliedJobs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-extrabold text-brand-navy mb-2">
                    No applications yet
                  </h3>
                  <p className="text-gray-600">
                    Start applying to available jobs to see them here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((application) => (
                  <Card
                    key={application.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-extrabold text-brand-navy">
                              {application.jobs.trade}
                            </h3>
                            <Badge
                              variant={
                                application.status === "pending"
                                  ? "secondary"
                                  : application.status === "accepted"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {application.status.charAt(0).toUpperCase() +
                                application.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {application.jobs.job_description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{application.jobs.postcode}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>
                                Your Quote:{" "}
                                {formatCurrency(application.quotation_amount)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>
                                Applied: {formatDate(application.applied_at)}
                              </span>
                            </div>
                          </div>
                          {application.jobs?.clients && (
                            <div className="mt-4 flex items-center gap-3 text-sm text-gray-700 border-t pt-3">
                              {application.jobs.clients.profile_photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={application.jobs.clients.profile_photo_url}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover border"
                                />
                              ) : (
                                <User className="h-10 w-10 text-gray-400" />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">Customer</div>
                                <div>
                                  {application.jobs.clients.first_name}{" "}
                                  {application.jobs.clients.last_name}
                                </div>
                                {application.jobs.clients.email ? (
                                  <div className="text-gray-500 text-xs">
                                    {application.jobs.clients.email}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* In Progress Jobs Tab */}
          <TabsContent value="in-progress" className="space-y-6">
            <h2 className="text-2xl font-extrabold text-brand-navy">
              In Progress Jobs
            </h2>

            {inProgressJobs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-extrabold text-brand-navy mb-2">
                    No active jobs
                  </h3>
                  <p className="text-gray-600">
                    Jobs you're currently working on will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {inProgressJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-extrabold text-brand-navy">
                              {job.trade}
                            </h3>
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              In Progress
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {job.job_description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{job.postcode}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>Budget: {formatCurrency(job.budget)}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Started: {formatDate(job.created_at)}</span>
                            </div>
                          </div>
                          {job.clients && (
                            <div className="mt-4 flex items-center gap-3 text-sm text-gray-700 border-t pt-3">
                              {job.clients.profile_photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={job.clients.profile_photo_url}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover border"
                                />
                              ) : (
                                <User className="h-10 w-10 text-gray-400" />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">Customer</div>
                                <div>
                                  {job.clients.first_name} {job.clients.last_name}
                                </div>
                                {job.clients.email ? (
                                  <div className="text-gray-500 text-xs">{job.clients.email}</div>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Jobs Tab */}
          <TabsContent value="completed" className="space-y-6">
            <h2 className="text-2xl font-extrabold text-brand-navy">Completed Jobs</h2>

            {completedJobs.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-extrabold text-brand-navy mb-2">
                    No completed jobs
                  </h3>
                  <p className="text-gray-600">
                    Jobs you've completed will appear here with reviews.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedJobs.map((job) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-extrabold text-brand-navy">
                              {job.trade}
                            </h3>
                            <Badge
                              variant="default"
                              className="bg-purple-100 text-purple-800"
                            >
                              Completed
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {job.job_description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{job.postcode}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              <span>Budget: {formatCurrency(job.budget)}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>
                                Completed: {formatDate(job.completed_at || "")}
                              </span>
                            </div>
                          </div>

                          {job.clients && (
                            <div className="mb-4 flex items-center gap-3 text-sm text-gray-700 border-t pt-3">
                              {job.clients.profile_photo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={job.clients.profile_photo_url}
                                  alt=""
                                  className="h-10 w-10 rounded-full object-cover border"
                                />
                              ) : (
                                <User className="h-10 w-10 text-gray-400" />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">Customer</div>
                                <div>
                                  {job.clients.first_name} {job.clients.last_name}
                                </div>
                                {job.clients.email ? (
                                  <div className="text-gray-500 text-xs">{job.clients.email}</div>
                                ) : null}
                              </div>
                            </div>
                          )}

                          {/* Reviews */}
                          {job.job_reviews && job.job_reviews.length > 0 ? (
                            <div className="border-t pt-4">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Client Reviews
                              </h4>
                              {job.job_reviews.map((review: any) => (
                                <div
                                  key={review.id}
                                  className="bg-gray-50 rounded-xl p-3 mb-2"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      {renderStars(review.rating)}
                                      <span className="text-sm font-medium text-gray-900">
                                        {review.rating}/5
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(
                                        review.reviewed_at ||
                                          (review as { review_date?: string })
                                            .review_date ||
                                          job.completed_at ||
                                          "",
                                      )}
                                    </span>
                                  </div>
                                  {review.review_text && (
                                    <p className="text-sm text-gray-700">
                                      "{review.review_text}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border-t pt-4">
                              <p className="text-sm text-gray-500 italic">
                                No reviews yet
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quote Requests Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-brand-navy">
                Approved Quote Requests
              </h2>
              <div className="flex space-x-2">
                <Button
                  onClick={() => user?.id && loadApprovedQuoteRequests(user.id)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>

            {approvedQuoteRequests.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-extrabold text-brand-navy mb-2">
                    No approved quote requests yet
                  </h3>
                  <p className="text-gray-600">
                    When an admin approves a client request for you, it will
                    appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {approvedQuoteRequests.map((qr) => (
                  <Card
                    key={qr.id}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-extrabold text-brand-navy">
                              {qr.project_type || "Project"}
                            </h3>
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800"
                            >
                              Admin Approved
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {qr.project_description}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Customer:</strong> {qr.customer_name}
                            </div>
                            <div>
                              <strong>Location:</strong> {qr.location}
                            </div>
                            <div>
                              <strong>Timeframe:</strong>{" "}
                              {qr.timeframe || "N/A"}
                            </div>
                            <div>
                              <strong>Budget:</strong>{" "}
                              {qr.budget_range || "Discuss"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Inline quote submission form (client email hidden) */}
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Provide Your Quotation
                        </h4>
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="md:col-span-1">
                            <Label htmlFor={`amount-${qr.id}`}>
                              Amount (£)
                            </Label>
                            <Input
                              id={`amount-${qr.id}`}
                              type="number"
                              min="0"
                              placeholder="e.g. 1200"
                              value={quoteAmountById[qr.id] || ""}
                              onChange={(e) =>
                                setQuoteAmountById((prev) => ({
                                  ...prev,
                                  [qr.id]: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`notes-${qr.id}`}>
                              Notes (optional)
                            </Label>
                            <Textarea
                              id={`notes-${qr.id}`}
                              rows={2}
                              placeholder="Brief description of what’s included"
                              value={quoteNotesById[qr.id] || ""}
                              onChange={(e) =>
                                setQuoteNotesById((prev) => ({
                                  ...prev,
                                  [qr.id]: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button
                            onClick={() => submitQuoteForRequest(qr)}
                            disabled={quoteSubmittingId === qr.id}
                            className="bg-brand-navy hover:bg-brand-navy"
                          >
                            {quoteSubmittingId === qr.id
                              ? "Submitting..."
                              : "Submit Quote"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Container>
      </Section>

      {/* Application Dialog */}
      <Dialog
        open={showApplicationDialog}
        onOpenChange={setShowApplicationDialog}
      >
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for Job</DialogTitle>
            <DialogDescription>
              Submit your quotation for this job. Make sure to provide a
              competitive price and clear notes.
            </DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold mb-2">Job Details:</h4>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedJob.job_description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div>
                    <strong>Trade:</strong> {selectedJob.trade}
                  </div>
                  <div>
                    <strong>Postal Code:</strong> {selectedJob.postcode}
                  </div>
                  <div>
                    <strong>Budget:</strong>{" "}
                    {formatCurrency(selectedJob.budget)}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedJob.budget_type}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="quotation-amount">
                  Your Quotation Amount (£)
                </Label>
                <Input
                  id="quotation-amount"
                  type="number"
                  placeholder="Enter your price"
                  value={quotationAmount}
                  onChange={(e) => setQuotationAmount(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <Label htmlFor="quotation-notes" className="text-base font-semibold">
                      How you'll complete this job *
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      💡 <strong>Better descriptions = Higher chance of getting hired!</strong>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAIHelp(!showAIHelp)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-brand-navy shadow-md transition-all duration-200 shrink-0"
                  >
                    <span className="mr-1">✨</span>
                    AI Help
                  </Button>
                </div>

                {/* Completion Percentage */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-xl border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Application Strength</span>
                    <span className={`text-sm font-bold ${
                      completionPercentage >= 80 ? 'text-green-600' : 
                      completionPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        completionPercentage >= 80 ? 'bg-green-500' : 
                        completionPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {completionPercentage >= 80 ? '🎉 Excellent! Your application stands out!' :
                     completionPercentage >= 60 ? '👍 Good! Add more details to improve your chances.' :
                     '⚠️ Add more details about your approach and experience to win this job!'}
                  </p>
                </div>

                {/* AI Suggestions Panel */}
                {showAIHelp && selectedJob && (
                  <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-3 sm:p-4 rounded-xl border-2 border-purple-200 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✨</span>
                        </div>
                        <h4 className="text-sm font-bold bg-gradient-to-r from-purple-600 to-brand-navy bg-clip-text text-transparent">
                          AI Suggestions for {selectedJob.trade}
                        </h4>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAIHelp(false)}
                        className="text-gray-400 hover:text-gray-600 rounded-full w-6 h-6 p-0 self-end sm:self-auto"
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <p className="text-xs text-purple-700 mb-3 bg-white/50 p-2 rounded border border-purple-200">
                      💡 Click any suggestion to use it as your response, then customize it with your specific details!
                    </p>
                    
                    <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                      {getAISuggestions(selectedJob.trade, selectedJob.job_description).map((suggestion, index) => (
                        <div
                          key={index}
                          className="group bg-white/80 backdrop-blur-sm p-2 sm:p-3 rounded-xl border border-purple-100 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all duration-200"
                          onClick={() => setQuotationNotes(suggestion)}
                        >
                          <div className="flex items-start space-x-2">
                            <div className="w-5 h-5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-white text-xs font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-800 leading-relaxed break-words">{suggestion}</p>
                              <div className="flex items-center text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                                <span className="mr-1">👆</span>
                                Click to use this example
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                <Textarea
                  id="quotation-notes"
                    placeholder="Describe your approach, timeline, experience, and what makes you the best choice for this job..."
                  value={quotationNotes}
                  onChange={(e) => setQuotationNotes(e.target.value)}
                    className="border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200"
                    rows={4}
                    required
                />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                    {quotationNotes.length}/200+ chars for max score
                  </div>
              </div>

                <div className="text-xs text-gray-500 space-y-2 bg-gray-50 p-3 rounded-xl">
                  <p>💡 <strong>Tips for winning jobs:</strong></p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div className="flex items-start space-x-1">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Mention your years of experience</span>
                    </div>
                    <div className="flex items-start space-x-1">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Explain your specific approach</span>
                    </div>
                    <div className="flex items-start space-x-1">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Include timeline and guarantees</span>
                    </div>
                    <div className="flex items-start space-x-1">
                      <span className="text-purple-500 mt-0.5">•</span>
                      <span>Show you understand requirements</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowApplicationDialog(false)}
                  className="flex-1 order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitApplication}
                  disabled={applying || !quotationAmount || !quotationNotes.trim()}
                  className="flex-1 bg-gradient-to-r from-brand-navy to-brand-navy hover:from-brand-navy hover:to-brand-navy order-1 sm:order-2"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flag Job Dialog */}
      <Dialog open={showFlagDialog} onOpenChange={setShowFlagDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Flag Job Issue
            </DialogTitle>
            <DialogDescription>
              Report an issue with this job. Our admin team will review your concern and take appropriate action.
            </DialogDescription>
          </DialogHeader>
          {selectedJobForFlag && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <h4 className="font-semibold mb-2 text-sm">Job Details:</h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Trade:</strong> {selectedJobForFlag.trade}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Description:</strong> {selectedJobForFlag.job_description}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Location:</strong> {selectedJobForFlag.postcode}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Client:</strong> {selectedJobForFlag.clients?.first_name} {selectedJobForFlag.clients?.last_name}
                </p>
              </div>

              <div>
                <Label htmlFor="flagReason" className="text-sm font-medium">
                  Reason for flagging *
                </Label>
                <Textarea
                  id="flagReason"
                  placeholder="Please describe the issue in detail (e.g., misleading job description, suspicious activity, inappropriate content, safety concerns, etc.)"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 10 characters required. Be specific to help us resolve the issue.
                </p>
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFlagDialog(false);
                    setFlagReason("");
                    setSelectedJobForFlag(null);
                  }}
                  disabled={flagging}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitFlagJob}
                  disabled={flagging || flagReason.trim().length < 10}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {flagging ? "Flagging..." : "Flag Job"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Database Chat System for Tradesperson-Client conversations */}
      {user && showChat && (
      <DatabaseChatSystem
          userId={user.id}
        userType="tradesperson"
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
      )}

      {/* AI Support Chat */}
      {user && tradesperson && (
        <AISupportChat
          userId={user.id}
        userType="tradesperson"
          userName={`${tradesperson.first_name || ''} ${tradesperson.last_name || ''}`.trim() || user.email}
      />
      )}
      {/* Page-level footer removed; global footer is used */}
    </div>
  );
}
