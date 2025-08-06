'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Heart, 
  Activity, 
  FileText, 
  Clock, 
  Users,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

const ClinicalPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Studio</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Clinical Practice Modules</h1>
                <p className="text-sm text-gray-600">Tier 2 - Advanced Clinical Training</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-indigo-600">Tier 2</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Clinical Practice Modules
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Apply your laboratory skills in real clinical environments with comprehensive documentation and evaluation systems.
          </p>
        </div>

        {/* Module Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* HEM Module */}
          <Card className="p-6 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Badge className="bg-indigo-600 text-white">Active</Badge>
                </div>
              </div>
              <CardTitle className="text-2xl">Hospital Emergency Medicine (HEM)</CardTitle>
              <CardDescription className="text-gray-600">
                Comprehensive hospital-based clinical rotations with direct patient care experience and supervision.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-indigo-600 mr-2" />
                  Emergency Department Rotations
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-indigo-600 mr-2" />
                  Direct Patient Care
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-indigo-600 mr-2" />
                  Supervised Clinical Practice
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-indigo-600 mr-2" />
                  Real-time Evaluation
                </li>
              </ul>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => router.push('/clinical/hem')}
              >
                Enter HEM Module
              </Button>
            </CardContent>
          </Card>

          {/* Responder Series */}
          <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Badge className="bg-purple-600 text-white">Coming Soon</Badge>
                </div>
              </div>
              <CardTitle className="text-2xl">Responder Series</CardTitle>
              <CardDescription className="text-gray-600">
                Progressive field-based training modules for Responder Levels 1, 2, and 3 certifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-purple-600 mr-2" />
                  Responder Level 1 - Basic Field Care
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-purple-600 mr-2" />
                  Responder Level 2 - Intermediate Care
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-purple-600 mr-2" />
                  Responder Level 3 - Advanced Care
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-purple-600 mr-2" />
                  Field-based Scenarios
                </li>
              </ul>
              <Button 
                variant="outline"
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                disabled
              >
                Available Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Support Systems */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Patient Care Reports</CardTitle>
              <CardDescription>
                Comprehensive PCR documentation system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/clinical/pcr')}
              >
                Access PCR System
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Shift Management</CardTitle>
              <CardDescription>
                Log hours and track clinical experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/clinical/shifts')}
              >
                Manage Shifts
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 bg-white hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg">Clinical Evaluations</CardTitle>
              <CardDescription>
                Performance assessments and feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/clinical/evaluations')}
              >
                View Evaluations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClinicalPage;