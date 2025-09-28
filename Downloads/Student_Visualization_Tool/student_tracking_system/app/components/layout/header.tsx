
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SettingsModal } from '@/components/account/settings-modal';
import { GmailSetupDialog } from '@/components/email/gmail-setup-dialog';
import { EnhancedEducationalAI } from '@/components/ai/EnhancedEducationalAI';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  GraduationCap, 
  LogOut, 
  User, 
  Settings,
  Menu,
  X,
  Mail,
  Bot
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Students', href: '/students' },
  { name: 'Classes', href: '/classes' },
  { name: 'Assignments', href: '/assignments' },
  { name: 'Modules', href: '/modules' },
  { name: 'Attendance', href: '/attendance' },
  { name: 'Timetables', href: '/timetables' },
];

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gmailSetupOpen, setGmailSetupOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);

  // Don't render anything during loading to prevent hydration issues
  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg">
        <div className="container mx-auto max-w-7xl">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse"></div>
                <div className="w-32 h-6 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  if (!session?.user) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
              </div>
              <div className="hidden xs:block">
                <span className="font-bold text-lg sm:text-xl text-foreground tracking-tight">
                  HCT Student Tracker
                </span>
                <p className="text-xs text-muted-foreground -mt-1 hidden sm:block">EMS Program Management</p>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-9 w-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative',
                  pathname === item.href
                    ? 'text-primary-foreground bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg'
                    : 'text-foreground hover:text-foreground hover:bg-muted/80 hover:shadow-md'
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* AI Assistant & User Menu */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* AI Assistant Button */}
            <Button
              onClick={() => setAiAssistantOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-3 sm:px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm"
            >
              <Bot className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">CLAUDIA AI</span>
            </Button>

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-muted transition-all duration-200">
                  <Avatar className="h-9 w-9 ring-2 ring-border shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-card border-border shadow-xl" align="end" forceMount>
                <div className="flex items-center gap-3 p-4">
                  <Avatar className="h-10 w-10 ring-2 ring-border">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-semibold text-foreground">{session.user.name}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                      {session.user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-muted transition-colors">
                  <User className="mr-3 h-4 w-4 text-blue-600" />
                  <span className="font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSettingsOpen(true)}
                  className="hover:bg-muted transition-colors"
                >
                  <Settings className="mr-3 h-4 w-4 text-blue-600" />
                  <span className="font-medium">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAiAssistantOpen(true)}
                  className="hover:bg-muted transition-colors"
                >
                  <Bot className="mr-3 h-4 w-4 text-purple-600" />
                  <span className="font-medium">CLAUDIA AI</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setGmailSetupOpen(true)}
                  className="hover:bg-muted transition-colors"
                >
                  <Mail className="mr-3 h-4 w-4 text-blue-600" />
                  <span className="font-medium">Gmail Setup</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'block px-4 py-4 rounded-xl text-base font-semibold transition-all duration-200 touch-manipulation min-h-[48px] flex items-center',
                    pathname === item.href
                      ? 'text-primary-foreground bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg'
                      : 'text-foreground hover:text-foreground hover:bg-muted hover:shadow-md'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Theme Toggle */}
              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-foreground">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
      
      {/* Gmail Setup Dialog */}
      <GmailSetupDialog
        open={gmailSetupOpen}
        onOpenChange={setGmailSetupOpen}
        onSetupComplete={() => {
          // Could add a success message here
        }}
      />
      
      {/* Enhanced Educational AI Assistant */}
      <EnhancedEducationalAI
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
      />
    </header>
  );
}
