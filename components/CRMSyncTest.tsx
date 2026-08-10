"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { testCRMConnection, syncJobToCRM, getCRMSyncQueueStatus, clearCRMSyncQueue } from "@/lib/crm-sync";
import { Loader2, CheckCircle, XCircle, RefreshCw, Trash2 } from "lucide-react";

export default function CRMSyncTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [queueStatus, setQueueStatus] = useState<any>(null);

  // Test job data
  const [testJob, setTestJob] = useState({
    id: `test_job_${Date.now()}`,
    clientName: "John Doe",
    clientEmail: "john.doe@example.com",
    clientPhone: "+44 7123 456789",
    trade: "Plumber",
    jobDescription: "Fix leaking kitchen tap and replace washers",
    location: "123 Baker Street, London, SW1A 1AA",
    budget: 150,
    budgetType: "fixed",
    preferredDate: "2024-01-15",
    status: "pending",
    createdAt: new Date().toISOString()
  });

  const handleTestConnection = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const result = await testCRMConnection();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to test CRM connection'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncJob = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const result = await syncJobToCRM(testJob);
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to sync job to CRM'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshQueue = () => {
    const status = getCRMSyncQueueStatus();
    setQueueStatus(status);
  };

  const handleClearQueue = () => {
    clearCRMSyncQueue();
    handleRefreshQueue();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            GoHighLevel CRM Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Test CRM Connection</h3>
            <p className="text-sm text-gray-600">
              Test your GoHighLevel API credentials and connection.
            </p>
            <Button 
              onClick={handleTestConnection} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>

          {/* Job Sync Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">2. Test Job Sync</h3>
            <p className="text-sm text-gray-600">
              Test syncing a job submission to GoHighLevel CRM.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={testJob.clientName}
                  onChange={(e) => setTestJob({...testJob, clientName: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={testJob.clientEmail}
                  onChange={(e) => setTestJob({...testJob, clientEmail: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="clientPhone">Client Phone</Label>
                <Input
                  id="clientPhone"
                  value={testJob.clientPhone}
                  onChange={(e) => setTestJob({...testJob, clientPhone: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="trade">Trade</Label>
                <Select value={testJob.trade} onValueChange={(value) => setTestJob({...testJob, trade: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plumber">Plumber</SelectItem>
                    <SelectItem value="Electrician">Electrician</SelectItem>
                    <SelectItem value="Builder">Builder</SelectItem>
                    <SelectItem value="Cleaner">Cleaner</SelectItem>
                    <SelectItem value="Roofer">Roofer</SelectItem>
                    <SelectItem value="Carpenter">Carpenter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={testJob.jobDescription}
                  onChange={(e) => setTestJob({...testJob, jobDescription: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={testJob.location}
                  onChange={(e) => setTestJob({...testJob, location: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="budget">Budget (£)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={testJob.budget}
                  onChange={(e) => setTestJob({...testJob, budget: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label htmlFor="budgetType">Budget Type</Label>
                <Select value={testJob.budgetType} onValueChange={(value) => setTestJob({...testJob, budgetType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                    <SelectItem value="estimate">Estimate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={testJob.status} onValueChange={(value) => setTestJob({...testJob, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleSyncJob} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                "Sync Job to CRM"
              )}
            </Button>
          </div>

          {/* Queue Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">3. Sync Queue Management</h3>
            <div className="flex gap-2">
              <Button onClick={handleRefreshQueue} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Queue
              </Button>
              <Button onClick={handleClearQueue} variant="outline">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Queue
              </Button>
            </div>
            
            {queueStatus && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium">
                  Queue Status: {queueStatus.count} jobs pending
                </p>
                {queueStatus.jobs.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {queueStatus.jobs.map((job: any, index: number) => (
                      <div key={index} className="text-xs text-gray-600">
                        {job.id} - {job.clientName} ({job.trade})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Results</h3>
              <Alert variant={result.success ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="font-medium">{result.message}</div>
                    {result.error && (
                      <div className="text-sm mt-1 text-red-600">{result.error}</div>
                    )}
                    {result.contactId && (
                      <div className="text-sm mt-1">
                        Contact ID: {result.contactId}
                      </div>
                    )}
                    {result.opportunityId && (
                      <div className="text-sm mt-1">
                        Opportunity ID: {result.opportunityId}
                      </div>
                    )}
                    {result.locationName && (
                      <div className="text-sm mt-1">
                        Location: {result.locationName}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


