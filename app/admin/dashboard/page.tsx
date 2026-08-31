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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, CheckCircle, XCircle, Eye, Star, Clock, Users, Briefcase, ListChecks, RefreshCw, Download, Flag, AlertTriangle, MessageCircle, HeadphonesIcon, UserCheck, Zap, UserX, Mail } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import SimpleQuoteRequests from "@/components/SimpleQuoteRequests";

interface Tradesperson {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  postcode: string;
  city: string;
  address: string;
  trade: string;
  years_experience: number;
  hourly_rate: number;
  id_document_url: string;
  insurance_document_url: string;
  qualifications_document_url: string;
  trade_card_url: string;
  is_verified: boolean;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
}

interface TradespersonDocument {
  id: string;
  doc_type: string;
  file_path: string;
  upload_date: string | null;
  expiry_date: string | null;
  doc_number: string | null;
  status: string | null;
  signed_url: string | null;
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
  clients: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  assigned_tradesperson_id?: string;
  quotation_amount?: number;
  assigned_by?: "client" | "admin";
  is_completed?: boolean;
  completed_at?: string;
  completed_by?: string;
  client_rating?: number;
  client_review?: string;
  tradespeople?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    trade: string;
    years_experience: number;
    hourly_rate: number;
    phone: string;
  };
  job_reviews?: {
    id: string;
    tradesperson_id: string;
    reviewer_type: "client" | "tradesperson";
    reviewer_id: string;
    rating: number;
    review_text: string;
    reviewed_at: string;
  }[];
}

interface JobApplication {
  id: string;
  quotation_amount: number;
  quotation_notes: string;
  status: string;
  applied_at: string;
  jobs: {
    id: string;
    trade: string;
    job_description: string;
    postcode: string;
    budget: number;
    budget_type: string;
    clients: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  tradespeople: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    trade: string;
    years_experience: number;
    hourly_rate: number;
    phone: string;
  };
}

