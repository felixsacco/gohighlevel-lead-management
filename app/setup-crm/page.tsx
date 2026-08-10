"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createGoHighLevelOAuth } from "@/lib/gohighlevel-oauth";
import { createGoHighLevelService } from "@/lib/gohighlevel-service";
import { Loader2, CheckCircle, XCircle, ExternalLink, Copy, RefreshCw } from "lucide-react";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export default function SetupCRMPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [authUrl, setAuthUrl] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testResult, setTestResult] = useState<any>(null);

  // OAuth configuration (these should come from environment variables)
  const clientId = process.env.NEXT_PUBLIC_GOHIGHLEVEL_CLIENT_ID || "";
  const clientSecret = process.env.NEXT_PUBLIC_GOHIGHLEVEL_CLIENT_SECRET || "";
  const [redirectUri, setRedirectUri] = useState<string>('');
  
  useEffect(() => {
    setRedirectUri(process.env.NEXT_PUBLIC_GOHIGHLEVEL_REDIRECT_URI || `${window.location.origin}/api/crm/oauth/callback`);
  }, []);

  useEffect(() => {
    // Generate authorization URL when component mounts
    if (clientId && redirectUri) {
      const oauthService = createGoHighLevelOAuth(clientId, clientSecret, redirectUri);
      const url = oauthService.generateAuthUrl();
      setAuthUrl(url);
    }
  }, [clientId, clientSecret, redirectUri]);

  const handleAuthorize = () => {
    if (authUrl) {
      window.open(authUrl, '_blank');
    }
  };

  const handleTestConnection = async () => {
    if (!accessToken || !selectedLocation) {
      setTestResult({
        success: false,
        error: 'Please provide access token and select a location',
        message: 'Missing required information'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const goHighLevelService = createGoHighLevelService(accessToken, selectedLocation);
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

  const handleCopyToken = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken);
      setResult({
        success: true,
        message: 'Access token copied to clipboard'
      });
    }
  };

  const handleRefreshToken = async () => {
    // This would typically involve calling a refresh token endpoint
    // For now, we'll just show a message
    setResult({
      success: false,
      error: 'Token refresh not implemented in this demo',
      message: 'Please re-authorize to get a new token'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            GoHighLevel CRM OAuth Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: OAuth App Setup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 1: Create OAuth App</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://marketplace.gohighlevel.com" target="_blank" rel="noopener noreferrer" className="underline">GoHighLevel Marketplace</a></li>
                <li>Sign up for a developer account</li>
                <li>Go to "My Apps" and click "Create App"</li>
                <li>Fill in the required details:
                  <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                    <li><strong>App Name:</strong> MyApproved CRM Integration</li>
                    <li><strong>Redirect URI:</strong> <code className="bg-blue-100 px-1 rounded">{redirectUri}</code></li>
                    <li><strong>Scopes:</strong> contacts.write, opportunities.write, locations.read</li>
                  </ul>
                </li>
                <li>Copy your <strong>Client ID</strong> and <strong>Client Secret</strong></li>
              </ol>
            </div>
          </div>

          {/* Step 2: Environment Variables */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 2: Configure Environment Variables</h3>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">Add these to your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file:</p>
              <div className="space-y-1 text-xs font-mono text-yellow-900">
                <div>GOHIGHLEVEL_CLIENT_ID=your_client_id_here</div>
                <div>GOHIGHLEVEL_CLIENT_SECRET=your_client_secret_here</div>
                <div>GOHIGHLEVEL_REDIRECT_URI={redirectUri}</div>
                <div>GOHIGHLEVEL_ACCESS_TOKEN=your_access_token_here</div>
                <div>GOHIGHLEVEL_LOCATION_ID=your_location_id_here</div>
              </div>
            </div>
          </div>

          {/* Step 3: Authorization */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 3: Authorize Application</h3>
            <p className="text-sm text-gray-600">
              Click the button below to authorize the application and get your access token.
            </p>
            
            {authUrl ? (
              <Button onClick={handleAuthorize} className="w-full sm:w-auto">
                <ExternalLink className="w-4 h-4 mr-2" />
                Authorize with GoHighLevel
              </Button>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  OAuth not configured. Please set GOHIGHLEVEL_CLIENT_ID and GOHIGHLEVEL_REDIRECT_URI environment variables.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Step 4: Access Token */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 4: Enter Access Token</h3>
            <p className="text-sm text-gray-600">
              After authorization, you'll receive an access token. Enter it below:
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <div className="flex gap-2">
                <Input
                  id="accessToken"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="Enter your access token"
                  className="flex-1"
                />
                <Button onClick={handleCopyToken} variant="outline" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button onClick={handleRefreshToken} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Step 5: Location Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 5: Select Location</h3>
            <p className="text-sm text-gray-600">
              Choose which GoHighLevel location to sync jobs to:
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name} - {location.city}, {location.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Step 6: Test Connection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Step 6: Test Connection</h3>
            <p className="text-sm text-gray-600">
              Test your connection to ensure everything is working correctly.
            </p>
            
            <Button 
              onClick={handleTestConnection} 
              disabled={isLoading || !accessToken || !selectedLocation}
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
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          )}

          {testResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Connection Test Results</h3>
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
        </CardContent>
      </Card>
    </div>
  );
}


