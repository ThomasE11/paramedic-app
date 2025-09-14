
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  FileText,
  Lock,
  Save,
  X,
  RefreshCw
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  department: string | null;
  title: string | null;
  bio: string | null;
  preferences: any;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data.profile);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    // Validate password change if requested
    if (showPasswordChange) {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: 'Error',
          description: 'New passwords do not match',
          variant: 'destructive'
        });
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        toast({
          title: 'Error',
          description: 'New password must be at least 6 characters',
          variant: 'destructive'
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        title: profile.title,
        bio: profile.bio,
        preferences: profile.preferences
      };

      if (showPasswordChange && passwordData.currentPassword && passwordData.newPassword) {
        updateData.currentPassword = passwordData.currentPassword;
        updateData.newPassword = passwordData.newPassword;
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully'
        });
        
        // Update session if name or email changed
        await update({
          ...session,
          user: {
            ...session?.user,
            name: profile.name,
            email: profile.email
          }
        });

        // Reset password fields
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordChange(false);
        
        onClose();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update profile',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] glass-morphism border-white/20 shadow-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Account Settings
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Manage your profile and preferences
              </p>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        ) : (
          <div className="flex gap-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* Tabs */}
            <div className="flex-shrink-0 w-48">
              <div className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-6">
              {activeTab === 'profile' && profile && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={profile.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                        <Phone className="w-4 h-4 inline mr-2" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        value={profile.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="+971 50 123 4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                        <Briefcase className="w-4 h-4 inline mr-2" />
                        Job Title
                      </Label>
                      <Input
                        id="title"
                        value={profile.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Instructor, Professor, etc."
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="department" className="text-sm font-semibold text-gray-700">
                        <Building className="w-4 h-4 inline mr-2" />
                        Department
                      </Label>
                      <Input
                        id="department"
                        value={profile.department || ''}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                        placeholder="Emergency Medical Services"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={profile.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordChange(!showPasswordChange)}
                        className="rounded-xl"
                      >
                        {showPasswordChange ? 'Cancel' : 'Change Password'}
                      </Button>
                    </div>

                    {showPasswordChange && (
                      <div className="space-y-4 p-4 border border-gray-200 rounded-xl">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold text-gray-700">Current Password</Label>
                          <Input
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                            placeholder="Enter current password"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">New Password</Label>
                            <Input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                              className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                              placeholder="Enter new password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                            <Input
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                              className="rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                              placeholder="Confirm new password"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && profile && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50/50 rounded-xl">
                      <p className="text-sm text-gray-600">
                        Preference settings will be available in future updates. This will include 
                        notification preferences, theme settings, and default view options.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6 py-3 rounded-xl border-gray-300 hover:bg-gray-50/80 font-semibold"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile}
            disabled={isSaving || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
