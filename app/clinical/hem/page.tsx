'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Hospital, 
  Users, 
  Clock, 
  FileText,
  Calendar,
  TrendingUp,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  ClipboardCheck,
  Activity,
  AlertCircle,
  Target
} from 'lucide-react';

const HEMModule = () => {
  const router = useRouter();

  // Dashboard Stats Data
  const stats = [
    {
      title: "Practicum Hours",
      value: "95",
      total: "180",
      percentage: 53,
      icon: Clock,
      color: "primary",
      description: "Hours completed",
      trend: "+12 this week"
    },
    {
      title: "Skills Completed",
      value: "78",
      total: "132",
      percentage: 59,
      icon: Activity,
      color: "secondary",
      description: "Skills demonstrated",
      trend: "+5 new skills"
    },
    {
      title: "PCR Submissions",
      value: "3",
      total: "5",
      percentage: 60,
      icon: ClipboardCheck,
      color: "accent",
      description: "Patient care records",
      trend: "2 pending"
    },
    {
      title: "Upcoming Deadlines",
      value: "4",
      total: null,
      percentage: null,
      icon: Calendar,
      color: "warning",
      description: "This week",
      trend: "Due soon",
      urgent: true
    }
  ];

  // Quick Navigation Items
  const navigationItems = [
    {
      title: "Schedule",
      description: "View and manage your shifts",
      icon: Calendar,
      path: "/clinical/hem/schedule",
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Hours Log",
      description: "Track practicum hours and calls",
      icon: Clock,
      path: "/clinical/hem/hours",
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Skills Tracker",
      description: "Log and track clinical skills",
      icon: Target,
      path: "/clinical/hem/skills",
      color: "text-purple-600 bg-purple-100"
    },
    {
      title: "PCR Records",
      description: "Patient care documentation",
      icon: FileText,
      path: "/clinical/hem/pcr",
      color: "text-orange-600 bg-orange-100"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'secondary':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'accent':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/clinical')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Clinical</span>
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                Studio
              </Button>
              <ChevronRight className="h-4 w-4" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/clinical')}
              >
                Clinical Practice
              </Button>
              <ChevronRight className="h-4 w-4" />
              <span>HEM Module</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-blue-600 mx-6 my-6 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-600/90"></div>
        <div className="relative h-64 flex items-center justify-center px-6">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Hospital className="h-8 w-8" />
              <h1 className="text-3xl font-bold">HEM 2903</h1>
            </div>
            <h2 className="text-xl mb-2">Hospital Emergency Medicine - Ambulance Practicum I</h2>
            <p className="text-white/80 mb-4">Academic Year 2024/2025 • Term 202430</p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Badge variant="secondary" className="gap-1 bg-white/20 text-white">
                <Users className="h-3 w-3" />
                3 Credit Hours
              </Badge>
              <Badge variant="secondary" className="gap-1 bg-white/20 text-white">
                <MapPin className="h-3 w-3" />
                AAZ & SJA Campuses
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                180 Practicum Hours Required
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Navigation */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-indigo-600" />
            <h3 className="font-medium">Quick Navigation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-start text-left hover:bg-gray-50"
                onClick={() => router.push(item.path)}
              >
                <div className="flex items-center gap-3 w-full mb-2">
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </Card>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = getColorClasses(stat.color);
            
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg border ${colorClasses}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {stat.urgent && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Urgent
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </span>
                    {stat.total && (
                      <span className="text-sm text-gray-500">
                        / {stat.total}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                  
                  {stat.percentage && (
                    <div className="space-y-1">
                      <Progress value={stat.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{stat.percentage}% complete</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 pt-2">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">{stat.trend}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upcoming Deadlines */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                Upcoming Deadlines
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-900">PCR Submission #3</p>
                    <p className="text-sm text-red-700">Due: Tomorrow at 11:59 PM</p>
                  </div>
                  <Badge variant="destructive">Urgent</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-yellow-900">Skill Assessment - IV Therapy</p>
                    <p className="text-sm text-yellow-700">Due: Friday, Nov 15</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">3 days</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-blue-900">Shift Reflection Log</p>
                    <p className="text-sm text-blue-700">Due: Monday, Nov 18</p>
                  </div>
                  <Badge variant="secondary">6 days</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Course Information Card */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                Course Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Prerequisites:</span>
                  <span className="font-medium">HEM 1103 - EMT-Basic</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mode:</span>
                  <span className="font-medium">Face-to-Face Clinical</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Schedule:</span>
                  <span className="font-medium">Fri & Sat Shifts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Weeks:</span>
                  <span className="font-medium">15 weeks</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full text-xs">
                  View Complete Course Guide
                </Button>
              </div>
            </Card>

            {/* Module Features */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Hospital className="h-5 w-5 text-indigo-600" />
                HEM Module Features
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Patient Report Forms (PRF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Clinical Skill Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span>Supervisor Evaluations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <span>Shift Scheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>Clinical Hours Logging</span>
                </div>
              </div>
            </Card>

            {/* Navigation to Other Modules */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Other Clinical Modules</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" disabled>
                  Responder One
                  <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Responder Two
                  <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start" disabled>
                  Responder Three
                  <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HEMModule;