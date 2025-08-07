
'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Home, BookOpen, BarChart3, FileText, LogOut, User, Menu, X, ArrowLeft, GraduationCap, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

interface StudentNavigationProps {
  user: {
    name: string;
    email: string;
    studentId?: string;
  };
}

export function StudentNavigation({ user }: StudentNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchingView, setSwitchingView] = useState(false);
  
  const navigation = [
    { name: 'Dashboard', href: '/skills/student/dashboard', icon: Home },
    { name: 'Skills', href: '/skills/student/skills', icon: BookOpen },
    { name: 'Progress', href: '/skills/student/progress', icon: BarChart3 },
    { name: 'Mastery', href: '/skills/student/mastery', icon: Star },
    { name: 'Messages', href: '/skills/student/messaging', icon: MessageSquare },
  ];

  // Check if the current user is a lecturer in student view mode
  const isLecturerInStudentView = session?.user?.role === 'LECTURER' && session?.user?.viewMode === 'student';

  const handleReturnToLecturerView = async () => {
    setSwitchingView(true);
    try {
      // Call the API to validate the switch
      const response = await fetch('/api/auth/switch-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ viewMode: 'lecturer' }),
      });

      if (response.ok) {
        // Update the session with the new view mode
        await update({ viewMode: 'lecturer' });
        // Redirect to lecturer dashboard
        router.push('/skills/lecturer/dashboard');
      } else {
        console.error('Failed to switch view mode');
      }
    } catch (error) {
      console.error('Error switching view mode:', error);
    } finally {
      setSwitchingView(false);
    }
  };

  return (
    <>
      {/* Lecturer Preview Mode Banner */}
      {isLecturerInStudentView && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <GraduationCap className="h-4 w-4" />
            <span>You are viewing as a student (Preview Mode)</span>
            <Button
              onClick={handleReturnToLecturerView}
              disabled={switchingView}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 ml-4"
            >
              <ArrowLeft className="h-3 w-3 mr-1" />
              {switchingView ? 'Switching...' : 'Return to Lecturer View'}
            </Button>
          </div>
        </div>
      )}
      
      <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-40 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/skills/student/dashboard" className="flex items-center group">
              <div className="relative">
                <Stethoscope className="h-8 w-8 medical-blue transition-all group-hover:scale-110" />
                <div className="absolute -inset-1 bg-medical-blue/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Skills Matrix
              </span>
            </Link>
            <Badge variant="secondary" className="ml-3 hidden sm:inline-flex">
              {isLecturerInStudentView ? 'Lecturer (Student View)' : 'Student'}
            </Badge>
            {isLecturerInStudentView && (
              <Badge variant="outline" className="ml-2 hidden sm:inline-flex bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
                <GraduationCap className="h-3 w-3 mr-1" />
                Preview Mode
              </Badge>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-medical-blue text-white shadow-glow'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Return to Lecturer View Button */}
            {isLecturerInStudentView && (
              <Button
                onClick={handleReturnToLecturerView}
                disabled={switchingView}
                variant="outline"
                size="sm"
                className="hidden sm:flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {switchingView ? 'Switching...' : 'Return to Lecturer View'}
              </Button>
            )}
            
            {/* User Info - Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="text-sm text-right">
                <div className="font-medium text-foreground">{user.name}</div>
                {user.studentId && (
                  <div className="text-xs text-muted-foreground">{user.studentId}</div>
                )}
              </div>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-center w-10 h-10">
              <ThemeToggle />
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-medical-blue to-medical-purple text-white font-semibold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  {user.studentId && (
                    <div className="text-xs text-muted-foreground">ID: {user.studentId}</div>
                  )}
                  {isLecturerInStudentView && (
                    <div className="text-xs text-blue-600 font-medium">Preview Mode</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {isLecturerInStudentView && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleReturnToLecturerView} 
                      className="cursor-pointer text-blue-600"
                      disabled={switchingView}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      {switchingView ? 'Switching...' : 'Return to Lecturer View'}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden w-10 h-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 animate-slide-down">
            <nav className="px-3 pt-3 pb-4 space-y-2">
              {/* Return to Lecturer View Button - Mobile */}
              {isLecturerInStudentView && (
                <Button
                  onClick={handleReturnToLecturerView}
                  disabled={switchingView}
                  variant="outline"
                  size="sm"
                  className="w-full mb-3 touch-target bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {switchingView ? 'Switching...' : 'Return to Lecturer View'}
                </Button>
              )}
              
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors touch-target no-select ${
                      isActive
                        ? 'bg-medical-blue text-white shadow-sm'
                        : 'text-muted-foreground hover:text-primary hover:bg-accent'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
    </>
  );
}
