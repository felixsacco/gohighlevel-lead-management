"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, Download } from "lucide-react";

interface LocalDispute {
  id: number;
  userId: string;
  userType: string;
  userName: string;
  disputeDetails: string;
  created_at: string;
  status: string;
  priority: string;
  submitted_to_api: boolean;
}

export default function LocalDisputesPage() {
  const [disputes, setDisputes] = useState<LocalDispute[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLocalDisputes = () => {
    setLoading(true);
    try {
      const localDisputes = JSON.parse(localStorage.getItem('myapproved_disputes') || '[]');
      setDisputes(localDisputes.reverse()); // Show newest first
    } catch (error) {
      console.error('Error loading local disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearDisputes = () => {
    if (confirm('Are you sure you want to clear all local disputes?')) {
      localStorage.removeItem('myapproved_disputes');
      setDisputes([]);
    }
  };

  const exportDisputes = () => {
    const dataStr = JSON.stringify(disputes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `disputes_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  useEffect(() => {
    loadLocalDisputes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Local Disputes Backup
            </CardTitle>
            <p className="text-sm text-gray-600">
              Disputes stored locally when API submission fails
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-2 mb-6">
              <Button onClick={loadLocalDisputes} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button onClick={exportDisputes} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export JSON
              </Button>
              <Button onClick={clearDisputes} variant="destructive" size="sm">
                Clear All
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                <p>Loading disputes...</p>
              </div>
            ) : disputes.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Local Disputes</h3>
                <p className="text-gray-600">No disputes stored locally</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive">#{dispute.id}</Badge>
                          <Badge variant={dispute.submitted_to_api ? "default" : "secondary"}>
                            {dispute.submitted_to_api ? "✅ API Submitted" : "📝 Local Only"}
                          </Badge>
                          <Badge variant="outline">{dispute.userType}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>User:</strong> {dispute.userName} | 
                          <strong> ID:</strong> {dispute.userId}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {new Date(dispute.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <h4 className="font-semibold text-sm text-yellow-800 mb-1">Dispute Details:</h4>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{dispute.disputeDetails}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

