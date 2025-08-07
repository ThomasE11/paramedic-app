
'use client';

import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Stethoscope, Home, Users, BarChart3, Bell, Settings, LogOut, User, Menu, X, GraduationCap, Eye, BookOpen, UserPlus, MessageSquare, FileText, MessageCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

interface NavItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  subItems?: NavSubItem[];
}

interface NavSubItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface LecturerNavigationProps {
  user: {
    name: string;
    email: string;
    studentId?: string;
  };
}

export function LecturerNavigation({ user }: LecturerNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, update } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchingView, setSwitchingView] = useState(false);
  
  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/lecturer/dashboard', icon: Home },
    { name: 'Students', href: '/lecturer/students', icon: Users },
    {
      name: 'Student Feedback',
      icon: MessageSquare,
      subItems: [
        { name: 'Feedback Overview', href: '/lecturer/student-feedback', icon: MessageSquare },
        { name: 'Submissions', href: '/lecturer/student-submissions', icon: FileText },
      ],
    },
    { name: 'Messaging', href: '/lecturer/messaging', icon: MessageCircle },
    { name: 'Simple Messages', href: '/lecturer/messages', icon: MessageCircle },
    { name: 'Analytics', href: '/lecturer/analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/lecturer/notifications', icon: Bell },
    { name: 'Enrollment', href: '/lecturer/enrollment', icon: UserPlus },
    { name: 'Subjects', href: '/lecturer/subjects', icon: BookOpen },
    { name: 'Settings', href: '/lecturer/settings', icon: Settings },
  ];

  const handleSwitchToStudentView = async () => {
    setSwitchingView(true);
    try {
      const response = await fetch('/api/auth/switch-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ viewMode: 'student' }),
      });

      if (response.ok) {
        await update({ viewMode: 'student' });
        router.push('/skills/student/dashboard');
      } else {
        console.error('Failed to switch view mode');
      }
    } catch (error) {
      console.error('Error switching view mode:', error);
    } finally {
      setSwitchingView(false);
    }
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = item.href ? pathname === item.href : (item.subItems || []).some(sub => pathname === sub.href);

    if (item.subItems) {
      return (
        <DropdownMenu key={item.name}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={`flex items-center px-3 py-2 text-xs font-medium rounded-full transition-all duration-200 hover-lift ${
                isActive
                  ? 'glass-strong text-white dark:text-white shadow-apple-lg bg-black/20 dark:bg-white/20'
                  : 'text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="h-3 w-3 mr-1" />
              {item.name}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 animate-fadeInUp apple-card border-white/20">
            {item.subItems.map((subItem) => {
              const SubIcon = subItem.icon;
              const isSubActive = pathname === subItem.href;
              return (
                <DropdownMenuItem key={subItem.name} asChild>
                  <Link
                    href={subItem.href}
                    className={`cursor-pointer hover-lift flex items-center ${
                      isSubActive ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    <SubIcon className="mr-2 h-4 w-4" />
                    {subItem.name}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.href!}
        className={`flex items-center px-3 py-2 text-xs font-medium rounded-full transition-all duration-200 hover-lift ${
          isActive
            ? 'glass-strong text-white dark:text-white shadow-apple-lg bg-black/20 dark:bg-white/20'
            : 'text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
        }`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {item.name}
      </Link>
    );
  };
  
  const renderMobileNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = item.href ? pathname === item.href : (item.subItems || []).some(sub => pathname === sub.href);

    if (item.subItems) {
      return (
        <Collapsible key={item.name}>
          <CollapsibleTrigger className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-2xl transition-all duration-200 hover-lift ${
            isActive
              ? 'glass-strong text-white dark:text-white shadow-apple-lg bg-black/20 dark:bg-white/20'
              : 'text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
          }`}>
            <div className="flex items-center">
              <Icon className="h-4 w-4 mr-3" />
              {item.name}
            </div>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-8 pt-1 space-y-1">
            {item.subItems.map(subItem => {
              const SubIcon = subItem.icon;
              const isSubActive = pathname === subItem.href;
              return (
                <Link
                  key={subItem.name}
                  href={subItem.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-2xl transition-all duration-200 hover-lift ${
                    isSubActive
                      ? 'glass-strong text-white dark:text-white shadow-apple-lg bg-black/20 dark:bg-white/20'
                      : 'text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <SubIcon className="h-4 w-4 mr-3" />
                  {subItem.name}
                </Link>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.href!}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-2xl transition-all duration-200 hover-lift ${
          isActive
            ? 'glass-strong text-white dark:text-white shadow-apple-lg bg-black/20 dark:bg-white/20'
            : 'text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <Icon className="h-4 w-4 mr-3" />
        {item.name}
      </Link>
    );
  };

  return (
    <header className="nav-blur sticky top-0 z-40 animate-slideInLeft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/lecturer/dashboard" className="flex items-center group">
              <div className="relative">
                <div className="glass-strong p-2 rounded-full group-hover:scale-110 transition-all duration-300">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity animate-pulseGlow" />
              </div>
              <span className="ml-3 apple-subtitle bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-white/80 bg-clip-text text-transparent">
                Skills Matrix
              </span>
            </Link>
            <div className="badge-glass ml-3 hidden sm:inline-flex px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-900/40 border dark:border-blue-700/50">
              <GraduationCap className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-300" />
              <span className="text-blue-600 dark:text-blue-300 font-medium">Lecturer</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-1">
            {navigation.slice(0, 6).map(renderNavItem)}
            
            {/* More Menu for additional items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="glass-subtle text-slate-700 dark:text-white/80 hover:bg-slate-100/80 dark:hover:bg-white/10 rounded-full px-3 py-2">
                  <span className="text-xs font-medium">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 animate-fadeInUp apple-card border-white/20">
                {navigation.slice(6).map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link
                        href={item.href!}
                        className={`cursor-pointer hover-lift flex items-center ${
                          isActive ? 'bg-accent text-accent-foreground' : ''
                        }`}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          {/* Right Side */}
          <div className="flex items-center space-x-2">
            <div className="hidden xl:flex items-center space-x-3">
              <div className="text-sm text-right min-w-0">
                <div className="font-medium text-slate-900 dark:text-white truncate max-w-32">{user.name}</div>
                {user.studentId && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 truncate">{user.studentId}</div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center w-10 h-10">
              <ThemeToggle />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-white/20 glass-subtle">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="gradient-blue-purple text-white font-semibold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-fadeInUp apple-card border-white/20">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  {user.studentId && (
                    <div className="text-xs text-muted-foreground">ID: {user.studentId}</div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover-lift">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSwitchToStudentView} 
                  className="cursor-pointer hover-lift text-blue-400"
                  disabled={switchingView}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {switchingView ? 'Switching...' : 'Switch to Student View'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive hover-lift">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden glass-subtle text-white hover:bg-white/10 rounded-full w-10 h-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 animate-fadeInUp">
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map(renderMobileNavItem)}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
