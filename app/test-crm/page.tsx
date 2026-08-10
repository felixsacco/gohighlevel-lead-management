import CRMSyncTest from "@/components/CRMSyncTest";

export default function TestCRMPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GoHighLevel CRM Integration Test
          </h1>
          <p className="text-gray-600">
            Test your GoHighLevel CRM integration for job submission syncing
          </p>
        </div>
        
        <CRMSyncTest />
        
        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Setup Instructions
          </h2>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Add your GoHighLevel API credentials to <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
            <li>Set <code className="bg-blue-100 px-1 rounded">GOHIGHLEVEL_API_KEY</code> and <code className="bg-blue-100 px-1 rounded">GOHIGHLEVEL_LOCATION_ID</code></li>
            <li>Test the connection using the button above</li>
            <li>Try syncing a test job to verify the integration works</li>
          </ol>
          <p className="text-xs text-blue-700 mt-2">
            See <code className="bg-blue-100 px-1 rounded">GOHIGHLEVEL_SETUP.md</code> for detailed setup instructions.
          </p>
        </div>
      </div>
    </div>
  );
}


