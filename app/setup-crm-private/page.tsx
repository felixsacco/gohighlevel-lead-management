"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGoHighLevelPrivateService } from "@/lib/gohighlevel-service";
import { Loader2, CheckCircle, XCircle, Copy, ExternalLink } from "lucide-react";

export default function SetupCRMPrivatePage() {
  const [apiKey, setApiKey] = useState("pit-78d8b711-5a97-40ee-889a-688bd30f17ce");
  const [locationId, setLocationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestConnection = async () => {
    if (!apiKey || !locationId) {
      setTestResult({
        success: false,
        error: 'Please provide both API Key and Location ID',
        message: 'Missing required information'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const goHighLevelService = createGoHighLevelPrivateService(apiKey, locationId);
      const result = await goHighLevelService.testConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to test connection'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setTestResult({
      success: true,
      message: 'API Key copied to clipboard'
    });
  };

  const handleCopyEnvVars = () => {
    const envVars = `GOHIGHLEVEL_API_KEY=${apiKey}
GOHIGHLEVEL_LOCATION_ID=${locationId}`;
    navigator.clipboard.writeText(envVars);
    setTestResult({
      success: true,
      message: 'Environment variables copied to clipboard'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            GoHighLevel Private Integration Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Get Private Integration Token */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Get Your Private Integration Token</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Log in to your GoHighLevel account</li>
                <li>Go to <strong>Settings</strong> (bottom left corner)</li>
                <li>Click on <strong>API Key</strong> in the left panel</li>
                <li>Click <strong>"Generate New Key"</strong> for Private Integration</li>
                <li>Copy your <strong>Private Integration Token</strong> (starts with "pit-")</li>
                <li>Note your <strong>Location ID</strong> (found in the URL or settings)</li>
              </ol>
            </div>
          </div>

          {/* Step 2: Enter Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Enter Your Credentials</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Private Integration Token</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="flex-1"
                  />
                  <Button onClick={handleCopyApiKey} variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Your token should start with "pit-" and be about 36 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationId">Location ID</Label>
                <Input
                  id="locationId"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  placeholder="Enter your GoHighLevel Location ID"
                />
                <p className="text-xs text-gray-500">
                  Find this in your GoHighLevel URL or settings
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Test Connection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 3: Test Connection</h3>
            <p className="text-sm text-gray-600">
              Test your connection to ensure everything is working correctly.
            </p>
            
            <Button 
              onClick={handleTestConnection} 
              disabled={isLoading || !apiKey || !locationId}
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

          {/* Step 4: Environment Variables */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 4: Configure Environment Variables</h3>
            <p className="text-sm text-gray-600">
              Add these to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
            </p>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1 text-sm font-mono text-gray-900">
                <div>GOHIGHLEVEL_API_KEY={apiKey || 'your_private_integration_token_here'}</div>
                <div>GOHIGHLEVEL_LOCATION_ID={locationId || 'your_location_id_here'}</div>
              </div>
              <Button 
                onClick={handleCopyEnvVars} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Environment Variables
              </Button>
            </div>
          </div>

          {/* Test Results */}
          {testResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <Alert variant={testResult.success ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className="font-medium">{testResult.message}</div>
                    {testResult.error && (
                      <div className="text-sm mt-1 text-red-600">{testResult.error}</div>
                    )}
                    {testResult.locationName && (
                      <div className="text-sm mt-1">
                        Connected to: {testResult.locationName}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          )}

          {/* Next Steps */}
          {testResult?.success && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Next Steps</h3>
              <div className="p-4 bg-green-50 rounded-lg">
                <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                  <li>Copy the environment variables above</li>
                  <li>Add them to your <code className="bg-green-100 px-1 rounded">.env.local</code> file</li>
                  <li>Restart your development server</li>
                  <li>Test job submission sync at <code className="bg-green-100 px-1 rounded">/test-crm</code></li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


