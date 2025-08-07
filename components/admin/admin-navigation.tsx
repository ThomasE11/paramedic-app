'use client';

import { useState } from 'react';
import { signOut, useSession, update } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Home, Users, Settings, BarChart3, Shield, LogOut, User, Menu, X, Database, UserCheck, Eye, GraduationCap, BookOpen, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

interface AdminNavigationProps {
  user: {
    name: string;
    email: string;
    role?: string;
  };
}

export function AdminNavigation({ user }: AdminNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const switchToStudentView = async () => {
    await update({ viewMode: 'student' });
    router.push('/skills/student/dashboard');
  };
  
  const switchToLecturerView = async () => {
    await update({ viewMode: 'lecturer' });
    router.push('/skills/lecturer/dashboard');
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/skills/admin/dashboard', icon: Home },
    { name: 'Users', href: '/skills/admin/users', icon: Users },
    { name: 'System', href: '/skills/admin/system', icon: Database },
    { name: 'Analytics', href: '/skills/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/skills/admin/settings', icon: Settings },
  ];

  const additionalNavigation = [
    { name: 'Manage Roles', href: '/skills/admin/roles', icon: UserCheck },
    { name: 'Notifications', href: '/skills/admin/notifications', icon: Mail },
    { name: 'All Skills', href: '/skills/admin/skills', icon: BookOpen },
    { name: 'Quality Assurance', href: '/skills/admin/quality', icon: Shield },
  ];

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-40 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/skills/admin/dashboard" className="flex items-center group">
              <div className="relative">
                <Shield className="h-8 w-8 text-red-600 transition-all group-hover:scale-110" />
                <div className="absolute -inset-1 bg-red-600/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </Link>
            <Badge variant="destructive" className="ml-3 hidden sm:inline-flex">
              <Shield className="h-3 w-3 mr-1" />
              Administrator
            </Badge>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-muted-foreground hover:text-primary hover:bg-accent/50'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Additional Navigation Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 text-muted-foreground hover:text-primary hover:bg-accent/50">
                  <Menu className="h-4 w-4 mr-2" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {additionalNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center cursor-pointer">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* User Info - Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              <div className="text-sm text-right">
                <div className="font-medium text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground">Administrator</div>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-center w-10 h-10">
              <ThemeToggle />
            </div>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-red-500/20">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-red-600 to-red-500 text-white font-semibold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 animate-scale-in">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                  <div className="text-xs text-red-600 font-medium">Administrator</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={switchToStudentView} className="cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Switch to Student View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={switchToLecturerView} className="cursor-pointer">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Switch to Lecturer View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive">
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
            <nav className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-muted-foreground hover:text-primary hover:bg-accent'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Additional Navigation in Mobile */}
              <div className="border-t border-border/50 mt-2 pt-2">
                {additionalNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'text-muted-foreground hover:text-primary hover:bg-accent'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}