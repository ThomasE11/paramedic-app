'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Upload, 
  Save, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Briefcase,
  GraduationCap,
  Clock,
  Key,
  Eye,
  EyeOff,
  Camera,
  Edit3,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  phone?: string;
  location?: string;
  bio?: string;
  title?: string;
  department?: string;
  studentId?: string;
  employeeId?: string;
  registrationDate: string;
  lastLogin?: string;
  credentials: {
    certifications: string[];
    qualifications: string[];
    experience: string;
    licenses: string[];
  };
  stats: {
    totalSkills?: number;
    completedSkills?: number;
    studentsSupervised?: number;
    coursesCompleted?: number;
    totalUsers?: number;
  };
}

interface ProfileManagementProps {
  userRole?: 'ADMIN' | 'LECTURER' | 'STUDENT';
}

export default function ProfileManagement({ userRole }: ProfileManagementProps) {
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    id: session?.user?.id || 'user-1',
    name: session?.user?.name || 'John Doe',
    email: session?.user?.email || 'john.doe@example.com',
    role: session?.user?.role || userRole || 'STUDENT',
    image: session?.user?.image || undefined,
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    bio: 'Dedicated healthcare professional with a passion for emergency medicine and continuous learning.',
    title: userRole === 'ADMIN' ? 'System Administrator' : 
           userRole === 'LECTURER' ? 'Senior Paramedic Instructor' : 
           'Paramedic Student',
    department: userRole === 'ADMIN' ? 'Information Technology' :
                userRole === 'LECTURER' ? 'Emergency Medical Services' :
                'Student Affairs',
    studentId: userRole === 'STUDENT' ? 'STU2024001' : undefined,
    employeeId: userRole !== 'STUDENT' ? 'EMP2024001' : undefined,
    registrationDate: '2024-01-15',
    lastLogin: new Date().toISOString(),
    credentials: {
      certifications: userRole === 'ADMIN' ? 
        ['Certified Information Systems Manager', 'Healthcare IT Security Certification'] :
        userRole === 'LECTURER' ? 
        ['Advanced Life Support (ALS)', 'Pediatric Advanced Life Support (PALS)', 'Basic Life Support (BLS)', 'Emergency Medical Instructor Certification'] :
        ['Basic Life Support (BLS)', 'CPR Certification', 'First Aid Certification'],
      qualifications: userRole === 'ADMIN' ? 
        ['Master of Science in Information Technology', 'Bachelor of Science in Computer Science'] :
        userRole === 'LECTURER' ? 
        ['Master of Science in Emergency Medical Services', 'Bachelor of Science in Paramedicine', 'Teaching Qualification in Health Sciences'] :
        ['Enrolled in Paramedicine Degree Program', 'High School Diploma'],
      experience: userRole === 'ADMIN' ? 
        '8 years in healthcare IT systems management and implementation' :
        userRole === 'LECTURER' ? 
        '12 years as practicing paramedic, 5 years in emergency medical education' :
        'Currently in 2nd year of paramedicine program',
      licenses: userRole === 'ADMIN' ? 
        ['Healthcare Information Security License'] :
        userRole === 'LECTURER' ? 
        ['Paramedic License #PM12345', 'Emergency Medical Instructor License #EMI6789'] :
        ['Student Paramedic Registration #SPR2024001']
    },
    stats: userRole === 'ADMIN' ? 
      { totalUsers: 157, totalSkills: 89 } :
      userRole === 'LECTURER' ? 
      { studentsSupervised: 45, coursesCompleted: 23, totalSkills: 89 } :
      { totalSkills: 89, completedSkills: 34, coursesCompleted: 12 }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCredentials, setShowCredentials] = useState(true);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', profile.id);

      // Simulate API call for image upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create temporary URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      setProfile(prev => ({
        ...prev,
        image: imageUrl
      }));

      // Update session with new image
      await update({ image: imageUrl });

      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update session data
      await update({
        name: profile.name,
        email: profile.email
      });

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'LECTURER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'STUDENT':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and credentials
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                disabled={saving}
                className="flex items-center"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="flex items-center">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.image} alt={profile.name} />
                  <AvatarFallback className="text-lg font-semibold">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <CardTitle className="text-xl">{profile.name}</CardTitle>
              <CardDescription className="text-sm">{profile.title}</CardDescription>
              <div className="flex justify-center mt-2">
                <Badge className={getRoleColor(profile.role)}>
                  {profile.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.department}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(profile.registrationDate).toLocaleDateString()}</span>
                </div>
                {profile.lastLogin && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Last login {new Date(profile.lastLogin).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Quick Stats */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {profile.role === 'ADMIN' && (
                    <>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-semibold text-lg">{profile.stats.totalUsers}</div>
                        <div className="text-muted-foreground text-xs">Total Users</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-semibold text-lg">{profile.stats.totalSkills}</div>
                        <div className="text-muted-foreground text-xs">Skills Available</div>
                      </div>
                    </>
                  )}
                  {profile.role === 'LECTURER' && (
                    <>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-semibold text-lg">{profile.stats.studentsSupervised}</div>
                        <div className="text-muted-foreground text-xs">Students</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-semibold text-lg">{profile.stats.coursesCompleted}</div>
                        <div className="text-muted-foreground text-xs">Courses</div>
                      </div>
                    </>
                  )}
                  {profile.role === 'STUDENT' && (
                    <>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-semibold text-lg">{profile.stats.completedSkills}</div>
                        <div className="text-muted-foreground text-xs">Completed</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="font-semibold text-lg">{profile.stats.totalSkills}</div>
                        <div className="text-muted-foreground text-xs">Total Skills</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => updateProfile('name', e.target.value)}
                    />
                  ) : (
                    <div className="p-2 bg-muted/50 rounded">{profile.name}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => updateProfile('email', e.target.value)}
                    />
                  ) : (
                    <div className="p-2 bg-muted/50 rounded">{profile.email}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={profile.phone || ''}
                      onChange={(e) => updateProfile('phone', e.target.value)}
                    />
                  ) : (
                    <div className="p-2 bg-muted/50 rounded">{profile.phone || 'Not provided'}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={profile.location || ''}
                      onChange={(e) => updateProfile('location', e.target.value)}
                    />
                  ) : (
                    <div className="p-2 bg-muted/50 rounded">{profile.location || 'Not provided'}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  {isEditing ? (
                    <Input
                      id="title"
                      value={profile.title || ''}
                      onChange={(e) => updateProfile('title', e.target.value)}
                    />
                  ) : (
                    <div className="p-2 bg-muted/50 rounded">{profile.title || 'Not provided'}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Input
                      id="department"
                      value={profile.department || ''}
                      onChange={(e) => updateProfile('department', e.target.value)}
                    />
                  ) : (
                    <div className="p-2 bg-muted/50 rounded">{profile.department || 'Not provided'}</div>
                  )}
                </div>

                {profile.studentId && (
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID</Label>
                    <div className="p-2 bg-muted/50 rounded font-mono">{profile.studentId}</div>
                  </div>
                )}

                {profile.employeeId && (
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <div className="p-2 bg-muted/50 rounded font-mono">{profile.employeeId}</div>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => updateProfile('bio', e.target.value)}
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="p-2 bg-muted/50 rounded min-h-[60px]">
                    {profile.bio || 'No bio provided'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Credentials */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Professional Credentials
                  </CardTitle>
                  <CardDescription>
                    Your certifications, qualifications, and professional licenses
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {showCredentials && (
              <CardContent>
                <div className="space-y-6">
                  {/* Certifications */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Certifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {profile.credentials.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="justify-start p-2">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Qualifications */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2 text-blue-600" />
                      Educational Qualifications
                    </h4>
                    <div className="space-y-2">
                      {profile.credentials.qualifications.map((qual, index) => (
                        <div key={index} className="p-2 bg-muted/50 rounded text-sm">
                          {qual}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Licenses */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center">
                      <Key className="h-4 w-4 mr-2 text-purple-600" />
                      Professional Licenses
                    </h4>
                    <div className="space-y-2">
                      {profile.credentials.licenses.map((license, index) => (
                        <div key={index} className="p-2 bg-muted/50 rounded text-sm font-mono">
                          {license}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Experience */}
                  <div>
                    <h4 className="font-medium text-sm mb-3 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-orange-600" />
                      Professional Experience
                    </h4>
                    <div className="p-3 bg-muted/50 rounded text-sm">
                      {profile.credentials.experience}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}