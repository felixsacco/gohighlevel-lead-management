'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertCircle, CheckCircle, Wrench } from 'lucide-react';

interface QuoteRequest {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  project_type: string;
  project_description: string;
  location: string;
  timeframe: string;
  budget_range: string;
  status: string;
  admin_approved: boolean;
  tradesperson_quoted: boolean;
  client_approved: boolean;
  created_at: string;
  tradespersonName: string;
  tradespersonTrade: string;
  latestQuoteAmount?: number | null;
  latestQuoteDescription?: string | null;
  latestQuoteId?: string | null;
}

interface ClientQuoteRequestsProps {
  clientEmail: string;
  clientId?: string;
}

export default function ClientQuoteRequests({ clientEmail, clientId }: ClientQuoteRequestsProps) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (clientEmail) {
      fetchQuoteRequests();
    }
  }, [clientEmail]);

  const fetchQuoteRequests = async () => {
    try {
      const response = await fetch(`/api/client/quote-requests?email=${encodeURIComponent(clientEmail)}&ts=${Date.now()}`, { cache: 'no-store' } as RequestInit);
      const data = await response.json();

      if (data.success) {
        setQuoteRequests(data.quoteRequests);
      } else {
        setError('Failed to fetch quote requests');
      }
    } catch (err) {
      setError('Error fetching quote requests');
    } finally {
      setLoading(false);
    }
  };

  const approveOrReject = async (quoteId: string, action: 'approve' | 'reject') => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      const res = await fetch('/api/client/approve-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, action, clientId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Failed to ${action} quote`);
      } else {
        if (action === 'approve') {
          setSuccessMsg('Approved. Chat is now enabled with the tradesperson.');
        } else {
          setSuccessMsg('Quote rejected.');
        }
        await fetchQuoteRequests();
      }
    } catch (e) {
      setError(`Error trying to ${action} quote`);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const getStatusBadge = (request: QuoteRequest) => {
    if (request.admin_approved === false && request.status === 'admin_rejected') {
      return <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold border bg-rose-100 text-rose-800 border-rose-200">Rejected</span>;
    } else if (request.admin_approved === true && !request.tradesperson_quoted) {
      return <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold border bg-blue-100 text-blue-800 border-blue-200">Approved - Awaiting Quote</span>;
    } else if (request.tradesperson_quoted && !request.client_approved) {
      return <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-200">Quote Received</span>;
    } else if (request.client_approved) {
      return (
        <Button disabled className="h-7 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold px-3">
          ✓ Approved by You
        </Button>
      );
    } else {
      return <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold border bg-gray-100 text-gray-800 border-gray-200">Pending Admin Review</span>;
    }
  };

  const getStatusMessage = (request: QuoteRequest) => {
    if (request.admin_approved === false && request.status === 'admin_rejected') {
      return "Your quote request was not approved. You can submit a new request or contact us for assistance.";
    } else if (request.admin_approved === true && !request.tradesperson_quoted) {
      return `${request.tradespersonName} has been notified and will provide a quote within 24-48 hours.`;
    } else if (request.tradesperson_quoted && !request.client_approved) {
      return "A quote has been provided. Please review and approve or reject the quote.";
    } else if (request.client_approved) {
      return "You have approved this quote. The tradesperson will contact you to arrange the work.";
    } else {
      return "Your quote request is being reviewed by our admin team.";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (value?: number | null) => {
    if (value == null || isNaN(Number(value))) return '£—';
    try {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Number(value));
    } catch {
      return `£${value}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Quote Requests</h2>
        <button 
          onClick={fetchQuoteRequests}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMsg && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {quoteRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No quote requests found</p>
            <p className="text-sm text-gray-500 mt-2">
              Start by requesting a quote from a tradesperson
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {quoteRequests.map((request) => (
            <Card key={request.id} className="rounded-2xl border border-white/60 bg-white/95 backdrop-blur shadow-sm hover:shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">
                    Quote Request for {request.project_type || 'Project'}
                  </CardTitle>
                  {getStatusBadge(request)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Project Details</h4>
                    <p className="text-sm"><span className="text-gray-600">Type:</span> {request.project_type || 'Not specified'}</p>
                    <p className="text-sm"><span className="text-gray-600">Location:</span> {request.location}</p>
                    <p className="text-sm"><span className="text-gray-600">Timeframe:</span> {request.timeframe || 'Not specified'}</p>
                    <p className="text-sm"><span className="text-gray-600">Budget:</span> {request.budget_range || 'Not specified'}</p>
                    <p className="text-sm font-semibold mt-2">Description</p>
                    <p className="text-sm bg-gray-50 p-2 rounded mt-1 border border-gray-100">{request.project_description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-gray-600 mb-2">Tradesperson</h4>
                    <p className="text-sm"><span className="text-gray-600">Name:</span> {request.tradespersonName}</p>
                    <p className="text-sm inline-flex items-center gap-2"><Wrench className="w-4 h-4 text-blue-700" /> <span className="text-gray-600">Trade:</span> {request.tradespersonTrade}</p>
                    {request.latestQuoteAmount != null && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800"><strong>Quote Amount:</strong> {formatCurrency(request.latestQuoteAmount)}</p>
                        {request.latestQuoteDescription && (
                          <p className="text-xs text-green-700 mt-1">{request.latestQuoteDescription}</p>
                        )}
                        {!request.client_approved && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              onClick={() => request.latestQuoteId && approveOrReject(request.latestQuoteId, 'approve')}
                              className="h-8 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black text-sm font-semibold"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => request.latestQuoteId && approveOrReject(request.latestQuoteId, 'reject')}
                              className="h-8 rounded-xl text-white bg-red-600 hover:bg-red-700 text-sm"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{getStatusMessage(request)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-gray-500">Requested on {formatDate(request.created_at)}</p>
                  <div className="text-[11px] inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-800">Trades Fully Verified</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-800">MyApproved Guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 