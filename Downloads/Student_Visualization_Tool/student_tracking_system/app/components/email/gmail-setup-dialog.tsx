
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Shield,
  Settings
} from 'lucide-react';

interface GmailSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSetupComplete?: () => void;
}

export function GmailSetupDialog({ open, onOpenChange, onSetupComplete }: GmailSetupDialogProps) {
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [setupInfo, setSetupInfo] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      checkSetupStatus();
    }
  }, [open]);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/emails/setup');
      if (response.ok) {
        const data = await response.json();
        setSetupInfo(data);
      }
    } catch (error) {
      console.error('Failed to check setup status:', error);
    }
  };

  const testConnection = async () => {
    if (!setupInfo?.configured) {
      toast({
        title: 'Setup Required',
        description: 'Please configure Gmail credentials first',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/emails/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ testEmail })
      });

      const data = await response.json();

      if (data.success) {
        setTestResult(data);
        toast({
          title: 'Test Successful! 🎉',
          description: `Test email sent to ${data.testSentTo}`
        });
        
        if (onSetupComplete) {
          onSetupComplete();
        }
      } else {
        toast({
          title: 'Test Failed',
          description: data.message || 'Failed to send test email',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to test Gmail connection',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Text copied to clipboard'
    });
  };

  const envVariables = `# Gmail Configuration for HCT Student Tracker
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Mail className="w-6 h-6 text-blue-600" />
            Gmail Integration Setup
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {setupInfo?.configured ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Configured
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Gmail account: <strong>{setupInfo.gmailUser}</strong>
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                    <div>
                      <Badge variant="outline" className="border-orange-200 text-orange-800">
                        Not Configured
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Gmail credentials need to be set up
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          {!setupInfo?.configured && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Setup Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Important Security Note:</h4>
                  <p className="text-blue-800 text-sm">
                    You'll need to use an App Password, not your regular Gmail password. 
                    App Passwords are more secure and designed for applications like this.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Step-by-Step Guide:</h4>
                  
                  {setupInfo?.instructions && Object.entries(setupInfo.instructions).map(([step, instruction]: [string, any], index) => (
                    <div key={step} className="flex gap-3 p-3 border rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{instruction}</p>
                        {step === 'step1' && (
                          <Button
                            variant="link"
                            className="p-0 h-auto mt-1 text-blue-600"
                            onClick={() => window.open('https://myaccount.google.com/security', '_blank')}
                          >
                            Open Google Account Security <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Environment Variables:</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Add these to your <code>.env</code> file:
                  </p>
                  <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm relative">
                    <pre>{envVariables}</pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(envVariables)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Connection */}
          {setupInfo?.configured && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Test Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="testEmail">Test Email Address (optional)</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Leave empty to send to your account"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If left empty, the test email will be sent to your account
                  </p>
                </div>

                <Button
                  onClick={testConnection}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending Test Email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Test Email
                    </>
                  )}
                </Button>

                {testResult && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <strong>Test Successful!</strong>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Test email sent to: <strong>{testResult.testSentTo}</strong>
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      Message ID: {testResult.messageId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>What You Can Do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">📧 Individual Emails</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Send personalized messages to students</li>
                    <li>• Attendance notifications</li>
                    <li>• Grade updates and feedback</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-600">📢 Bulk Communications</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Class reminders for entire modules</li>
                    <li>• Announcements to multiple students</li>
                    <li>• Schedule changes and updates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {setupInfo?.configured ? 'Done' : 'Close'}
            </Button>
            {setupInfo?.configured && (
              <Button onClick={testConnection} disabled={loading}>
                <Mail className="w-4 h-4 mr-2" />
                Test Again
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
