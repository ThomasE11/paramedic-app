
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, GraduationCap, ArrowLeft, UserPlus, User, Lock, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Account created successfully. Signing you in...'
        });

        // Auto sign in after successful registration
        await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        });

        router.push('/dashboard');
        router.refresh();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create account',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/auth/signin"
          className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-xl text-foreground hover:bg-muted transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Sign In</span>
        </Link>
      </div>

      {/* Main content - Centered Glass Card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glass morphism signup card */}
          <div className="glass-morphism rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 backdrop-blur-xl rounded-2xl mx-auto mb-4 flex items-center justify-center border border-primary/30">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Join Our Platform</h1>
              <p className="text-muted-foreground text-lg">Create your instructor account to get started</p>
            </div>

            {/* Registration form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="h-14 bg-background/50 backdrop-blur-xl border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-base px-4"
                  />
                </div>

                <div className="relative">
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="h-14 bg-background/50 backdrop-blur-xl border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-base px-4"
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-14 bg-background/50 backdrop-blur-xl border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-base pl-12 pr-4"
                />
              </div>

              {/* Password field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-14 bg-background/50 backdrop-blur-xl border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-base pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Shield className="w-5 h-5" />
                </button>
              </div>

              {/* Confirm Password field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-14 bg-background/50 backdrop-blur-xl border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 text-base pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Shield className="w-5 h-5" />
                </button>
              </div>

              {/* Terms and conditions */}
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="terms"
                  required
                  className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary/50"
                />
                <label htmlFor="terms" className="text-foreground text-sm">
                  I agree to the{' '}
                  <Link href="#" className="text-foreground font-semibold hover:text-primary underline">
                    Terms of Service
                  </Link>
                </label>
              </div>

              {/* Create account button */}
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </div>
                )}
              </Button>

              {/* Sign in link */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/signin" 
                    className="text-foreground font-semibold hover:text-primary transition-colors underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>

            {/* Footer */}
            <div className="text-center mt-8">
              <p className="text-muted-foreground text-xs">
                Created by <span className="font-semibold">HCT Al Ain</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
