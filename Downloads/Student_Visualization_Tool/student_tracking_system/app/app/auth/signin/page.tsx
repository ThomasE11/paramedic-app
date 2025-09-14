
'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, GraduationCap, User, Lock, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        toast({
          title: 'Error',
          description: 'Invalid email or password',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Success',
          description: 'Signed in successfully'
        });
        router.push('/dashboard');
        router.refresh();
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

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Main content - Centered Glass Card */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glass morphism login card */}
          <div className="glass-morphism rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/20 backdrop-blur-xl rounded-2xl mx-auto mb-4 flex items-center justify-center border border-primary/30">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Login</h1>
              <p className="text-muted-foreground text-lg">Welcome back please login to your account</p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email field */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="User Name"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember me */}
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-2 focus:ring-primary/50"
                />
                <label htmlFor="remember" className="text-foreground text-sm font-medium">
                  Remember me
                </label>
              </div>

              {/* Login button */}
              <Button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Logging in...
                  </div>
                ) : (
                  'Login'
                )}
              </Button>

              {/* Sign up link */}
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/signup" 
                    className="text-foreground font-semibold hover:text-primary transition-colors underline"
                  >
                    Signup
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
