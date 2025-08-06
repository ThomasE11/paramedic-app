
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, Bell, Users, BookOpen, Shield, Mail, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ProfileManagement from '@/components/profile/profile-management';

export default function LecturerSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    minimumPracticeRequirement: 3,
    quizPassThreshold: 80,
    reflectionRequired: true,
    autoNotifications: true,
    
    // Notification Settings
    emailNotifications: true,
    progressAlerts: true,
    reflectionAlerts: true,
    systemMessages: true,
    
    // Assessment Settings
    allowRetakes: true,
    maxAttempts: 5,
    timeLimit: 60,
    randomizeQuestions: true,
    
    // Class Settings
    className: '',
    semester: '',
    academicYear: '',
    classDescription: '',
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      minimumPracticeRequirement: 3,
      quizPassThreshold: 80,
      reflectionRequired: true,
      autoNotifications: true,
      emailNotifications: true,
      progressAlerts: true,
      reflectionAlerts: true,
      systemMessages: true,
      allowRetakes: true,
      maxAttempts: 5,
      timeLimit: 60,
      randomizeQuestions: true,
      className: '',
      semester: '',
      academicYear: '',
      classDescription: '',
    });
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">
              Configure your profile, teaching preferences and system settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="class">Class Info</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileManagement userRole="LECTURER" />
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure basic requirements and thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minimumPractice">Minimum Practice Requirement</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="minimumPractice"
                  min={1}
                  max={10}
                  step={1}
                  value={[settings.minimumPracticeRequirement]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, minimumPracticeRequirement: value[0] }))}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-medium">{settings.minimumPracticeRequirement}</span>
              </div>
              <p className="text-xs text-gray-600">
                Number of times students must practice each skill
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quizThreshold">Quiz Pass Threshold (%)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="quizThreshold"
                  min={50}
                  max={100}
                  step={5}
                  value={[settings.quizPassThreshold]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, quizPassThreshold: value[0] }))}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-medium">{settings.quizPassThreshold}%</span>
              </div>
              <p className="text-xs text-gray-600">
                Minimum score required to pass skill quizzes
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reflection Notes Required</Label>
                <p className="text-xs text-gray-600">
                  Require students to submit reflection notes after completing skills
                </p>
              </div>
              <Switch
                checked={settings.reflectionRequired}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reflectionRequired: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Notifications</Label>
                <p className="text-xs text-gray-600">
                  Automatically send notifications for student progress updates
                </p>
              </div>
              <Switch
                checked={settings.autoNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoNotifications: checked }))}
              />
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Control when and how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-xs text-gray-600">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Progress Alerts</Label>
                <p className="text-xs text-gray-600">
                  Get notified when students complete skills
                </p>
              </div>
              <Switch
                checked={settings.progressAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, progressAlerts: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reflection Alerts</Label>
                <p className="text-xs text-gray-600">
                  Get notified when students submit reflection notes
                </p>
              </div>
              <Switch
                checked={settings.reflectionAlerts}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reflectionAlerts: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Messages</Label>
                <p className="text-xs text-gray-600">
                  Receive system updates and announcements
                </p>
              </div>
              <Switch
                checked={settings.systemMessages}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, systemMessages: checked }))}
              />
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assessment Settings */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Assessment Settings
            </CardTitle>
            <CardDescription>
              Configure quiz and assessment parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Retakes</Label>
                <p className="text-xs text-gray-600">
                  Allow students to retake failed assessments
                </p>
              </div>
              <Switch
                checked={settings.allowRetakes}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRetakes: checked }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Maximum Attempts</Label>
              <Select 
                value={settings.maxAttempts.toString()} 
                onValueChange={(value) => setSettings(prev => ({ ...prev, maxAttempts: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 attempt</SelectItem>
                  <SelectItem value="3">3 attempts</SelectItem>
                  <SelectItem value="5">5 attempts</SelectItem>
                  <SelectItem value="10">10 attempts</SelectItem>
                  <SelectItem value="999">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="timeLimit"
                  min={15}
                  max={120}
                  step={15}
                  value={[settings.timeLimit]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, timeLimit: value[0] }))}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-medium">{settings.timeLimit}m</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Randomize Questions</Label>
                <p className="text-xs text-gray-600">
                  Present quiz questions in random order
                </p>
              </div>
              <Switch
                checked={settings.randomizeQuestions}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, randomizeQuestions: checked }))}
              />
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="class" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Information */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Class Information
            </CardTitle>
            <CardDescription>
              Set up your class details and description
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                placeholder="e.g., Paramedic Training 2024"
                value={settings.className}
                onChange={(e) => setSettings(prev => ({ ...prev, className: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select 
                  value={settings.semester} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, semester: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fall">Fall</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="winter">Winter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  placeholder="e.g., 2024-2025"
                  value={settings.academicYear}
                  onChange={(e) => setSettings(prev => ({ ...prev, academicYear: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="classDescription">Class Description</Label>
              <Textarea
                id="classDescription"
                placeholder="Describe your class objectives and expectations..."
                value={settings.classDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, classDescription: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

            {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Advanced Actions
          </CardTitle>
          <CardDescription>
            Manage advanced settings and data operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center">
              <Mail className="h-4 w-4 mr-2" />
              Export Student Data
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Import Skills
            </Button>
            <Button variant="outline" className="flex items-center justify-center">
              <Settings className="h-4 w-4 mr-2" />
              Reset All Progress
            </Button>
          </div>
        </CardContent>
      </Card>
          </div>
        </TabsContent>
      </Tabs>

      {saved && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Settings saved successfully!
          </div>
        </div>
      )}
    </div>
  );
}
