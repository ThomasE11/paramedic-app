'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft, Plus, ChevronRight, Calendar, Clock, User, AlertCircle } from 'lucide-react';

const HEMPCRPage = () => {
  const router = useRouter();

  const pcrRecords = [
    {
      id: "PCR-2024-003",
      date: "2024-11-08",
      patientAge: "45",
      chiefComplaint: "Chest Pain",
      disposition: "Transport to General Hospital",
      supervisor: "Dr. Sarah Mitchell",
      status: "submitted",
      dueDate: "2024-11-15",
      submittedDate: "2024-11-10"
    },
    {
      id: "PCR-2024-002", 
      date: "2024-11-01",
      patientAge: "32",
      chiefComplaint: "Motor Vehicle Collision",
      disposition: "Transport to Trauma Center",
      supervisor: "Paramedic John Stevens",
      status: "approved",
      dueDate: "2024-11-08",
      submittedDate: "2024-11-03"
    },
    {
      id: "PCR-2024-001",
      date: "2024-10-25", 
      patientAge: "67",
      chiefComplaint: "Difficulty Breathing",
      disposition: "Transport to Regional Medical",
      supervisor: "Dr. Amanda Rodriguez",
      status: "draft",
      dueDate: "2024-11-12",
      submittedDate: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Needs Revision</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'approved') return false;
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
              <span>PCR Records</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">PCR Records</h1>
                  <p className="text-sm text-gray-600">Patient Care Report documentation</p>
                </div>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New PCR
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main PCR List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Patient Care Reports
                </CardTitle>
                <CardDescription>
                  Your clinical patient care documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pcrRecords.map((pcr) => {
                    const daysUntilDue = getDaysUntilDue(pcr.dueDate);
                    const overdue = isOverdue(pcr.dueDate, pcr.status);
                    
                    return (
                      <div key={pcr.id} className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${overdue ? 'border-red-200 bg-red-50' : ''}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              {pcr.id}
                              {overdue && <AlertCircle className="h-4 w-4 text-red-500" />}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(pcr.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(pcr.status)}
                            {overdue ? (
                              <p className="text-xs text-red-600 mt-1">Overdue</p>
                            ) : pcr.status !== 'approved' ? (
                              <p className="text-xs text-gray-500 mt-1">
                                Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>Patient: {pcr.patientAge} years old</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>Chief Complaint: {pcr.chiefComplaint}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Disposition: {pcr.disposition}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>Supervisor: {pcr.supervisor}</span>
                          </div>
                        </div>
                        
                        {pcr.submittedDate && (
                          <div className="mt-2 text-xs text-gray-500">
                            Submitted: {new Date(pcr.submittedDate).toLocaleDateString()}
                          </div>
                        )}
                        
                        <div className="mt-3 pt-3 border-t flex gap-2">
                          {pcr.status === 'draft' ? (
                            <>
                              <Button size="sm">Continue Editing</Button>
                              <Button size="sm" variant="outline">Delete Draft</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline">View Report</Button>
                              {pcr.status === 'approved' && (
                                <Button size="sm" variant="outline">Download PDF</Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PCR Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {pcrRecords.filter(pcr => pcr.status === 'approved').length}
                      </div>
                      <div className="text-xs text-gray-600">Approved</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {pcrRecords.filter(pcr => pcr.status === 'submitted').length}
                      </div>
                      <div className="text-xs text-gray-600">Under Review</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total PCRs</span>
                      <span className="font-medium">{pcrRecords.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Drafts</span>
                      <span className="font-medium text-yellow-600">
                        {pcrRecords.filter(pcr => pcr.status === 'draft').length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Required</span>
                      <span className="font-medium">5 total</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deadlines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pcrRecords
                    .filter(pcr => pcr.status !== 'approved')
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .map((pcr) => {
                      const daysUntilDue = getDaysUntilDue(pcr.dueDate);
                      const overdue = isOverdue(pcr.dueDate, pcr.status);
                      
                      return (
                        <div key={pcr.id} className={`p-2 rounded border ${overdue ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                          <p className={`font-medium text-sm ${overdue ? 'text-red-800' : 'text-gray-800'}`}>
                            {pcr.id}
                          </p>
                          <p className={`text-xs ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                            {overdue ? 'Overdue' : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                      );
                    })}
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
                  Create New PCR
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  PCR Template Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export All PCRs
                </Button>
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">PCR Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• PCRs must be submitted within 7 days of patient contact</p>
                  <p>• Include detailed patient assessment and interventions</p>
                  <p>• Supervisor review required before final submission</p>
                  <p>• All fields must be completed accurately</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HEMPCRPage;