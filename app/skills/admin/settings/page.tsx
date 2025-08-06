'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Users, 
  BookOpen,
  Bell,
  Eye,
  AlertCircle,
  CheckCircle,
  Lock,
  Key,
  Server,
  User
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileManagement from '@/components/profile/profile-management';

interface SystemSettings {
  general: {
    siteName: string;
    siteDescription: string;
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    guestAccess: boolean;
  };
  authentication: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
    requireTwoFactor: boolean;
    allowPasswordReset: boolean;
  };
  database: {
    host: string;
    port: string;
    name: string;
    maxConnections: number;
    backupFrequency: string;
    status: 'offline' | 'online' | 'maintenance';
  };
  email: {
    provider: string;
    host: string;
    port: string;
    username: string;
    enabled: boolean;
    notifications: boolean;
  };
  features: {
    videoAnalysis: boolean;
    reflections: boolean;
    notifications: boolean;
    analytics: boolean;
    bulkOperations: boolean;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: 'Paramedic Skills Matrix',
      siteDescription: 'Comprehensive skills training and assessment system for paramedic students',
      maintenanceMode: false,
      registrationEnabled: true,
      guestAccess: false
    },
    authentication: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowPasswordReset: true
    },
    database: {
      host: 'localhost',
      port: '5432',
      name: 'paramedic_matrix',
      maxConnections: 100,
      backupFrequency: 'daily',
      status: 'offline'
    },
    email: {
      provider: 'SMTP',
      host: 'smtp.gmail.com',
      port: '587',
      username: '',
      enabled: false,
      notifications: true
    },
    features: {
      videoAnalysis: true,
      reflections: true,
      notifications: true,
      analytics: true,
      bulkOperations: false
    }
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const saveSettings = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
    // Show success message
    alert('Settings saved successfully!');
  };

  const testDatabaseConnection = async () => {
    // Simulate database connection test
    alert('Database connection test failed - Development mode active');
  };

  const updateGeneralSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        [key]: value
      }
    }));
  };

  const updateAuthSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        [key]: value
      }
    }));
  };

  const updateDatabaseSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      database: {
        ...prev.database,
        [key]: value
      }
    }));
  };

  const updateEmailSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value
      }
    }));
  };

  const updateFeatureSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="flex items-center">
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Development Mode Alert */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Development Mode:</strong> Some settings may not take effect until the system is deployed in production mode.
        </AlertDescription>
      </Alert>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileManagement userRole="ADMIN" />
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateGeneralSetting('siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => updateGeneralSetting('siteDescription', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable maintenance mode to prevent user access</p>
                  </div>
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked) => updateGeneralSetting('maintenanceMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Registration Enabled</Label>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.general.registrationEnabled}
                    onCheckedChange={(checked) => updateGeneralSetting('registrationEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Guest Access</Label>
                    <p className="text-sm text-muted-foreground">Allow guest users to view limited content</p>
                  </div>
                  <Switch
                    checked={settings.general.guestAccess}
                    onCheckedChange={(checked) => updateGeneralSetting('guestAccess', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Authentication Settings
              </CardTitle>
              <CardDescription>
                Configure authentication and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.authentication.sessionTimeout}
                    onChange={(e) => updateAuthSetting('sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.authentication.maxLoginAttempts}
                    onChange={(e) => updateAuthSetting('maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Password Min Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.authentication.passwordMinLength}
                    onChange={(e) => updateAuthSetting('passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch
                    checked={settings.authentication.requireTwoFactor}
                    onCheckedChange={(checked) => updateAuthSetting('requireTwoFactor', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Password Reset</Label>
                    <p className="text-sm text-muted-foreground">Allow users to reset their passwords</p>
                  </div>
                  <Switch
                    checked={settings.authentication.allowPasswordReset}
                    onCheckedChange={(checked) => updateAuthSetting('allowPasswordReset', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Database Settings
              </CardTitle>
              <CardDescription>
                Configure database connection and backup settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Database Status</span>
                </div>
                <Badge variant="destructive">Offline</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dbHost">Database Host</Label>
                  <Input
                    id="dbHost"
                    value={settings.database.host}
                    onChange={(e) => updateDatabaseSetting('host', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbPort">Database Port</Label>
                  <Input
                    id="dbPort"
                    value={settings.database.port}
                    onChange={(e) => updateDatabaseSetting('port', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dbName">Database Name</Label>
                  <Input
                    id="dbName"
                    value={settings.database.name}
                    onChange={(e) => updateDatabaseSetting('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxConnections">Max Connections</Label>
                  <Input
                    id="maxConnections"
                    type="number"
                    value={settings.database.maxConnections}
                    onChange={(e) => updateDatabaseSetting('maxConnections', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={testDatabaseConnection} variant="outline">
                  <Database className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Email Settings
              </CardTitle>
              <CardDescription>
                Configure email provider and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emailHost">SMTP Host</Label>
                  <Input
                    id="emailHost"
                    value={settings.email.host}
                    onChange={(e) => updateEmailSetting('host', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailPort">SMTP Port</Label>
                  <Input
                    id="emailPort"
                    value={settings.email.port}
                    onChange={(e) => updateEmailSetting('port', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailUsername">Username</Label>
                  <Input
                    id="emailUsername"
                    value={settings.email.username}
                    onChange={(e) => updateEmailSetting('username', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Enabled</Label>
                    <p className="text-sm text-muted-foreground">Enable email functionality</p>
                  </div>
                  <Switch
                    checked={settings.email.enabled}
                    onCheckedChange={(checked) => updateEmailSetting('enabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send system notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.email.notifications}
                    onCheckedChange={(checked) => updateEmailSetting('notifications', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Feature Settings
              </CardTitle>
              <CardDescription>
                Enable or disable system features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Video Analysis</Label>
                    <p className="text-sm text-muted-foreground">Enable AI-powered video analysis</p>
                  </div>
                  <Switch
                    checked={settings.features.videoAnalysis}
                    onCheckedChange={(checked) => updateFeatureSetting('videoAnalysis', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reflections</Label>
                    <p className="text-sm text-muted-foreground">Enable student reflection notes</p>
                  </div>
                  <Switch
                    checked={settings.features.reflections}
                    onCheckedChange={(checked) => updateFeatureSetting('reflections', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications</Label>
                    <p className="text-sm text-muted-foreground">Enable system notifications</p>
                  </div>
                  <Switch
                    checked={settings.features.notifications}
                    onCheckedChange={(checked) => updateFeatureSetting('notifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">Enable analytics and reporting</p>
                  </div>
                  <Switch
                    checked={settings.features.analytics}
                    onCheckedChange={(checked) => updateFeatureSetting('analytics', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bulk Operations</Label>
                    <p className="text-sm text-muted-foreground">Enable bulk user operations</p>
                  </div>
                  <Switch
                    checked={settings.features.bulkOperations}
                    onCheckedChange={(checked) => updateFeatureSetting('bulkOperations', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}