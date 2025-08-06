'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowLeft, Plus, ChevronRight, Calendar, MapPin } from 'lucide-react';

const HEMHoursPage = () => {
  const router = useRouter();

  const loggedHours = [
    {
      id: 1,
      date: "2024-11-08",
      location: "General Hospital ED",
      startTime: "08:00",
      endTime: "20:00",
      totalHours: 12,
      supervisor: "Dr. Sarah Mitchell",
      status: "approved",
      notes: "Excellent performance during trauma cases"
    },
    {
      id: 2,
      date: "2024-11-01",
      location: "City Medical Center",
      startTime: "08:00", 
      endTime: "20:00",
      totalHours: 12,
      supervisor: "Paramedic John Stevens",
      status: "approved",
      notes: "Good observation skills during ambulance runs"
    },
    {
      id: 3,
      date: "2024-10-25",
      location: "Regional Medical Center",
      startTime: "08:00",
      endTime: "20:00", 
      totalHours: 12,
      supervisor: "Dr. Amanda Rodriguez",
      status: "pending",
      notes: "Pending supervisor review"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalHours = loggedHours
    .filter(log => log.status === 'approved')
    .reduce((sum, log) => sum + log.totalHours, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/clinical/hem')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to HEM Module</span>
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')}>Studio</Button>
              <ChevronRight className="h-4 w-4" />
              <Button variant="ghost" size="sm" onClick={() => router.push('/clinical')}>Clinical</Button>
              <ChevronRight className="h-4 w-4" />
              <Button variant="ghost" size="sm" onClick={() => router.push('/clinical/hem')}>HEM</Button>
              <ChevronRight className="h-4 w-4" />
              <span>Hours Log</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Hours Log</h1>
                  <p className="text-sm text-gray-600">Track your clinical practicum hours</p>
                </div>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Log New Hours
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Hours Log */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Logged Hours
                </CardTitle>
                <CardDescription>
                  Your clinical practicum hour entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loggedHours.map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{log.location}</h3>
                          <p className="text-sm text-gray-600">{new Date(log.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(log.status)}
                          <p className="text-lg font-bold text-gray-900 mt-1">{log.totalHours}h</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{log.startTime} - {log.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>Supervisor: {log.supervisor}</span>
                        </div>
                      </div>
                      
                      {log.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <p className="text-gray-700">{log.notes}</p>
                        </div>
                      )}
                      
                      <div className="mt-3 pt-3 border-t flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progress Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{totalHours}</div>
                    <div className="text-sm text-gray-600">of 180 hours completed</div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full" 
                        style={{ width: `${(totalHours / 180) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((totalHours / 180) * 100)}% Complete
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Approved Hours</span>
                      <span className="font-medium">{totalHours}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pending Hours</span>
                      <span className="font-medium text-yellow-600">
                        {loggedHours.filter(log => log.status === 'pending').reduce((sum, log) => sum + log.totalHours, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Remaining Hours</span>
                      <span className="font-medium text-red-600">{180 - totalHours}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>This Week</span>
                    <span className="font-medium">12/24 hours</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600">You need 12 more hours this week to stay on track</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Log New Hours
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Hours Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  View Calendar
                </Button>
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-blue-800 font-medium">Upcoming Shift</p>
                    <p className="text-blue-600">Friday 8:00 AM - Log hours after</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-yellow-800 font-medium">Pending Approval</p>
                    <p className="text-yellow-600">1 entry waiting for supervisor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HEMHoursPage;