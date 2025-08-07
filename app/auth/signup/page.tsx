
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Stethoscope, User, Lock, Mail, Badge } from 'lucide-react';
import Link from 'next/link';

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    studentId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          studentId: formData.studentId || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message and redirect to login
        const successMessage = data.user?.studentId 
          ? `Account created successfully! Your Student ID is: ${data.user.studentId}`
          : 'Account created successfully!';
        router.push(`/?message=${encodeURIComponent(successMessage)}`);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/design-bg-video.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="text-center p-6 sm:p-8 pb-4 sm:pb-6">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-white mb-2">
              Student Registration
            </CardTitle>
            <CardDescription className="text-white/80 text-sm sm:text-base">
              Join the Paramedic Skills Matrix platform
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/90 backdrop-blur-sm border-red-400/50">
                  <AlertDescription className="text-white">{error}</AlertDescription>
                </Alert>
              )}
            
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-white">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    className="pl-10 h-12 text-base bg-white/25 backdrop-blur-sm border-white/30 text-gray-900 placeholder:text-gray-600 focus:border-white/50 shadow-lg"
                  />
                </div>
              </div>
            
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    className="pl-10 h-12 text-base bg-white/25 backdrop-blur-sm border-white/30 text-gray-900 placeholder:text-gray-600 focus:border-white/50 shadow-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-white">Role</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                  <SelectTrigger className="h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-white/40">
                    <SelectValue placeholder="Select your role" className="text-white/60" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900/90 backdrop-blur-sm border-white/20">
                    <SelectItem value="STUDENT" className="text-white focus:bg-white/20">Student</SelectItem>
                    <SelectItem value="LECTURER" className="text-white focus:bg-white/20">Lecturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            
              {formData.role && (
                <div className="space-y-2">
                  <Label htmlFor="studentId" className="text-sm font-medium text-white">
                    {formData.role === 'STUDENT' ? 'Student ID (Optional)' : 'Instructor ID'}
                  </Label>
                  <div className="relative">
                    <Badge className="absolute left-3 top-3 h-4 w-4 text-white/60" />
                    <Input
                      id="studentId"
                      placeholder={formData.role === 'STUDENT' ? 'Auto-generated if blank' : 'INST001'}
                      value={formData.studentId}
                      onChange={(e) => handleChange('studentId', e.target.value)}
                      className="pl-10 h-12 text-base bg-white/25 backdrop-blur-sm border-white/30 text-gray-900 placeholder:text-gray-600 focus:border-white/50 shadow-lg"
                    />
                  </div>
                  {formData.role === 'STUDENT' && (
                    <p className="text-xs text-white/60 mt-1">
                      Leave blank to auto-generate (e.g., STU2025001)
                    </p>
                  )}
                </div>
              )}
            
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    className="pl-10 h-12 text-base bg-white/25 backdrop-blur-sm border-white/30 text-gray-900 placeholder:text-gray-600 focus:border-white/50 shadow-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-white">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-600" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    className="pl-10 h-12 text-base bg-white/25 backdrop-blur-sm border-white/30 text-gray-900 placeholder:text-gray-600 focus:border-white/50 shadow-lg"
                  />
                </div>
              </div>
            
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-white/35 backdrop-blur-sm border border-white/40 text-gray-900 hover:bg-white/45 hover:border-white/60 transition-all duration-300 shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-white/80">
              Already have an account?{' '}
              <Link href="/" className="text-white hover:text-white/90 font-medium underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
