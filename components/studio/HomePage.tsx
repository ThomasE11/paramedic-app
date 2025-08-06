'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Users, Shield, ChevronRight, Activity, Brain, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">EMS Training Studio</h1>
                <p className="text-sm text-gray-600">Emergency Medical Services Training Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                {session?.user?.role || 'User'}
              </Badge>
              <Button
                variant="outline"
                onClick={() => router.push('/auth/signin')}
              >
                Account
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-12 leading-tight">
              Master Emergency
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}Medical Skills
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Our comprehensive three-tier system progresses from foundational skills to advanced clinical practice and specialized equipment management.
            </p>
            <div className="flex justify-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                <Brain className="h-4 w-4 mr-2" />
                AI-Powered Assessment
              </Badge>
              <Badge className="bg-indigo-100 text-indigo-800 px-4 py-2">
                <Stethoscope className="h-4 w-4 mr-2" />
                Clinical Excellence
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
                <Activity className="h-4 w-4 mr-2" />
                Real-time Tracking
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Three-Tier System */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Three-Tier Training Architecture
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our integrated system seamlessly connects laboratory skills, clinical practice, and equipment management for comprehensive EMS education.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tier 1: Skills Management Portal */}
            <Card className="p-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => router.push('/skills')}>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <Badge className="mb-4 bg-blue-600">Tier 1</Badge>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                  Skills Management Portal
                </CardTitle>
                <CardDescription className="text-gray-600 mb-6">
                  Master fundamental emergency medical skills with AI-powered video analysis, interactive assessments, and comprehensive progress tracking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-blue-600 mr-3" />
                    69+ Paramedic Skills & Procedures
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-blue-600 mr-3" />
                    AI-Powered Video Analysis
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-blue-600 mr-3" />
                    Real-time Progress Tracking
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-blue-600 mr-3" />
                    Competency Validation System
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-blue-600 mr-3" />
                    Interactive Quiz & Assessment
                  </li>
                </ul>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/skills');
                  }}
                >
                  Explore Skills Portal
                </Button>
              </CardContent>
            </Card>

            {/* Tier 2: Clinical Practice Modules */}
            <Card className="p-8 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => router.push('/clinical')}>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <Badge className="mb-4 bg-indigo-600">Tier 2</Badge>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                  Clinical Practice Modules
                </CardTitle>
                <CardDescription className="text-gray-600 mb-6">
                  Advanced clinical training including HEM and Responder levels 1-3 with real-world practice scenarios and comprehensive documentation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-indigo-600 mr-3" />
                    Hospital Emergency Medicine (HEM)
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-indigo-600 mr-3" />
                    Responder Levels 1, 2, 3
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-indigo-600 mr-3" />
                    Patient Care Report (PCR) System
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-indigo-600 mr-3" />
                    Shift Logging & GPS Verification
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-indigo-600 mr-3" />
                    Clinical Evaluations & Feedback
                  </li>
                </ul>
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/clinical');
                  }}
                >
                  Access Clinical Modules
                </Button>
              </CardContent>
            </Card>

            {/* Tier 3: Equipment Management */}
            <Card className="p-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => router.push('/equipment')}>
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <Badge className="mb-4 bg-purple-600">Tier 3</Badge>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-4">
                  Equipment Management
                </CardTitle>
                <CardDescription className="text-gray-600 mb-6">
                  Comprehensive laboratory equipment tracking, maintenance scheduling, and inventory management with QR code integration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600 mb-6">
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-purple-600 mr-3" />
                    QR Code Equipment Tracking
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-purple-600 mr-3" />
                    Automated Maintenance Alerts
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-purple-600 mr-3" />
                    Consumables Management
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-purple-600 mr-3" />
                    Equipment Reservation System
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-purple-600 mr-3" />
                    Analytics & Optimization
                  </li>
                </ul>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push('/equipment');
                  }}
                >
                  Manage Equipment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Integration Benefits */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Integrated Training Experience
            </h2>
            <p className="text-xl text-gray-600">
              Seamless progression from laboratory skills to clinical application
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Practice Skills</h3>
              <p className="text-gray-600">Master procedures in the laboratory with AI feedback</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Apply Clinically</h3>
              <p className="text-gray-600">Use skills in real clinical environments</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Equipment</h3>
              <p className="text-gray-600">Monitor equipment usage and maintenance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-4xl font-bold mb-6 text-white">EMS Training Studio</h3>
            <p className="text-gray-400 text-lg mb-8">
              Empowering the next generation of emergency medical professionals through integrated, intelligent training management.
            </p>
            <div className="flex justify-center space-x-8">
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => router.push('/skills')}
              >
                Skills Portal
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => router.push('/clinical')}
              >
                Clinical Modules
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => router.push('/equipment')}
              >
                Equipment Management
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;