export default function AdminDashboardPage() {
  const [tradespeople, setTradespeople] = useState<Tradesperson[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("tradespeople");
  const [searchQuery, setSearchQuery] = useState("");
  const [tpPage, setTpPage] = useState(1);
  const [jobsPage, setJobsPage] = useState(1);
  const pageSize = 10;
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedJobForAssignment, setSelectedJobForAssignment] =
    useState<any>(null);
  const [assignmentQuotation, setAssignmentQuotation] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [availableTradespeople, setAvailableTradespeople] = useState<any[]>([]);
  const [jobApplications, setJobApplications] = useState<any[]>([]);
  const [submittedJobs, setSubmittedJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsStatus, setJobsStatus] = useState("all");
  const [flaggedJobs, setFlaggedJobs] = useState<any[]>([]);
  const [flaggedJobsLoading, setFlaggedJobsLoading] = useState(false);
  const [flaggedJobsPage, setFlaggedJobsPage] = useState(1);
  const [totalFlaggedPages, setTotalFlaggedPages] = useState(1);
  const [flaggedJobsStatus, setFlaggedJobsStatus] = useState("flagged");
  const [showUnflagDialog, setShowUnflagDialog] = useState(false);
  const [selectedJobForUnflag, setSelectedJobForUnflag] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [unflagging, setUnflagging] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedJobForInvite, setSelectedJobForInvite] = useState<Job | null>(null);
  const [inviteEmailsText, setInviteEmailsText] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState("");
  
  // Support Chat & Tickets state
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [supportTicketsLoading, setSupportTicketsLoading] = useState(false);
  const [supportTicketsPage, setSupportTicketsPage] = useState(1);
  const [totalSupportPages, setTotalSupportPages] = useState(1);
  const [supportStatus, setSupportStatus] = useState("all");
  const [supportPriority, setSupportPriority] = useState("all");
  
  // Disputes state (separate from support tickets)
  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesPage, setDisputesPage] = useState(1);
  const [totalDisputePages, setTotalDisputePages] = useState(1);
  const [disputeStatus, setDisputeStatus] = useState("all");
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [disputeNotes, setDisputeNotes] = useState("");
  const [disputeAssignee, setDisputeAssignee] = useState("");
  const [updatingDispute, setUpdatingDispute] = useState(false);

  const [scheduledRows, setScheduledRows] = useState<any[]>([]);
  const [scheduledLoading, setScheduledLoading] = useState(false);

  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendTpId, setSuspendTpId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendLoading, setSuspendLoading] = useState(false);

  const [activityLog, setActivityLog] = useState<{ id: string; action: string; entity_type: string; entity_id: string | null; details: Record<string, unknown> | null; created_at: string }[]>([]);

  const [empireTriggering, setEmpireTriggering] = useState(false);
  const [empireMessage, setEmpireMessage] = useState("");
  const [showTradespersonDialog, setShowTradespersonDialog] = useState(false);
  const [tradespersonDetailsLoading, setTradespersonDetailsLoading] = useState(false);
  const [selectedTradesperson, setSelectedTradesperson] = useState<Tradesperson | null>(null);
  const [selectedTradespersonDocs, setSelectedTradespersonDocs] = useState<TradespersonDocument[]>([]);
  
  const router = useRouter();

  useEffect(() => {
    // Check if admin is logged in
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (!adminLoggedIn) {
      router.push("/admin/login");
      return;
    }

    loadData();
    loadDisputes(); // Auto-load disputes when admin dashboard opens
    
    // Auto-refresh disputes every 30 seconds
    const disputeInterval = setInterval(() => {
      loadDisputes();
    }, 30000);
    
    return () => clearInterval(disputeInterval);
  }, [router]);

  // Monitor jobs state changes
  useEffect(() => {
    console.log("Admin dashboard - Jobs state changed:", {
      jobsLength: jobs.length,
      jobs: jobs,
    });
  }, [jobs]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'support-chat') {
      loadSupportTickets();
    } else if (activeTab === 'disputes') {
      loadDisputes();
    } else if (activeTab === "scheduled-notifications") {
      loadScheduledNotifications();
    } else if (activeTab === 'flagged-jobs') {
      loadFlaggedJobs();
    } else if (activeTab === 'completed') {
      // Completed jobs are filtered from the main jobs data, so just refresh jobs
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      console.log("Admin dashboard - Loading data...");

      // Load tradespeople
      const tradespeopleResponse = await fetch(
        "/api/client/admin-secret/tradespeople"
      );
      if (tradespeopleResponse.ok) {
        const tradespeopleData = await tradespeopleResponse.json();
        console.log(
          "Admin dashboard - Tradespeople loaded:",
          tradespeopleData.tradespeople?.length || 0
        );
        setTradespeople(tradespeopleData.tradespeople);
      }

      // Load jobs
      const jobsResponse = await fetch("/api/client/jobs");
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        console.log("Admin dashboard - Full jobs response:", jobsData);
        console.log(
          "Admin dashboard - Jobs loaded:",
          jobsData.jobs?.length || 0
        );
        console.log("Admin dashboard - Jobs data:", jobsData.jobs);

        // Handle both possible response structures
        const jobsArray = jobsData.jobs || jobsData || [];
        console.log("Admin dashboard - Final jobs array:", jobsArray);
        setJobs(jobsArray);
      } else {
        console.error(
          "Admin dashboard - Failed to load jobs:",
          jobsResponse.status
        );
        const errorText = await jobsResponse.text();
        console.error("Admin dashboard - Error response:", errorText);
      }

      // Load job applications
      const applicationsResponse = await fetch(
        "/api/client/admin-secret/job-applications"
      );
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        console.log(
          "Admin dashboard - Applications loaded:",
          applicationsData.applications?.length || 0
        );
        setApplications(applicationsData.applications);
      }

      // Load admin activity log (job posted → N trades notified, etc.)
      const logResponse = await fetch("/api/admin/activity-log");
      if (logResponse.ok) {
        const { entries } = await logResponse.json();
        setActivityLog(entries || []);
      }
    } catch (err) {
      console.error("Admin dashboard - Error loading data:", err);
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmittedJobs = async () => {
    setJobsLoading(true);
    try {
      const response = await fetch(`/api/jobs/admin?page=${jobsPage}&status=${jobsStatus}&limit=10`);
      const data = await response.json();
      if (data.success) {
        // Transform the data to include client information
        const jobsWithClientInfo = data.data.jobs?.map((job: any) => ({
          ...job,
          client_name: job.client ? `${job.client.first_name || ''} ${job.client.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
          client_email: job.client?.email || 'Unknown',
          client_phone: job.client?.phone || 'Unknown'
        })) || [];
        
        setSubmittedJobs(jobsWithClientInfo);
      }
    } catch (err) {
      console.error("Error loading submitted jobs:", err);
    } finally {
      setJobsLoading(false);
    }
  };

  const loadFlaggedJobs = async () => {
    setFlaggedJobsLoading(true);
    try {
      const response = await fetch(`/api/admin/flagged-jobs?page=${flaggedJobsPage}&status=${flaggedJobsStatus}&limit=10`);
      const data = await response.json();
      if (data.success) {
        const jobsWithUserInfo = data.data.jobs?.map((job: any) => ({
          ...job,
          client_name: job.clients ? `${job.clients.first_name || ''} ${job.clients.last_name || ''}`.trim() || 'Unknown' : 'Unknown',
          client_email: job.clients?.email || 'Unknown',
          client_phone: job.clients?.phone || 'Unknown',
          tradesperson_name: job.tradespeople ? `${job.tradespeople.first_name || ''} ${job.tradespeople.last_name || ''}`.trim() || 'Not Assigned' : 'Not Assigned'
        })) || [];
        
        setFlaggedJobs(jobsWithUserInfo);
        setTotalFlaggedPages(data.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Error loading flagged jobs:", err);
    } finally {
      setFlaggedJobsLoading(false);
    }
  };

  const loadSupportTickets = async () => {
    setSupportTicketsLoading(true);
    try {
      const response = await fetch(`/api/admin/support-tickets?page=${supportTicketsPage}&status=${supportStatus}&priority=${supportPriority}&limit=10`);
      const data = await response.json();
      
      let allTickets = [];
      
      if (data.success) {
        const ticketsWithUserInfo = data.data.tickets?.map((ticket: any) => ({
          ...ticket,
          user_name: ticket.user_type === 'client' 
            ? (ticket.chat_rooms?.clients ? `${ticket.chat_rooms.clients.first_name || ''} ${ticket.chat_rooms.clients.last_name || ''}`.trim() || 'Unknown' : 'Unknown')
            : (ticket.chat_rooms?.tradespeople ? `${ticket.chat_rooms.tradespeople.first_name || ''} ${ticket.chat_rooms.tradespeople.last_name || ''}`.trim() || 'Unknown' : 'Unknown'),
          user_email: ticket.user_type === 'client' 
            ? ticket.chat_rooms?.clients?.email || 'Unknown'
            : ticket.chat_rooms?.tradespeople?.email || 'Unknown',
          job_info: ticket.chat_rooms?.jobs ? {
            trade: ticket.chat_rooms.jobs.trade,
            description: ticket.chat_rooms.jobs.job_description,
            postcode: ticket.chat_rooms.jobs.postcode
          } : null,
          source: 'database'
        })) || [];
        
        allTickets = [...ticketsWithUserInfo];
      }
      
      // Load contact requests from local storage
      try {
        const localTickets = JSON.parse(localStorage.getItem('myapproved_support_tickets') || '[]');
        const formattedLocalTickets = localTickets.map((ticket: any) => ({
          id: ticket.id,
          user_id: ticket.userId,
          user_type: ticket.userType,
          user_name: ticket.userName,
          user_email: ticket.userEmail,
          user_phone: ticket.userPhone,
          category: ticket.category,
          original_message: ticket.details,
          ai_response: `Contact request: ${ticket.category}\nEmail: ${ticket.userEmail}\nPhone: ${ticket.userPhone}\nDetails: ${ticket.details}`,
          priority: ticket.priority,
          status: ticket.status,
          created_at: ticket.created_at,
          source: 'local',
          contact_type: ticket.category, // payment, account, support
          job_info: null
        }));
        
        allTickets = [...allTickets, ...formattedLocalTickets];
      } catch (storageError) {
        console.log('Failed to load local contact requests');
      }
      
      // Sort by created_at (newest first)
      allTickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setSupportTickets(allTickets);
      setTotalSupportPages(Math.ceil(allTickets.length / 10));
      
    } catch (err) {
      console.error("Error loading support tickets:", err);
    } finally {
      setSupportTicketsLoading(false);
    }
  };


  const loadDisputes = async () => {
    setDisputesLoading(true);
    try {
      let allDisputes = [];
      
      // Try to load from database first
      try {
        const response = await fetch(`/api/admin/disputes?page=${disputesPage}&status=${disputeStatus}&limit=50`);
        const data = await response.json();
        if (data.success) {
          allDisputes = data.data.disputes || [];
        }
      } catch (apiError) {
        console.log("Database disputes not available, checking local storage");
      }
      
      // Also load local disputes as backup
      try {
        const localDisputes = JSON.parse(localStorage.getItem('myapproved_disputes') || '[]');
        const formattedLocalDisputes = localDisputes.map((dispute: any) => ({
          ...dispute,
          user_name: dispute.userName || 'Unknown',
          user_email: dispute.userId || 'Unknown',
          original_message: dispute.disputeDetails,
          created_at: dispute.created_at,
          status: dispute.status || 'open',
          priority: dispute.priority || 'high',
          source: 'local'
        }));
        
        // Merge with database disputes (avoid duplicates)
        const existingIds = allDisputes.map(d => d.id);
        const newLocalDisputes = formattedLocalDisputes.filter(d => !existingIds.includes(d.id));
        allDisputes = [...allDisputes, ...newLocalDisputes];
      } catch (localError) {
        console.log("No local disputes found");
      }
      
      // Sort by creation date (newest first)
      allDisputes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setDisputes(allDisputes);
      setTotalDisputePages(Math.ceil(allDisputes.length / 10) || 1);
      
      console.log(`Loaded ${allDisputes.length} total disputes`);
    } catch (err) {
      console.error("Error loading disputes:", err);
    } finally {
      setDisputesLoading(false);
    }
  };

  const loadScheduledNotifications = async () => {
    setScheduledLoading(true);
    try {
      const res = await fetch("/api/admin/scheduled-notifications?status=all");
      const data = await res.json();
      if (Array.isArray(data.items)) {
        setScheduledRows(data.items);
      } else {
        setScheduledRows([]);
      }
    } catch (e) {
      console.error("Scheduled notifications load failed:", e);
      setScheduledRows([]);
    } finally {
      setScheduledLoading(false);
    }
  };

  const handleDisputeUpdate = async (disputeId: string, updates: any) => {
    setUpdatingDispute(true);
    try {
      const response = await fetch('/api/admin/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: disputeId, ...updates })
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Dispute updated successfully");
        loadDisputes(); // Refresh the list
        setShowDisputeDialog(false);
      } else {
        setError(data.error || "Failed to update dispute");
      }
    } catch (err) {
      console.error("Error updating dispute:", err);
      setError("Failed to update dispute");
    } finally {
      setUpdatingDispute(false);
    }
  };

  const handleQuickResolve = async (disputeId: string) => {
    if (!confirm('Mark this dispute as resolved?')) return;
    
    try {
      // Try to update in database first
      try {
        const response = await fetch('/api/admin/disputes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ticketId: disputeId, 
            status: 'resolved',
            adminNotes: 'Resolved by admin'
          })
        });
        
        if (!response.ok) {
          throw new Error('Database update failed');
        }
      } catch (apiError) {
        console.log('Database update failed, updating local storage');
      }
      
      // Update local storage
      try {
        const localDisputes = JSON.parse(localStorage.getItem('myapproved_disputes') || '[]');
        const updatedDisputes = localDisputes.map((dispute: any) => 
          dispute.id.toString() === disputeId.toString() 
            ? { ...dispute, status: 'resolved', resolved_at: new Date().toISOString() }
            : dispute
        );
        localStorage.setItem('myapproved_disputes', JSON.stringify(updatedDisputes));
      } catch (storageError) {
        console.log('Local storage update failed');
      }
      
      setMessage("Dispute resolved successfully");
      loadDisputes(); // Refresh the list and update counts
      
    } catch (err) {
      console.error("Error resolving dispute:", err);
      setError("Failed to resolve dispute");
    }
  };

  const handleQuickResolveTicket = async (ticketId: string) => {
    if (!confirm('Mark this support ticket as resolved?')) return;
    
    try {
      // Try to update in database first
      try {
        const response = await fetch('/api/admin/support-tickets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            ticketId: ticketId, 
            status: 'resolved',
            adminNotes: 'Resolved by admin'
          })
        });
        
        if (!response.ok) {
          throw new Error('Database update failed');
        }
      } catch (apiError) {
        console.log('Database update failed, updating local storage');
      }
      
      // Update local storage for contact requests
      try {
        const localTickets = JSON.parse(localStorage.getItem('myapproved_support_tickets') || '[]');
        const updatedTickets = localTickets.map((ticket: any) => 
          ticket.id.toString() === ticketId.toString() 
            ? { ...ticket, status: 'resolved', resolved_at: new Date().toISOString() }
            : ticket
        );
        localStorage.setItem('myapproved_support_tickets', JSON.stringify(updatedTickets));
      } catch (storageError) {
        console.log('Local storage update failed');
      }
      
      setMessage("Support ticket resolved successfully");
      loadSupportTickets(); // Refresh the list
      
    } catch (err) {
      console.error("Error resolving support ticket:", err);
      setError("Failed to resolve support ticket");
    }
  };

  const handleApproveJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/jobs/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          action: 'approve',
          adminNotes: 'Approved by admin'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage('Job approved successfully');
        loadSubmittedJobs(); // Reload submitted jobs
        loadData(); // Reload main jobs data
      } else {
        setError(result.message || 'Failed to approve job');
      }
    } catch (err) {
      setError('Failed to approve job');
      console.error('Error approving job:', err);
    }
  };

  const openInviteDialog = (job: Job) => {
    setSelectedJobForInvite(job);
    setInviteEmailsText("");
    setInviteResult("");
    setShowInviteDialog(true);
  };

  const handleInviteTradespeople = async () => {
    if (!selectedJobForInvite) return;
    const emails = inviteEmailsText
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) {
      setInviteResult("Enter at least one email address.");
      return;
    }

    setInviting(true);
    setInviteResult("");
    try {
      const response = await fetch(
        "/api/client/admin-secret/invite-tradespeople",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: selectedJobForInvite.id,
            emails,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setInviteResult(result.error || "Failed to send invites");
        return;
      }
      const parts = [
        `Sent: ${result.sentCount ?? 0}`,
        `Failed: ${result.failedCount ?? 0}`,
      ];
      if (Array.isArray(result.failed) && result.failed.length > 0) {
        parts.push(
          result.failed
            .map((f: { email: string; error: string }) => `${f.email} (${f.error})`)
            .join("; "),
        );
      }
      setInviteResult(parts.join(" · "));
      if ((result.sentCount ?? 0) > 0) {
        setMessage(
          `Invited ${result.sentCount} tradesperson(s) to the ${selectedJobForInvite.trade} job`,
        );
      }
    } catch (err) {
      console.error("Error inviting tradespeople:", err);
      setInviteResult("Failed to send invites");
    } finally {
      setInviting(false);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    try {
      const response = await fetch('/api/jobs/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          action: 'reject',
          adminNotes: 'Rejected by admin'
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage('Job rejected successfully');
        loadSubmittedJobs(); // Reload submitted jobs
        loadData(); // Reload main jobs data
      } else {
        setError(result.message || 'Failed to reject job');
      }
    } catch (err) {
      setError('Failed to reject job');
      console.error('Error rejecting job:', err);
    }
  };

  const handleUnflagJob = (job: any) => {
    setSelectedJobForUnflag(job);
    setAdminNotes("");
    setShowUnflagDialog(true);
  };

  const submitUnflagJob = async () => {
    if (!selectedJobForUnflag) {
      setError("Unable to unflag job. Please try again.");
      return;
    }

    setUnflagging(true);
    setError("");

    try {
      const response = await fetch("/api/jobs/unflag", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: selectedJobForUnflag.id,
          adminNotes: adminNotes.trim(),
          adminId: "admin", // You can replace this with actual admin ID
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("Job unflagged successfully");
        setShowUnflagDialog(false);
        setAdminNotes("");
        setSelectedJobForUnflag(null);
        loadFlaggedJobs(); // Refresh flagged jobs list
      } else {
        setError(result.message || "Failed to unflag job");
      }
    } catch (err) {
      console.error("Error unflagging job:", err);
      setError("Failed to unflag job. Please try again.");
    } finally {
      setUnflagging(false);
    }
  };

  // Refresh dashboard data
  const handleRefresh = () => {
    setLoading(true);
    loadData();
  };

  // Export current tradespeople list to CSV
  const exportTradespeopleCSV = () => {
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Trade",
      "Years Exp",
      "Hourly Rate",
      "Phone",
      "City",
      "Postcode",
      "Verified",
      "Approved",
    ];
    const rows = tradespeople.map((t) => [
      t.first_name,
      t.last_name,
      t.email,
      t.trade,
      String(t.years_experience ?? ""),
      String(t.hourly_rate ?? ""),
      t.phone,
      t.city,
      t.postcode,
      t.is_verified ? "Yes" : "No",
      t.is_approved ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tradespeople-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleVerifyTradesperson = async (tradespersonId: string) => {
    try {
      const response = await fetch(
        "/api/client/admin-secret/verify-tradesperson",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tradespersonId }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Tradesperson verified successfully!");
        loadData(); // Reload data
      } else {
        setError(data.error || "Failed to verify tradesperson");
      }
    } catch (err) {
      setError("Error verifying tradesperson");
    }
  };

  const openSuspendDialog = (tradespersonId: string) => {
    setSuspendTpId(tradespersonId);
    setSuspendReason("");
    setSuspendDialogOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!suspendTpId) return;
    setSuspendLoading(true);
    setError("");
    try {
      const response = await fetch("/api/client/admin-secret/suspend-tradesperson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradespersonId: suspendTpId,
          reason: suspendReason.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Tradesperson suspended.");
        setSuspendDialogOpen(false);
        setSuspendTpId(null);
        loadData();
      } else {
        setError(data.error || "Failed to suspend");
      }
    } catch {
      setError("Error suspending tradesperson");
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleReactivateTradesperson = async (tradespersonId: string) => {
    setError("");
    try {
      const response = await fetch("/api/client/admin-secret/reactivate-tradesperson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tradespersonId }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "Tradesperson reactivated.");
        loadData();
      } else {
        setError(data.error || "Failed to reactivate");
      }
    } catch {
      setError("Error reactivating tradesperson");
    }
  };

  const handleApproveQuotation = async (
    applicationId: string,
    action: "approve" | "reject"
  ) => {
    console.log(`Admin: ${action}ing quotation ${applicationId}`);
    try {
      const response = await fetch(
        "/api/client/approve-quotation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ applicationId, action }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(`Quotation ${action}d successfully!`);
        
        // Reload applications data immediately
        const applicationsResponse = await fetch("/api/client/admin-secret/job-applications");
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData.applications || []);
        }
        
        // Also reload all data to ensure consistency
        loadData();
      } else {
        setError(data.error || `Failed to ${action} quotation`);
      }
    } catch (err) {
      setError(`Error ${action}ing quotation`);
    }
  };

  const loadAvailableTradespeople = async (
    jobTrade: string,
    jobPostcode: string
  ) => {
    try {
      const { data: tradespeople, error } = await fetch(
        "/api/client/admin-secret/tradespeople"
      ).then((res) => res.json());

      if (error) {
        console.error("Error loading tradespeople:", error);
        return;
      }

      // Filter by trade and location
      const filteredTradespeople =
        tradespeople?.filter((tp: any) => {
          return tp.trade === jobTrade && tp.is_approved && tp.is_verified;
        }) || [];

      setAvailableTradespeople(filteredTradespeople);
    } catch (err) {
      console.error("Error in loadAvailableTradespeople:", err);
    }
  };

  const loadJobApplications = async (jobId: string) => {
    try {
      const { data, error } = await fetch(
        "/api/client/admin-secret/job-applications"
      ).then((res) => res.json());
      if (!error) setJobApplications(data || []);
      else setJobApplications([]);
    } catch (err) {
      setJobApplications([]);
    }
  };

  const handleAssignJob = (job: any) => {
    if (job.assigned_by === "client") {
      setError(
        "This job is already assigned by client. Admin cannot reassign."
      );
      return;
    }
    setSelectedJobForAssignment(job);
    setJobApplications([]);
    loadJobApplications(job.id);
    setShowAssignmentDialog(true);
  };

  const submitAssignment = async (application: any) => {
    if (!selectedJobForAssignment) {
      setError("Please select an application");
      return;
    }
    setAssigning(true);
    setError("");
    try {
      const response = await fetch("/api/client/admin-secret/assign-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJobForAssignment.id,
          tradespersonId: application.tradespeople.id,
          quotationAmount: application.quotation_amount,
          quotationNotes: application.quotation_notes,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Job assigned successfully!");
        setShowAssignmentDialog(false);
        loadData();
      } else {
        setError(data.error || "Failed to assign job");
      }
    } catch (err) {
      setError("Error assigning job");
    } finally {
      setAssigning(false);
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
    return stars;
  };

  const handleViewApplication = (application: JobApplication) => {
    // TODO: Implement view application details
    console.log("View application:", application);
  };

  const handleApproveApplication = async (applicationId: string) => {
    console.log(`Admin: approving application ${applicationId}`);
    try {
      const response = await fetch("/api/client/admin-secret/approve-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Application approved successfully!");
        
        // Reload applications data immediately
        const applicationsResponse = await fetch("/api/client/admin-secret/job-applications");
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setApplications(applicationsData.applications || []);
        }
        
        // Also reload all data to ensure consistency
        loadData();
      } else {
        setError(data.error || "Failed to approve application");
      }
    } catch (err) {
      setError("Error approving application");
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    console.log(`Admin: rejecting application ${applicationId}`);
    try {
      const response = await fetch("/api/client/admin-secret/reject-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationId }),
      });

      const data = await response.json();
      console.log('Reject response:', { status: response.status, data });

      if (response.ok) {
        console.log('Application rejected successfully');
        setMessage("Application rejected successfully!");
        
        // Reload applications data immediately
        const applicationsResponse = await fetch("/api/client/admin-secret/job-applications");
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          console.log('Reloaded applications after reject:', applicationsData.applications?.length);
          setApplications(applicationsData.applications || []);
        }
        
        // Also reload all data to ensure consistency
        loadData();
      } else {
        console.error('Failed to reject application:', data);
        setError(data.error || "Failed to reject application");
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError("Error rejecting application");
    }
  };

  const handleViewCompletedJob = (job: Job) => {
    // TODO: Implement view completed job details
    console.log("View completed job:", job);
  };

  const handleViewTradesperson = async (tradesperson: Tradesperson) => {
    setShowTradespersonDialog(true);
    setTradespersonDetailsLoading(true);
    setSelectedTradesperson(tradesperson);
    setSelectedTradespersonDocs([]);
    try {
      const res = await fetch(`/api/client/admin-secret/tradespeople/${tradesperson.id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load tradesperson details");
        return;
      }
      setSelectedTradesperson(data.tradesperson || tradesperson);
      setSelectedTradespersonDocs(data.documents || []);
    } catch (e) {
      setError("Failed to load tradesperson details");
    } finally {
      setTradespersonDetailsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div>Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  // Filter jobs by status
  const pendingJobs = jobs.filter((job) => !job.is_approved);
  const availableJobs = jobs.filter(
    (job) =>
      job.is_approved && !job.assigned_tradesperson_id && !job.is_completed
  );
  const inProgressJobs = jobs.filter(
    (job) => job.assigned_tradesperson_id && !job.is_completed
  );
  const completedJobs = jobs.filter((job) => job.is_completed);

  // Filters
  const sq = searchQuery.trim().toLowerCase();
  const filteredTradespeople = tradespeople.filter((t) =>
    [t.first_name, t.last_name, t.email, t.trade, t.city, t.postcode].some((v) => (v || "").toString().toLowerCase().includes(sq))
  );
  const filteredJobs = jobs.filter((j) =>
    [j.trade, j.postcode, j.clients?.first_name, j.clients?.last_name, j.job_description].some((v:any) => (v || "").toString().toLowerCase().includes(sq))
  );
  const totalTpPages = Math.max(1, Math.ceil(filteredTradespeople.length / pageSize));
  const totalJobsPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const pagedTradespeople = filteredTradespeople.slice((tpPage-1)*pageSize, tpPage*pageSize);
  const pagedJobs = filteredJobs.slice((jobsPage-1)*pageSize, jobsPage*pageSize);

  // Debug logging
  console.log("Admin dashboard - Jobs state:", {
    totalJobs: jobs.length,
    pendingJobs: pendingJobs.length,
    availableJobs: availableJobs.length,
    inProgressJobs: inProgressJobs.length,
    completedJobs: completedJobs.length,
    jobsData: jobs,
  });
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Section>
      <Container size="wide">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-4">
              <h1 className="text-3xl font-extrabold text-brand-navy">Admin Dashboard</h1>
              </div>
              <p className="text-gray-600">Manage tradespeople, jobs, and applications</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block">
                <Input
                  placeholder="Search tradespeople or jobs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setTpPage(1);
                    setJobsPage(1);
                  }}
                  className="w-64 pr-10"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-xs">Search</span>
              </div>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={exportTradespeopleCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="hover:shadow-md transition">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center"><Users className="w-5 h-5"/></div>
          <div>
            <div className="text-2xl font-bold">{tradespeople.length}</div>
            <div className="text-sm text-gray-600">Total Tradespeople</div>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center"><ListChecks className="w-5 h-5"/></div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{pendingJobs.length}</div>
            <div className="text-sm text-gray-600">Pending Jobs</div>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center"><Clock className="w-5 h-5"/></div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{inProgressJobs.length}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center"><CheckCircle className="w-5 h-5"/></div>
          <div>
            <div className="text-2xl font-bold text-green-600">{completedJobs.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </CardContent>
      </Card>
    </div>

    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-6"
    >
      <div className="sticky top-16 z-30">
        <TabsList className="bg-white/90 backdrop-blur p-1 rounded-xl shadow border">
          <TabsTrigger value="tradespeople">Tradespeople</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
          <TabsTrigger value="flagged-jobs">Flagged Jobs</TabsTrigger>
          <TabsTrigger value="support-chat">
            <MessageCircle className="w-4 h-4 mr-1" />
            Support Chat
          </TabsTrigger>
          <TabsTrigger value="disputes" className="bg-red-50 border-red-200 text-red-800 hover:bg-red-100">
            <AlertTriangle className="w-4 h-4 mr-1" />
            🚨 Disputes
          </TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="quote-requests">Quote Requests</TabsTrigger>
          <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
          <TabsTrigger value="empire" className="bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100">
            <Zap className="w-4 h-4 mr-1" />
            Empire
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tradespeople Tab */}
      <TabsContent value="tradespeople">
        <Card className="shadow-lg rounded-xl border">
          <CardHeader>
            <CardTitle>Registered Tradespeople</CardTitle>
            <CardDescription>
              Review and verify tradesperson registrations
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[26%]">Name</TableHead>
                  <TableHead className="w-[14%]">Trade</TableHead>
                  <TableHead className="w-[22%]">Contact</TableHead>
                  <TableHead className="w-[16%]">Location</TableHead>
                  <TableHead className="w-[14%]">Status</TableHead>
                  <TableHead className="w-[8%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedTradespeople.map((tradesperson) => (
                  <TableRow key={tradesperson.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{tradesperson?.first_name} {tradesperson?.last_name}</div>
                          <div className="text-xs text-gray-500">{tradesperson?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">{tradesperson?.trade}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{tradesperson?.phone}</div>
                        <div className="text-xs text-gray-500">{tradesperson?.years_experience} yrs â€¢ Â£{tradesperson?.hourly_rate}/hr</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{tradesperson?.postcode}</div>
                        <div className="text-xs text-gray-500">{tradesperson?.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full px-3 py-1" variant={tradesperson?.is_verified ? "default" : "secondary"}>
                          {tradesperson?.is_verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge className="rounded-full px-3 py-1" variant={tradesperson?.is_approved ? "default" : "secondary"}>
                          {tradesperson?.is_approved ? "Approved" : "Pending"}
                        </Badge>
                        {tradesperson?.is_active === false && (
                          <Badge variant="destructive" className="rounded-full px-3 py-1">
                            Suspended
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {!tradesperson?.is_verified && (
                        <Button
                          onClick={() =>
                            handleVerifyTradesperson(tradesperson.id)
                          }
                          size="sm"
                          className="mr-2 rounded-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                      )}
                      {tradesperson?.is_active !== false ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mr-2 rounded-full"
                          onClick={() => openSuspendDialog(tradesperson.id)}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2 rounded-full"
                          onClick={() => handleReactivateTradesperson(tradesperson.id)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Reactivate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleViewTradesperson(tradesperson)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">{filteredTradespeople.length} total â€¢ Page {tpPage} of {totalTpPages}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={tpPage<=1} onClick={() => setTpPage((p)=>Math.max(1,p-1))}>Prev</Button>
                <Button variant="outline" size="sm" disabled={tpPage>=totalTpPages} onClick={() => setTpPage((p)=>Math.min(totalTpPages,p+1))}>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Jobs Tab */}
      <TabsContent value="jobs">
        <Card>
          
          <CardContent>
            {pagedJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No jobs found</p>
                <p className="text-sm text-gray-400">Jobs loaded: {filteredJobs.length}</p>
                <p className="text-sm text-gray-400">Loading: {loading ? "Yes" : "No"}</p>
                <Button onClick={handleRefresh} variant="outline" className="mt-2">Refresh Data</Button>
              </div>
            ) : (
              <Table className="min-w-full">
                
                <TableBody>
                  {submittedJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.client_name}</div>
                          <div className="text-sm text-gray-500">{job.client_email}</div>
                          <div className="text-sm text-gray-500">{job.client_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.trade}</Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className="max-w-xs truncate"
                          title={job.job_description}
                        >
                          {job.job_description}
                        </div>
                      </TableCell>
                      <TableCell>{job.postcode}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            job.urgency === 'emergency'
                              ? 'destructive'
                              : job.urgency === 'urgent'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {job.urgency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {job.budget ? `£${job.budget}` : 'Not specified'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            job.status === 'approved'
                              ? 'default'
                              : job.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(job.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {job.status === 'pending_approval' && (
                            <>
                              <Button
                                onClick={() => handleApproveJob(job.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectJob(job.id)}
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              // View job details
                              console.log('View job:', job);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {/* Pagination */}
            {submittedJobs.length > 0 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-sm text-gray-600">
                  Page {jobsPage} of {totalJobsPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={jobsPage <= 1}
                    onClick={() => {
                      setJobsPage(jobsPage - 1);
                      loadSubmittedJobs();
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={jobsPage >= totalJobsPages}
                    onClick={() => {
                      setJobsPage(jobsPage + 1);
                      loadSubmittedJobs();
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Jobs Tab */}
      <TabsContent value="jobs">
        <Card>
          <CardHeader>
            <CardTitle>Posted Jobs</CardTitle>
            <CardDescription>
              Review and approve job postings from clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pagedJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No jobs found</p>
                <p className="text-sm text-gray-400">Jobs loaded: {filteredJobs.length}</p>
                <p className="text-sm text-gray-400">Loading: {loading ? "Yes" : "No"}</p>
                <Button onClick={handleRefresh} variant="outline" className="mt-2">Refresh Data</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Trade</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedJobs.map((job) => job && (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job?.clients?.first_name} {job?.clients?.last_name}</div>
                          <div className="text-sm text-gray-500">{job?.clients?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job?.trade}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={job?.job_description}>{job?.job_description}</div>
                      </TableCell>
                      <TableCell>{job?.postcode}</TableCell>
                      <TableCell>Â£{job?.budget || "Not specified"} ({job?.budget_type})</TableCell>
                      <TableCell>
                        {job?.assigned_tradesperson_id ? (
                          <div className="text-sm">
                            <div className="font-medium">Assigned</div>
                            <div className="text-gray-500">ID: {job?.assigned_tradesperson_id}</div>
                            {job?.quotation_amount && (
                              <div className="text-green-600">Â£{job?.quotation_amount}</div>
                            )}
                            {job?.assigned_by && (
                              <div className="text-xs text-gray-400">By: {job?.assigned_by === "client" ? "Client" : "Admin"}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {!job.is_approved && (
                            <Button onClick={() => handleApproveJob(job.id)} size="sm">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {job.is_approved &&
                            !job.is_completed &&
                            !job.assigned_tradesperson_id && (
                              <Button
                                onClick={() => openInviteDialog(job)}
                                size="sm"
                                variant="outline"
                              >
                                <Mail className="w-4 h-4 mr-1" />
                                Invite
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {/* Pagination */}
            {filteredJobs.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">{filteredJobs.length} total â€¢ Page {jobsPage} of {totalJobsPages}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={jobsPage<=1} onClick={() => setJobsPage((p)=>Math.max(1,p-1))}>Prev</Button>
                      <Button variant="outline" size="sm" disabled={jobsPage>=totalJobsPages} onClick={() => setJobsPage((p)=>Math.min(totalJobsPages,p+1))}>Next</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations">
            <Card>
              <CardHeader>
                <CardTitle>Job Quotations</CardTitle>
                <CardDescription>
                  Review and approve/reject tradesperson quotations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Details</TableHead>
                      <TableHead>Tradesperson</TableHead>
                      <TableHead>Quotation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {application.jobs.trade}
                            </div>
                            <div
                              className="text-sm text-gray-600 max-w-xs truncate"
                              title={application.jobs.job_description}
                            >
                              {application.jobs.job_description}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.jobs.postcode}
                            </div>
                            <div className="text-xs text-gray-400">
                              Client: {application.jobs.clients.first_name}{" "}
                              {application.jobs.clients.last_name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {application.tradespeople.first_name}{" "}
                              {application.tradespeople.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.tradespeople.trade}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.tradespeople.years_experience} years
                              exp.
                            </div>
                            <div className="text-xs text-gray-400">
                              Â£{application.tradespeople.hourly_rate}/hr
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-bold text-lg">
                              Â£{application.quotation_amount}
                            </div>
                            {application.quotation_notes && (
                              <div className="text-sm text-gray-600 mt-1">
                                {application.quotation_notes}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              application.status === "pending"
                                ? "secondary"
                                : application.status === "accepted"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(application.applied_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                    <Button
                              size="sm"
                      variant="outline"
                              onClick={() => handleViewApplication(application)}
                    >
                              <Eye className="w-4 h-4" />
                    </Button>
                          {application.status === "pending" && (
                              <>
                              <Button
                                size="sm"
                                  onClick={() => handleApproveApplication(application.id)}
                                  className="bg-green-600 hover:bg-green-700"
                              >
                                  <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                  onClick={() => handleRejectApplication(application.id)}
                                  className="bg-red-600 hover:bg-red-700"
                              >
                                  <XCircle className="w-4 h-4" />
                              </Button>
                              </>
                          )}
                  </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flagged Jobs Tab */}
          <TabsContent value="flagged-jobs">
            <Card className="shadow-lg rounded-xl border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  Flagged Jobs
                </CardTitle>
                <CardDescription>
                  Review and manage jobs that have been flagged for issues
                </CardDescription>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => {
                      setFlaggedJobsStatus("flagged");
                      loadFlaggedJobs();
                    }}
                    variant={flaggedJobsStatus === "flagged" ? "default" : "outline"}
                    size="sm"
                  >
                    Currently Flagged
                  </Button>
                  <Button
                    onClick={() => {
                      setFlaggedJobsStatus("resolved");
                      loadFlaggedJobs();
                    }}
                    variant={flaggedJobsStatus === "resolved" ? "default" : "outline"}
                    size="sm"
                  >
                    Resolved
                  </Button>
                  <Button
                    onClick={() => {
                      setFlaggedJobsStatus("all");
                      loadFlaggedJobs();
                    }}
                    variant={flaggedJobsStatus === "all" ? "default" : "outline"}
                    size="sm"
                  >
                    All
                  </Button>
                  <Button
                    onClick={loadFlaggedJobs}
                    variant="outline"
                    size="sm"
                    disabled={flaggedJobsLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${flaggedJobsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {flaggedJobsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading flagged jobs...</p>
                  </div>
                ) : flaggedJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <Flag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      No flagged jobs found
                    </div>
                    <p className="text-gray-500 mb-4">
                      {flaggedJobsStatus === "flagged" 
                        ? "No jobs are currently flagged" 
                        : "No flagged jobs match the selected filter"}
                    </p>
                    <Button onClick={loadFlaggedJobs} variant="outline">
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Details</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Tradesperson</TableHead>
                        <TableHead>Flag Reason</TableHead>
                        <TableHead>Flagged By</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flaggedJobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                {job.trade}
                              </div>
                              <div
                                className="text-sm text-gray-600 max-w-xs truncate"
                                title={job.job_description}
                              >
                                {job.job_description}
                              </div>
                              <div className="text-sm text-gray-500">{job.postcode}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{job.client_name}</div>
                              <div className="text-sm text-gray-500">{job.client_email}</div>
                              <div className="text-sm text-gray-500">{job.client_phone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {job.tradesperson_name !== 'Not Assigned' ? (
                                <>
                                  <div className="font-medium">{job.tradesperson_name}</div>
                                  <div className="text-gray-500">{job.tradespeople?.email}</div>
                                </>
                              ) : (
                                <span className="text-gray-400">Not Assigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="text-sm text-gray-900" title={job.flag_reason}>
                                {job.flag_reason?.substring(0, 100)}
                                {job.flag_reason?.length > 100 && '...'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <Badge variant="outline">
                                {job.flagged_by_type || 'Unknown'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={job.is_flagged ? "destructive" : "default"}
                            >
                              {job.is_flagged ? "Flagged" : "Resolved"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-500">
                              {job.is_flagged 
                                ? new Date(job.flagged_at).toLocaleDateString()
                                : job.unflagged_at 
                                  ? new Date(job.unflagged_at).toLocaleDateString()
                                  : 'N/A'
                              }
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {job.is_flagged && (
                                <Button
                                  onClick={() => handleUnflagJob(job)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Resolve
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // View job details
                                  console.log('View flagged job:', job);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                
                {/* Pagination */}
                {flaggedJobs.length > 0 && (
                  <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-gray-600">
                      Page {flaggedJobsPage} of {totalFlaggedPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={flaggedJobsPage <= 1}
                        onClick={() => {
                          setFlaggedJobsPage(flaggedJobsPage - 1);
                          loadFlaggedJobs();
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={flaggedJobsPage >= totalFlaggedPages}
                        onClick={() => {
                          setFlaggedJobsPage(flaggedJobsPage + 1);
                          loadFlaggedJobs();
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quote Requests Tab */}
          <TabsContent value="quote-requests">
            <SimpleQuoteRequests />
          </TabsContent>

          {/* Completed Jobs Tab */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Jobs</CardTitle>
                <CardDescription>
                  Review completed jobs and ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Details</TableHead>
                      <TableHead>Tradesperson</TableHead>
                      <TableHead>Client Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{job.trade}</div>
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {job.job_description}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.postcode}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                            <div>
                              <div className="font-medium">
                              {job.tradespeople?.first_name}{" "}
                              {job.tradespeople?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                              {job.tradespeople?.trade}
                              </div>
                            </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="font-medium">
                              {job.job_reviews?.[0]?.rating || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {job.job_reviews?.[0]?.review_text || "No review"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {job.completed_at
                              ? new Date(job.completed_at).toLocaleDateString()
                              : "N/A"}
                                  </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewCompletedJob(job)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Empire Tab — trigger Khamareclarke Empire for MyApproved */}
          <TabsContent value="empire">
            <Card className="shadow-lg rounded-xl border">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  Empire OS: Trigger for MyApproved
                </CardTitle>
                <CardDescription>
                  Run the Sales or Growth team on the central Empire dashboard for this project. Results appear on Khamareclarke.com Empire dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {empireMessage && (
                  <Alert variant={empireMessage.startsWith("Error") ? "destructive" : "default"}>
                    <AlertDescription>{empireMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={async () => {
                      setEmpireTriggering(true);
                      setEmpireMessage("");
                      try {
                        const res = await fetch("/api/empire-trigger", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ teamId: "SALES_TEAM", runPending: true }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setEmpireMessage(`Error: ${data.error || res.statusText}`);
                          return;
                        }
                        setEmpireMessage(
                          `Triggered. ${data.taskCount ?? 0} tasks created and running. Check Empire dashboard for results.`
                        );
                      } catch (e) {
                        setEmpireMessage(`Error: ${e instanceof Error ? e.message : "Request failed"}`);
                      } finally {
                        setEmpireTriggering(false);
                      }
                    }}
                    disabled={empireTriggering}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {empireTriggering ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Triggering...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Trigger Sales Team (and run now)
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={async () => {
                      setEmpireTriggering(true);
                      setEmpireMessage("");
                      try {
                        const res = await fetch("/api/empire-trigger", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ teamId: "GROWTH_TEAM", runPending: true }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          setEmpireMessage(`Error: ${data.error || res.statusText}`);
                          return;
                        }
                        setEmpireMessage(
                          `Triggered. ${data.taskCount ?? 0} tasks created and running. Check Empire dashboard for results.`
                        );
                      } catch (e) {
                        setEmpireMessage(`Error: ${e instanceof Error ? e.message : "Request failed"}`);
                      } finally {
                        setEmpireTriggering(false);
                      }
                    }}
                    disabled={empireTriggering}
                    variant="outline"
                    className="border-amber-300 text-amber-800 hover:bg-amber-50"
                  >
                    {empireTriggering ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Triggering...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Trigger Growth Team (and run now)
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Requires <code className="bg-gray-100 px-1 rounded">EMPIRE_WEBHOOK_SECRET</code> in .env.local (same value as on Khamareclarke.com).
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Chat Tab */}
          <TabsContent value="support-chat">
            <Card className="shadow-lg rounded-xl border">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Support Chat & Tickets
                </CardTitle>
                <CardDescription>
                  Manage AI assistant escalations and support conversations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Support Tickets Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSupportStatus("open");
                        loadSupportTickets();
                      }}
                      variant={supportStatus === "open" ? "default" : "outline"}
                      size="sm"
                    >
                      Open
                    </Button>
                    <Button
                      onClick={() => {
                        setSupportStatus("assigned");
                        loadSupportTickets();
                      }}
                      variant={supportStatus === "assigned" ? "default" : "outline"}
                      size="sm"
                    >
                      Assigned
                    </Button>
                    <Button
                      onClick={() => {
                        setSupportStatus("resolved");
                        loadSupportTickets();
                      }}
                      variant={supportStatus === "resolved" ? "default" : "outline"}
                      size="sm"
                    >
                      Resolved
                    </Button>
                    <Button
                      onClick={() => {
                        setSupportStatus("all");
                        loadSupportTickets();
                      }}
                      variant={supportStatus === "all" ? "default" : "outline"}
                      size="sm"
                    >
                      All
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setSupportPriority("urgent");
                        loadSupportTickets();
                      }}
                      variant={supportPriority === "urgent" ? "destructive" : "outline"}
                      size="sm"
                    >
                      🚨 Urgent
                    </Button>
                    <Button
                      onClick={() => {
                        setSupportPriority("high");
                        loadSupportTickets();
                      }}
                      variant={supportPriority === "high" ? "secondary" : "outline"}
                      size="sm"
                    >
                      ⚡ High
                    </Button>
                    <Button
                      onClick={() => {
                        setSupportPriority("normal");
                        loadSupportTickets();
                      }}
                      variant={supportPriority === "normal" ? "default" : "outline"}
                      size="sm"
                    >
                      Normal
                    </Button>
                  </div>
                  <Button
                    onClick={loadSupportTickets}
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>

                {/* Support Tickets Table */}
                {supportTicketsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading support tickets...</p>
                    </div>
                  </div>
                ) : supportTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <HeadphonesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-extrabold text-brand-navy mb-2">No support tickets</h3>
                    <p className="text-gray-600 mb-4">
                      {supportStatus === "all" 
                        ? "No support tickets found"
                        : `No ${supportStatus} support tickets found`}
                    </p>
                    <Button onClick={loadSupportTickets} variant="outline">
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {supportTickets.map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{ticket.user_name}</div>
                                <div className="text-sm text-gray-500">
                                  📧 {ticket.user_email}
                                </div>
                                {ticket.user_phone && (
                                  <div className="text-sm text-gray-600">
                                    📞 {ticket.user_phone}
                                  </div>
                                )}
                                {ticket.job_info && (
                                  <Badge variant="outline" className="mt-1">
                                    {ticket.job_info.trade} - {ticket.job_info.postcode}
                                  </Badge>
                                )}
                                {ticket.contact_type && (
                                  <Badge variant="secondary" className="mt-1">
                                    {ticket.contact_type === 'payment' && '💳 Payment'}
                                    {ticket.contact_type === 'account' && '🔐 Account'}
                                    {ticket.contact_type === 'support' && '👤 Support'}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant={ticket.user_type === 'client' ? 'default' : 'secondary'}>
                                  {ticket.user_type}
                                </Badge>
                                <Badge variant={ticket.source === 'local' ? 'outline' : 'default'} className="text-xs">
                                  {ticket.source === 'local' ? '📝 Local' : '💾 Database'}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{ticket.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  ticket.priority === 'urgent' ? 'destructive' :
                                  ticket.priority === 'high' ? 'secondary' : 'outline'
                                }
                              >
                                {ticket.priority === 'urgent' && '🚨 '}
                                {ticket.priority === 'high' && '⚡ '}
                                {ticket.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  ticket.status === 'open' ? 'destructive' :
                                  ticket.status === 'assigned' ? 'secondary' :
                                  ticket.status === 'resolved' ? 'default' : 'outline'
                                }
                              >
                                {ticket.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={ticket.original_message}>
                                {ticket.original_message}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {ticket.status === 'open' ? (
                                <Button
                                  onClick={() => handleQuickResolveTicket(ticket.id)}
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  ✅ Resolve
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-green-600">
                                  ✅ Resolved
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Page {supportTicketsPage} of {totalSupportPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          disabled={supportTicketsPage <= 1}
                          onClick={() => {
                            setSupportTicketsPage(supportTicketsPage - 1);
                            loadSupportTickets();
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Button
                          disabled={supportTicketsPage >= totalSupportPages}
                          onClick={() => {
                            setSupportTicketsPage(supportTicketsPage + 1);
                            loadSupportTickets();
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Disputes Only Tab */}
          <TabsContent value="disputes">
            <Card className="shadow-lg rounded-xl border">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Dispute Issues Only
                </CardTitle>
                <CardDescription>
                  Manage dispute issues submitted through the AI chat system
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {/* Simple Refresh Button */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">
                      Disputes
                    </span>
                  </div>
                  <Button
                    onClick={loadDisputes}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>

                {/* Disputes Table */}
                {disputesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading disputes...</p>
                    </div>
                  </div>
                ) : disputes.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-extrabold text-brand-navy mb-2">No disputes found</h3>
                    <p className="text-gray-600 mb-4">
                      {disputeStatus === "all" 
                        ? "No dispute issues have been submitted"
                        : `No ${disputeStatus} disputes found`}
                    </p>
                    <Button onClick={loadDisputes} variant="outline">
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contact Info</TableHead>
                          <TableHead>User Type</TableHead>
                          <TableHead>Issue Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {disputes.map((dispute) => (
                          <TableRow key={dispute.id} className="border-l-4 border-l-red-500">
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">
                                  📧 {dispute.userEmail || dispute.user_email || 'Not provided'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  📞 {dispute.userPhone || 'Not provided'}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {dispute.user_name || dispute.userName || 'User'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={dispute.user_type === 'client' ? 'default' : 'secondary'}>
                                {dispute.user_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-sm">
                              <div className="text-sm">
                                <div className="font-medium text-red-800 mb-1">Issue:</div>
                                <div className="text-gray-700 line-clamp-3">
                                  {dispute.disputeDetails || dispute.original_message}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  dispute.status === 'open' ? 'destructive' :
                                  dispute.status === 'resolved' ? 'default' : 'outline'
                                }
                              >
                                {dispute.status === 'open' && '🚨 '}
                                {dispute.status === 'resolved' && '✅ '}
                                {dispute.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(dispute.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {dispute.status === 'open' ? (
                                <Button
                                  onClick={() => handleQuickResolve(dispute.id)}
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  ✅ Resolve
                                </Button>
                              ) : (
                                <Badge variant="outline" className="text-green-600">
                                  ✅ Resolved
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Page {disputesPage} of {totalDisputePages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          disabled={disputesPage <= 1}
                          onClick={() => {
                            setDisputesPage(disputesPage - 1);
                            loadDisputes();
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Previous
                        </Button>
                        <Button
                          disabled={disputesPage >= totalDisputePages}
                          onClick={() => {
                            setDisputesPage(disputesPage + 1);
                            loadDisputes();
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled-notifications">
            <Card className="shadow-lg rounded-xl border">
              <CardHeader>
                <CardTitle>Scheduled notifications</CardTitle>
                <CardDescription>
                  Lifecycle emails (reviews, reminders, re-engagement) and optional auto-assign.
                  Ensure Vercel cron calls{" "}
                  <code className="text-xs">/api/notifications/process-scheduled</code> with{" "}
                  <code className="text-xs">CRON_SECRET</code>.
                </CardDescription>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => loadScheduledNotifications()}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {scheduledLoading ? (
                  <p className="text-sm text-gray-600">Loading…</p>
                ) : scheduledRows.length === 0 ? (
                  <p className="text-sm text-gray-600">No rows returned.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>When</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Dedupe</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledRows.map((row: any) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {row.scheduled_for
                              ? new Date(row.scheduled_for).toLocaleString()
                              : "N/A"}
                          </TableCell>
                          <TableCell className="text-sm font-mono">{row.event_type}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{row.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs max-w-[180px] truncate">
                            {row.recipient_email || row.recipient_id || "N/A"}
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate font-mono">
                            {row.dedupe_key || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab – Job posted → N trades notified */}
          <TabsContent value="activity">
            <Card className="shadow-lg rounded-xl border">
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  Job postings and notifications (e.g. Job #ID posted → N trades notified)
                </CardDescription>
                <Button onClick={loadData} variant="outline" size="sm" className="mt-2">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {activityLog.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No activity yet. When a client posts a job, you will see entries like &quot;Job #ID posted → N trades notified.&quot;
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLog.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(entry.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{entry.action}</Badge>
                          </TableCell>
                          <TableCell>
                            {entry.entity_type} {entry.entity_id ? `#${entry.entity_id.slice(0, 8)}` : ''}
                          </TableCell>
                          <TableCell>
                            {entry.action === 'job_posted' && entry.details && typeof entry.details === 'object' && 'notified_count' in entry.details ? (
                              <span>Job posted → <strong>{(entry.details as { notified_count?: number }).notified_count ?? 0} trades notified</strong></span>
                            ) : entry.action === 'job_approved' && entry.details && typeof entry.details === 'object' && 'notified_count' in entry.details ? (
                              <span>Job approved → <strong>{(entry.details as { notified_count?: number }).notified_count ?? 0} trades notified</strong></span>
                            ) : entry.action === 'quote_accepted' && entry.details && typeof entry.details === 'object' && 'tradesperson_name' in entry.details ? (
                              <span>Quote accepted → Job assigned to <strong>{(entry.details as { tradesperson_name?: string }).tradesperson_name ?? 'N/A'}</strong>
                                {(entry.details as { accepted_at?: string }).accepted_at && (
                                  <span className="text-gray-500 text-xs ml-1">({new Date((entry.details as { accepted_at: string }).accepted_at).toLocaleString()})</span>
                                )}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-600">{JSON.stringify(entry.details)}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
         </Tabs>

         {/* Invite tradespeople Dialog */}
         <Dialog
           open={showInviteDialog}
           onOpenChange={(open) => {
             setShowInviteDialog(open);
             if (!open) {
               setSelectedJobForInvite(null);
               setInviteEmailsText("");
               setInviteResult("");
             }
           }}
         >
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle>Invite tradespeople</DialogTitle>
               <DialogDescription>
                 Email external tradespeople this live job and a MyApproved signup
                 link so they can register and apply.
               </DialogDescription>
             </DialogHeader>
             {selectedJobForInvite && (
               <div className="space-y-4">
                 <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                   <p>
                     <strong>Trade:</strong> {selectedJobForInvite.trade}
                   </p>
                   <p>
                     <strong>Location:</strong> {selectedJobForInvite.postcode}
                   </p>
                   <p>
                     <strong>Budget:</strong>{" "}
                     {selectedJobForInvite.budget
                       ? `£${selectedJobForInvite.budget} (${selectedJobForInvite.budget_type || "n/a"})`
                       : "Not specified"}
                   </p>
                   <p className="text-gray-600 line-clamp-3">
                     {selectedJobForInvite.job_description}
                   </p>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="invite-emails">Email addresses</Label>
                   <Textarea
                     id="invite-emails"
                     placeholder="one@email.com, two@email.com"
                     value={inviteEmailsText}
                     onChange={(e) => setInviteEmailsText(e.target.value)}
                     rows={4}
                   />
                   <p className="text-xs text-gray-500">
                     Separate with commas or new lines. Max 20 per send.
                   </p>
                 </div>
                 {inviteResult && (
                   <Alert>
                     <AlertDescription>{inviteResult}</AlertDescription>
                   </Alert>
                 )}
                 <Button
                   onClick={handleInviteTradespeople}
                   disabled={inviting}
                   className="w-full"
                 >
                   {inviting ? "Sending..." : "Send invites"}
                 </Button>
               </div>
             )}
           </DialogContent>
         </Dialog>

         {/* Assignment Dialog */}
         <Dialog
           open={showAssignmentDialog}
           onOpenChange={setShowAssignmentDialog}
         >
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle>Assign Job to Tradesperson</DialogTitle>
               <DialogDescription>
                 Select a tradesperson who has applied to this job. Their
                 quotation and notes are shown below.
               </DialogDescription>
             </DialogHeader>
             {selectedJobForAssignment && (
               <div className="space-y-4">
                 <div className="bg-gray-50 p-3 rounded">
                   <h4 className="font-semibold mb-2">Job Details:</h4>
                   <p className="text-sm text-gray-600">
                     {selectedJobForAssignment.job_description}
                   </p>
                   <p className="text-sm text-gray-600">
                     Trade: {selectedJobForAssignment.trade}
                   </p>
                   <p className="text-sm text-gray-600">
                     Location: {selectedJobForAssignment.postcode}
                   </p>
                   <p className="text-sm text-gray-600">
                     Client: {selectedJobForAssignment.clients.first_name}{" "}
                     {selectedJobForAssignment.clients.last_name}
                   </p>
                 </div>
                 <div>
                   <Label>Applicants:</Label>
                   <div className="space-y-2 max-h-60 overflow-y-auto">
                     {jobApplications.length === 0 ? (
                       <p className="text-sm text-gray-500">
                         No tradespeople have applied for this job yet.
                       </p>
                     ) : (
                       jobApplications.map((app) => (
                         <div key={app.id} className="border p-2 rounded">
                           <div className="font-medium">
                             {app.tradespeople.first_name}{" "}
                             {app.tradespeople.last_name}
                           </div>
                           <div className="text-sm text-gray-600">
                             Experience: {app.tradespeople.years_experience}{" "}
                             years | Rate: £{app.tradespeople.hourly_rate}/hr
                           </div>
                           <div className="text-sm text-gray-600 mt-1">
                             <strong>Quotation:</strong> £{app.quotation_amount}
                           </div>
                           {app.quotation_notes && (
                             <div className="text-sm text-gray-600 mt-1">
                               <strong>Notes:</strong> {app.quotation_notes}
                             </div>
                           )}
                           <Button
                             onClick={() => submitAssignment(app)}
                             disabled={assigning}
                             size="sm"
                             className="mt-2"
                           >
                             {assigning
                               ? "Assigning..."
                               : "Assign to This Tradesperson"}
                           </Button>
                         </div>
                       ))
                     )}
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <Button
                     variant="outline"
                     onClick={() => setShowAssignmentDialog(false)}
                     disabled={assigning}
                     className="flex-1"
                   >
                     Cancel
                   </Button>
                 </div>
               </div>
             )}
           </DialogContent>
         </Dialog>

         {/* Unflag Job Dialog */}
         <Dialog open={showUnflagDialog} onOpenChange={setShowUnflagDialog}>
           <DialogContent className="sm:max-w-md">
             <DialogHeader>
               <DialogTitle className="flex items-center gap-2">
                 <CheckCircle className="w-5 h-5 text-green-500" />
                 Resolve Flagged Job
               </DialogTitle>
               <DialogDescription>
                 Mark this flagged job as resolved. You can add admin notes about the resolution.
               </DialogDescription>
             </DialogHeader>
             {selectedJobForUnflag && (
               <div className="space-y-4">
                 <div className="bg-gray-50 p-3 rounded-xl">
                   <h4 className="font-semibold mb-2 text-sm">Job Details:</h4>
                   <p className="text-sm text-gray-600 mb-1">
                     <strong>Trade:</strong> {selectedJobForUnflag.trade}
                   </p>
                   <p className="text-sm text-gray-600 mb-1">
                     <strong>Description:</strong> {selectedJobForUnflag.job_description}
                   </p>
                   <p className="text-sm text-gray-600 mb-1">
                     <strong>Client:</strong> {selectedJobForUnflag.client_name}
                   </p>
                   <p className="text-sm text-gray-600">
                     <strong>Flag Reason:</strong> {selectedJobForUnflag.flag_reason}
                   </p>
                 </div>

                 <div>
                   <Label htmlFor="adminNotes" className="text-sm font-medium">
                     Admin Notes (Optional)
                   </Label>
                   <Textarea
                     id="adminNotes"
                     placeholder="Add notes about how this issue was resolved or any actions taken..."
                     value={adminNotes}
                     onChange={(e) => setAdminNotes(e.target.value)}
                     rows={3}
                     className="mt-1"
                   />
                 </div>

                 <div className="flex gap-3 pt-3">
                   <Button
                     variant="outline"
                     onClick={() => {
                       setShowUnflagDialog(false);
                       setAdminNotes("");
                       setSelectedJobForUnflag(null);
                     }}
                     disabled={unflagging}
                     className="flex-1"
                   >
                     Cancel
                   </Button>
                   <Button
                     onClick={submitUnflagJob}
                     disabled={unflagging}
                     className="flex-1 bg-green-600 hover:bg-green-700"
                   >
                     {unflagging ? "Resolving..." : "Resolve Issue"}
                   </Button>
                 </div>
               </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Suspend tradesperson</DialogTitle>
              <DialogDescription>
                They will stop receiving job matches until reactivated. An email is sent automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Label htmlFor="suspendReason">Reason (optional)</Label>
              <Textarea
                id="suspendReason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
                placeholder="Shown in the suspension email to the tradesperson."
              />
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => setSuspendDialogOpen(false)} disabled={suspendLoading}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmSuspend} disabled={suspendLoading}>
                  {suspendLoading ? "Suspending…" : "Confirm suspend"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dispute Resolution Dialog */}
        <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Resolve Dispute Issue
              </DialogTitle>
              <DialogDescription>
                Review and resolve dispute submitted through AI chat
              </DialogDescription>
            </DialogHeader>
            {selectedDispute && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-3 rounded-xl border border-red-200">
                    <h4 className="font-semibold mb-2 text-sm text-red-800">User Details:</h4>
                    <p className="text-sm text-red-700 mb-1">
                      <strong>Name:</strong> {selectedDispute.user_name}
                    </p>
                    <p className="text-sm text-red-700 mb-1">
                      <strong>Email:</strong> {selectedDispute.user_email}
                    </p>
                    <p className="text-sm text-red-700">
                      <strong>Type:</strong> {selectedDispute.user_type}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
                    <h4 className="font-semibold mb-2 text-sm text-orange-800">Dispute Info:</h4>
                    <p className="text-sm text-orange-700 mb-1">
                      <strong>Priority:</strong> HIGH
                    </p>
                    <p className="text-sm text-orange-700 mb-1">
                      <strong>Status:</strong> {selectedDispute.status}
                    </p>
                    <p className="text-sm text-orange-700">
                      <strong>Created:</strong> {new Date(selectedDispute.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedDispute.job_info && (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                    <h4 className="font-semibold mb-2 text-sm text-blue-800">Related Job:</h4>
                    <p className="text-sm text-blue-700 mb-1">
                      <strong>Trade:</strong> {selectedDispute.job_info.trade}
                    </p>
                    <p className="text-sm text-blue-700 mb-1">
                      <strong>Description:</strong> {selectedDispute.job_info.description}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Location:</strong> {selectedDispute.job_info.postcode}
                    </p>
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold mb-2 text-sm text-yellow-800">🚨 Dispute Details:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-line font-medium">{selectedDispute.original_message}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disputeStatus" className="text-sm font-medium">
                      Update Status
                    </Label>
                    <select
                      id="disputeStatus"
                      value={selectedDispute.status}
                      onChange={(e) => setSelectedDispute({...selectedDispute, status: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="open">🚨 Open</option>
                      <option value="assigned">👤 Assigned</option>
                      <option value="in_progress">⏳ In Progress</option>
                      <option value="resolved">✅ Resolved</option>
                      <option value="closed">🔒 Closed</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="disputeAssignee" className="text-sm font-medium">
                      Assign To
                    </Label>
                    <Input
                      id="disputeAssignee"
                      placeholder="Admin name or email"
                      value={disputeAssignee}
                      onChange={(e) => setDisputeAssignee(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="disputeNotes" className="text-sm font-medium">
                    Resolution Notes
                  </Label>
                  <Textarea
                    id="disputeNotes"
                    placeholder="Add notes about how this dispute was resolved, actions taken, or follow-up required..."
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDisputeDialog(false)}
                    disabled={updatingDispute}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDisputeUpdate(selectedDispute.id, {
                      status: selectedDispute.status,
                      assignedTo: disputeAssignee,
                      adminNotes: disputeNotes
                    })}
                    disabled={updatingDispute}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {updatingDispute ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Resolve Dispute
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showTradespersonDialog} onOpenChange={setShowTradespersonDialog}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Tradesperson registration details</DialogTitle>
              <DialogDescription>
                Full submitted form data and uploaded verification documents.
              </DialogDescription>
            </DialogHeader>
            {tradespersonDetailsLoading ? (
              <div className="py-8 text-center text-gray-500">Loading details...</div>
            ) : selectedTradesperson ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium">{selectedTradesperson.first_name} {selectedTradesperson.last_name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedTradesperson.email}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{selectedTradesperson.phone || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Trade</p>
                    <p className="font-medium">{selectedTradesperson.trade || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="font-medium">{selectedTradesperson.years_experience ?? "N/A"} years</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Hourly rate</p>
                    <p className="font-medium">£{selectedTradesperson.hourly_rate ?? "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium">{selectedTradesperson.address || "N/A"}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTradesperson.city || "N/A"}, {selectedTradesperson.postcode || "N/A"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Uploaded documents</h4>
                  {selectedTradespersonDocs.length === 0 ? (
                    <p className="text-sm text-gray-500">No document rows found for this tradesperson.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedTradespersonDocs.map((doc) => (
                        <div key={doc.id} className="border rounded-xl p-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-sm">{doc.doc_type || "document"}</p>
                            <p className="text-xs text-gray-500">{doc.file_path}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {doc.upload_date ? new Date(doc.upload_date).toLocaleString() : "—"}
                              {doc.expiry_date ? ` • Expiry: ${new Date(doc.expiry_date).toLocaleDateString()}` : ""}
                              {doc.doc_number ? ` • Number: ${doc.doc_number}` : ""}
                              {doc.status ? ` • Status: ${doc.status}` : ""}
                            </p>
                          </div>
                          {doc.signed_url ? (
                            <a
                              href={doc.signed_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                            >
                              Open file
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 whitespace-nowrap">No file link</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">No tradesperson selected.</div>
            )}
          </DialogContent>
        </Dialog>
       </Container>
     </Section>
     </div>
   );
 }
