'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowLeft, Clock, MapPin, Users, ChevronRight } from 'lucide-react';

const HEMSchedulePage = () => {
  const router = useRouter();

  const upcomingShifts = [
    {
      id: 1,
      date: "Friday, November 15, 2024",
      time: "08:00 - 20:00",
      location: "General Hospital Emergency Department",
      supervisor: "Dr. Sarah Mitchell",
      status: "confirmed",
      type: "Emergency Department Rotation"
    },
    {
      id: 2,
      date: "Saturday, November 16, 2024", 
      time: "08:00 - 20:00",
      location: "City Medical Center",
      supervisor: "Paramedic John Stevens",
      status: "confirmed",
      type: "Ambulance Observation"
    },
    {
      id: 3,
      date: "Friday, November 22, 2024",
      time: "08:00 - 20:00", 
      location: "Regional Medical Center",
      supervisor: "TBD",
      status: "pending",
      type: "Emergency Department Rotation"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
              <span>Schedule</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">HEM Schedule</h1>
                <p className="text-sm text-gray-600">Manage your clinical rotation schedule</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Upcoming Shifts
                </CardTitle>
                <CardDescription>
                  Your scheduled clinical rotations and placements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingShifts.map((shift) => (
                    <div key={shift.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{shift.type}</h3>
                          <p className="text-sm text-gray-600">{shift.date}</p>
                        </div>
                        {getStatusBadge(shift.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{shift.time} (12 hours)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{shift.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>Supervisor: {shift.supervisor}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t flex gap-2">
                        <Button size="sm" variant="outline">View Details</Button>
                        {shift.status === 'confirmed' && (
                          <Button size="sm">Sign In</Button>
                        )}
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
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hours Completed</span>
                      <span>95/180</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '53%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Shifts Completed</span>
                      <span>8/15</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '53%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Request Schedule Change
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download Schedule PDF
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Contact Coordinator
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-red-800 font-medium">PCR Due Tomorrow</p>
                    <p className="text-red-600">Submit patient care report #3</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-yellow-800 font-medium">Skill Assessment</p>
                    <p className="text-yellow-600">IV Therapy due Friday</p>
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

export default HEMSchedulePage;