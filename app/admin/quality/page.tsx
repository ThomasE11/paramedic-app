'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, AlertTriangle, XCircle, TrendingUp, FileText, Users, BookOpen } from 'lucide-react';

export default function QualityPage() {
  const qualityMetrics = [
    { name: 'Content Quality', score: 92, status: 'excellent', icon: BookOpen },
    { name: 'User Satisfaction', score: 87, status: 'good', icon: Users },
    { name: 'System Reliability', score: 98, status: 'excellent', icon: Shield },
    { name: 'Assessment Accuracy', score: 85, status: 'good', icon: FileText },
  ];

  const qualityIssues = [
    {
      id: 1,
      title: 'Outdated skill procedure',
      description: 'IV Cannulation procedure needs updating to latest guidelines',
      severity: 'Medium',
      status: 'Open',
      assignedTo: 'Dr. Smith',
      createdAt: '2 days ago'
    },
    {
      id: 2,
      title: 'Assessment video quality',
      description: 'Low quality video in CPR assessment module',
      severity: 'Low',
      status: 'In Progress',
      assignedTo: 'Tech Team',
      createdAt: '1 week ago'
    },
    {
      id: 3,
      title: 'Inconsistent grading',
      description: 'Manual grading inconsistencies reported in practical assessments',
      severity: 'High',
      status: 'Open',
      assignedTo: 'QA Team',
      createdAt: '3 days ago'
    }
  ];

  const auditReports = [
    { name: 'Monthly Content Audit', date: '2024-01-15', status: 'Completed', issues: 3 },
    { name: 'User Experience Review', date: '2024-01-10', status: 'In Progress', issues: 7 },
    { name: 'Security Assessment', date: '2024-01-05', status: 'Completed', issues: 0 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'Low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Quality Assurance</h1>
          <p className="text-muted-foreground">Monitor and maintain system quality standards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {qualityMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    <span className={getScoreColor(metric.score)}>{metric.score}%</span>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    <span className="text-xs text-muted-foreground">+2% from last month</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Quality Issues
              </CardTitle>
              <CardDescription>Track and resolve quality concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityIssues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(issue.severity)}
                        <h4 className="font-medium">{issue.title}</h4>
                      </div>
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {issue.description}
                    </p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Assigned to: {issue.assignedTo}</span>
                      <span>{issue.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Issues
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Audit Reports
              </CardTitle>
              <CardDescription>Review quality audit results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{report.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{report.date}</span>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {report.issues} issues
                      </div>
                      <Button variant="ghost" size="sm">
                        View Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                Generate New Audit
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quality Improvement Actions</CardTitle>
            <CardDescription>Recommended actions to improve system quality</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <BookOpen className="h-5 w-5 mb-2" />
                <span className="font-medium">Content Review</span>
                <span className="text-sm text-muted-foreground">Review and update outdated content</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <Users className="h-5 w-5 mb-2" />
                <span className="font-medium">User Feedback</span>
                <span className="text-sm text-muted-foreground">Collect and analyze user feedback</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <Shield className="h-5 w-5 mb-2" />
                <span className="font-medium">Security Audit</span>
                <span className="text-sm text-muted-foreground">Conduct security assessment</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}