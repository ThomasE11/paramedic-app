'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, ArrowLeft, Plus, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const HEMSkillsPage = () => {
  const router = useRouter();

  const skillCategories = [
    {
      name: "Basic Life Support",
      skills: [
        { name: "CPR/AED", status: "completed", attempts: 3, required: 2 },
        { name: "Airway Management", status: "completed", attempts: 4, required: 3 },
        { name: "Bag-Mask Ventilation", status: "completed", attempts: 2, required: 2 },
        { name: "Patient Assessment", status: "in-progress", attempts: 1, required: 3 }
      ]
    },
    {
      name: "Advanced Life Support",
      skills: [
        { name: "IV Catheter Insertion", status: "completed", attempts: 5, required: 5 },
        { name: "Medication Administration", status: "in-progress", attempts: 2, required: 4 },
        { name: "Cardiac Monitoring", status: "not-started", attempts: 0, required: 3 },
        { name: "Defibrillation", status: "not-started", attempts: 0, required: 2 }
      ]
    },
    {
      name: "Trauma Management",
      skills: [
        { name: "Splinting/Immobilization", status: "completed", attempts: 3, required: 3 },
        { name: "Wound Care", status: "in-progress", attempts: 1, required: 2 },
        { name: "Spinal Immobilization", status: "not-started", attempts: 0, required: 2 },
        { name: "Hemorrhage Control", status: "completed", attempts: 2, required: 2 }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle className="h-3 w-3" />Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800 gap-1"><Clock className="h-3 w-3" />In Progress</Badge>;
      case 'not-started':
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'not-started':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTotalSkills = () => {
    return skillCategories.reduce((total, category) => total + category.skills.length, 0);
  };

  const getCompletedSkills = () => {
    return skillCategories.reduce((total, category) => 
      total + category.skills.filter(skill => skill.status === 'completed').length, 0
    );
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
              <span>Skills Tracker</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Skills Tracker</h1>
                  <p className="text-sm text-gray-600">Track your clinical skill demonstrations</p>
                </div>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Log New Skill
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Skills Categories */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {skillCategories.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      {category.name}
                    </CardTitle>
                    <CardDescription>
                      Clinical skills for {category.name.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.skills.map((skill, skillIndex) => (
                        <div key={skillIndex} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(skill.status)}
                              <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                            </div>
                            {getStatusBadge(skill.status)}
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Attempts: {skill.attempts}/{skill.required} required</span>
                              <span>{Math.round((skill.attempts / skill.required) * 100)}% complete</span>
                            </div>
                            <Progress 
                              value={Math.min((skill.attempts / skill.required) * 100, 100)} 
                              className="h-2"
                            />
                          </div>
                          
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline">View Details</Button>
                            {skill.status !== 'completed' && (
                              <Button size="sm">Log Attempt</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overall Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{getCompletedSkills()}</div>
                    <div className="text-sm text-gray-600">of {getTotalSkills()} skills completed</div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-purple-600 h-3 rounded-full" 
                        style={{ width: `${(getCompletedSkills() / getTotalSkills()) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((getCompletedSkills() / getTotalSkills()) * 100)}% Complete
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed Skills</span>
                      <span className="font-medium text-green-600">{getCompletedSkills()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>In Progress</span>
                      <span className="font-medium text-yellow-600">
                        {skillCategories.reduce((total, category) => 
                          total + category.skills.filter(skill => skill.status === 'in-progress').length, 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Not Started</span>
                      <span className="font-medium text-gray-600">
                        {skillCategories.reduce((total, category) => 
                          total + category.skills.filter(skill => skill.status === 'not-started').length, 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skillCategories.map((category, index) => {
                    const completed = category.skills.filter(skill => skill.status === 'completed').length;
                    const total = category.skills.length;
                    const percentage = (completed / total) * 100;
                    
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category.name}</span>
                          <span>{completed}/{total}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
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
                  Log New Skill
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Skills Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  View All Skills Matrix
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-yellow-800 font-medium">IV Therapy Assessment</p>
                    <p className="text-yellow-600">Due Friday - 2 more attempts needed</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-blue-800 font-medium">Cardiac Monitoring</p>
                    <p className="text-blue-600">Start next week - 3 attempts required</p>
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

export default HEMSkillsPage;