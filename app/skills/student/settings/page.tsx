'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Save, Bell, BookOpen, Shield, Mail, User, Palette, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import ProfileManagement from '@/components/profile/profile-management';

export default function StudentSettings() {
  const [settings, setSettings] = useState({
    // Learning Preferences
    practiceMode: 'guided',
    difficultyProgression: 'adaptive',
    feedbackLevel: 'detailed',
    studyReminders: true,
    
    // Notification Settings
    emailNotifications: true,
    progressAlerts: true,
    assignmentReminders: true,
    achievementNotifications: true,
    
    // Accessibility Settings
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    
    // Privacy Settings
    profileVisibility: 'instructors',
    progressSharing: true,
    achievementSharing: true,
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
      toast.success('Settings saved successfully!');
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      practiceMode: 'guided',
      difficultyProgression: 'adaptive',
      feedbackLevel: 'detailed',
      studyReminders: true,
      emailNotifications: true,
      progressAlerts: true,
      assignmentReminders: true,
      achievementNotifications: true,
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      profileVisibility: 'instructors',
      progressSharing: true,
      achievementSharing: true,
    });
    setSaved(false);
    toast.success('Settings reset to defaults');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
              Customize your learning experience and preferences
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleReset} disabled={loading}>
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
        <TabsList className="grid w-full grid-cols-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileManagement userRole="STUDENT" />
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Preferences */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Learning Preferences
                </CardTitle>
                <CardDescription>
                  Customize how you learn and practice skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="practiceMode">Practice Mode</Label>
                  <Select 
                    value={settings.practiceMode} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, practiceMode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guided">Guided Practice</SelectItem>
                      <SelectItem value="independent">Independent Practice</SelectItem>
                      <SelectItem value="timed">Timed Practice</SelectItem>
                      <SelectItem value="mixed">Mixed Mode</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose how you prefer to practice skills
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficultyProgression">Difficulty Progression</Label>
                  <Select 
                    value={settings.difficultyProgression} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, difficultyProgression: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                      <SelectItem value="linear">Linear Progression</SelectItem>
                      <SelectItem value="custom">Custom Order</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How difficulty should increase as you progress
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedbackLevel">Feedback Level</Label>
                  <Select 
                    value={settings.feedbackLevel} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, feedbackLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Amount of feedback you receive during practice
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Study Reminders</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive reminders to practice skills regularly
                    </p>
                  </div>
                  <Switch
                    checked={settings.studyReminders}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, studyReminders: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Study Goals */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Study Goals
                </CardTitle>
                <CardDescription>
                  Set your learning objectives and targets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyGoal">Daily Practice Goal (minutes)</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weeklyGoal">Weekly Skills Goal</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 skills per week</SelectItem>
                      <SelectItem value="5">5 skills per week</SelectItem>
                      <SelectItem value="7">7 skills per week</SelectItem>
                      <SelectItem value="10">10 skills per week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Daily Reminder Time</Label>
                  <Input type="time" defaultValue="19:00" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notification Settings */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
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
                    <p className="text-xs text-muted-foreground">
                      Get notified when you complete skills or reach milestones
                    </p>
                  </div>
                  <Switch
                    checked={settings.progressAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, progressAlerts: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Assignment Reminders</Label>
                    <p className="text-xs text-muted-foreground">
                      Reminders for upcoming assignments and deadlines
                    </p>
                  </div>
                  <Switch
                    checked={settings.assignmentReminders}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, assignmentReminders: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Achievement Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Celebrate your achievements and badges
                    </p>
                  </div>
                  <Switch
                    checked={settings.achievementNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, achievementNotifications: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Schedule */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Notification Schedule
                </CardTitle>
                <CardDescription>
                  Control when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Quiet Hours</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="quietStart" className="text-xs">Start</Label>
                      <Input id="quietStart" type="time" defaultValue="22:00" />
                    </div>
                    <div>
                      <Label htmlFor="quietEnd" className="text-xs">End</Label>
                      <Input id="quietEnd" type="time" defaultValue="08:00" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No notifications during these hours
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Notification Frequency</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Summary</SelectItem>
                      <SelectItem value="weekly">Weekly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accessibility" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visual Accessibility */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Visual Accessibility
                </CardTitle>
                <CardDescription>
                  Adjust visual settings for better accessibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select 
                    value={settings.fontSize} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, fontSize: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="extra-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Contrast Mode</Label>
                    <p className="text-xs text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, highContrast: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reduced Motion</Label>
                    <p className="text-xs text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, reducedMotion: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audio Accessibility */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Volume2 className="h-5 w-5 mr-2" />
                  Audio Accessibility
                </CardTitle>
                <CardDescription>
                  Configure audio and screen reader settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Screen Reader Support</Label>
                    <p className="text-xs text-muted-foreground">
                      Optimize interface for screen readers
                    </p>
                  </div>
                  <Switch
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, screenReader: checked }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Audio Feedback</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="enhanced">Enhanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Speech Rate</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Privacy Settings */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control who can see your information and progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Select 
                    value={settings.profileVisibility} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, profileVisibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="students">Students & Instructors</SelectItem>
                      <SelectItem value="instructors">Instructors Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Who can view your profile information
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Progress Sharing</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow instructors to view your skill progress
                    </p>
                  </div>
                  <Switch
                    checked={settings.progressSharing}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, progressSharing: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Achievement Sharing</Label>
                    <p className="text-xs text-muted-foreground">
                      Share achievements and badges with classmates
                    </p>
                  </div>
                  <Switch
                    checked={settings.achievementSharing}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, achievementSharing: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Manage your personal data and account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full">
                  Export Progress Report
                </Button>
                <Button variant="outline" className="w-full">
                  Reset Learning Progress
                </Button>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
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