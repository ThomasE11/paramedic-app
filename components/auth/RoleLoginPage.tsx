
"use client";

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  GraduationCap, 
  BookOpen, 
  ArrowRight, 
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle,
  Users,
  Award,
  Activity 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

type UserRole = 'admin' | 'lecturer' | 'student';

interface RoleOption {
  id: UserRole;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  hoverGradient: string;
  credentials: { email: string; password: string };
  dashboardPath: string;
}

// Main Component for the Role-Based Login Page
const RoleLoginPage = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // Check for success message from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
      setSuccessMessage(decodeURIComponent(message));
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const roles: RoleOption[] = [
    {
      id: 'admin',
      name: 'Admin',
      description: 'Complete system oversight, user management, and advanced analytics dashboard.',
      icon: Shield,
      gradient: 'from-slate-600 to-slate-800',
      hoverGradient: 'from-slate-700 to-slate-900',
      credentials: { email: 'admin@ems-training.com', password: 'admin123' },
      dashboardPath: '/skills/admin/dashboard'
    },
    {
      id: 'lecturer',
      name: 'Lecturer',
      description: 'Instructor portal for student management, assessments, and progress monitoring.',
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'from-blue-600 to-indigo-700',
      credentials: { email: 'lecturer@ems-training.com', password: 'lecturer123' },
      dashboardPath: '/skills/lecturer/dashboard'
    },
    {
      id: 'student',
      name: 'Student',
      description: 'Interactive learning platform with skill tracking and performance analytics.',
      icon: Award,
      gradient: 'from-emerald-500 to-teal-600',
      hoverGradient: 'from-emerald-600 to-teal-700',
      credentials: { email: 'student@ems-training.com', password: 'student123' },
      dashboardPath: '/skills/student/dashboard'
    }
  ];

  const handleRoleSelect = async (role: RoleOption) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email: role.credentials.email,
        password: role.credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Authentication failed. Please try again.');
      } else if (result?.ok) {
        // Let the root page handle redirects based on user role
        // No manual redirect needed here
        console.log('Login successful, waiting for automatic redirect...');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = () => {
    setSelectedRole('admin'); // Default to manual login
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (result?.ok) {
        // Let the root page handle redirects based on user role from session
        // No manual redirect needed here
        console.log('Login successful, waiting for automatic redirect...');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manual Login Form View
  if (selectedRole) {
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
          <div className="w-full max-w-md">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <div className="text-center p-6 sm:p-8 pb-4 sm:pb-6">
                <button
                  onClick={() => setSelectedRole(null)}
                  className="absolute top-3 left-3 sm:top-4 sm:left-4 text-white/80 hover:text-white transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                >
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 rotate-180" />
                  <span>Back</span>
                </button>
                
                <div className="relative mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                    <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-white mx-auto" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30" />
                </div>
                
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Advanced Login
                </h2>
                <p className="text-white/80 text-sm sm:text-base">
                  Enter your credentials to access the system
                </p>
              </div>

              <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="bg-red-500/90 backdrop-blur-sm border-red-400/50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-white">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-base bg-white/25 backdrop-blur-sm border-white/30 text-gray-900 placeholder:text-gray-600 focus:border-white/50 shadow-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 text-base bg-white/25 backdrop-blur-sm border-white/30 text-gray-900 placeholder:text-gray-600 focus:border-white/50 shadow-lg"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-base font-medium bg-white/35 backdrop-blur-sm border border-white/40 text-gray-900 hover:bg-white/45 hover:border-white/60 transition-all duration-300 shadow-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Role Selection View
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
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 max-w-4xl mx-auto px-2">
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="p-4 sm:p-6 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/20">
                <Stethoscope className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl blur opacity-30" />
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight px-4">
            Paramedic Skills Matrix
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed font-light px-4">
            Master critical paramedic skills through interactive learning, real-time assessment, 
            and comprehensive progress tracking.
          </p>
        </div>

        {/* Success Message Display */}
        {successMessage && (
          <Alert className="mb-8 max-w-lg mx-auto bg-green-500/90 backdrop-blur-sm border-green-400/50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-white">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-8 max-w-md mx-auto bg-red-500/90 backdrop-blur-sm border-red-400/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-white">{error}</AlertDescription>
          </Alert>
        )}

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl mb-6 sm:mb-8 px-2 sm:px-4">
          {roles.map((role) => {
            const IconComponent = role.icon;
            const isHovered = hoveredRole === role.name;
            
            return (
              <div
                key={role.name}
                onMouseEnter={() => setHoveredRole(role.name)}
                onMouseLeave={() => setHoveredRole(null)}
                onClick={() => handleRoleSelect(role)}
                className={`
                  relative group cursor-pointer
                  transition-all duration-300 ease-out
                  transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.02]
                  ${loading ? 'pointer-events-none opacity-50' : ''}
                  w-full
                `}
              >
                {/* Card */}
                <div className="relative p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 min-h-[280px] sm:min-h-[320px] flex flex-col">
                  {/* Icon Container */}
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className={`
                      p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300
                      bg-gradient-to-br ${isHovered ? role.hoverGradient : role.gradient}
                      transform group-hover:scale-110 shadow-lg group-hover:shadow-xl
                    `}>
                      <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3">
                      {role.name}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 flex-1">
                      {role.description}
                    </p>
                    
                    {/* CTA Button */}
                    <div className="inline-flex items-center justify-center w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm sm:text-base font-medium transition-all duration-300 group-hover:bg-white/30 group-hover:border-white/50 mt-auto">
                      <span>Access Portal</span>
                      <ArrowRight className={`
                        ml-2 h-4 w-4 transition-transform duration-300
                        ${isHovered ? 'translate-x-1' : ''}
                      `} />
                    </div>
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Options */}
        <div className="text-center mb-6 sm:mb-8 px-4 space-y-3">
          <Button
            variant="ghost"
            onClick={handleManualLogin}
            className="text-white/80 hover:text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm text-sm sm:text-base py-2 px-4 mr-3"
          >
            Advanced Login Options
          </Button>
          
          <Link href="/auth/signup">
            <Button
              variant="ghost"
              className="text-white hover:text-gray-900 hover:bg-white/80 bg-white/25 border border-white/40 backdrop-blur-sm text-sm sm:text-base py-2 px-4 shadow-lg transition-all duration-300"
            >
              Register New Student
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center text-white text-xs sm:text-sm px-4 bg-black/20 backdrop-blur-sm rounded-lg py-2">
          <p className="drop-shadow-lg">&copy; {new Date().getFullYear()} Paramedic Skills Matrix. Professional Training Platform.</p>
        </footer>
      </div>
    </div>
  );
};

export default RoleLoginPage;
