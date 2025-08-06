'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Activity,
  Shield,
  Database,
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react';

interface QualityMetrics {
  testsPassingCount: number;
  warningsCount: number;
  criticalIssuesCount: number;
  systemHealthScore: number;
  securityScore: number;
  performanceScore: number;
  uptime: number;
}

export default function AdminQualityPage() {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    testsPassingCount: 847,
    warningsCount: 12,
    criticalIssuesCount: 0,
    systemHealthScore: 98,
    securityScore: 95,
    performanceScore: 92,
    uptime: 99.8
  });
  const [loading, setLoading] = useState(false);

  const refreshMetrics = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate slight changes in metrics
    setMetrics(prev => ({
      ...prev,
      testsPassingCount: prev.testsPassingCount + Math.floor(Math.random() * 10) - 5,
      warningsCount: Math.max(0, prev.warningsCount + Math.floor(Math.random() * 6) - 3),
      systemHealthScore: Math.min(100, Math.max(90, prev.systemHealthScore + Math.floor(Math.random() * 6) - 3))
    }));
    setLoading(false);
  };

  const recentChecks = [
    {
      id: 1,
      name: "Database Integrity Check",
      status: "success",
      description: "Completed successfully",
      timestamp: "2 hours ago",
      icon: Database
    },
    {
      id: 2,
      name: "Security Audit",
      status: "success", 
      description: "All tests passed",
      timestamp: "6 hours ago",
      icon: Shield
    },
    {
      id: 3,
      name: "Performance Optimization",
      status: "warning",
      description: "Minor improvements suggested",
      timestamp: "1 day ago",
      icon: TrendingUp
    },
    {
      id: 4,
      name: "API Health Check",
      status: "success",
      description: "All endpoints responding",
      timestamp: "1 day ago",
      icon: Activity
    },
    {
      id: 5,
      name: "User Authentication Test",
      status: "success",
      description: "Authentication flows working",
      timestamp: "2 days ago",
      icon: CheckCircle
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const runQualityCheck = (checkType: string) => {
    alert(`Running ${checkType} check... This would initiate the actual quality assurance process.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quality Assurance</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and ensure system quality standards
          </p>
        </div>
        <Button 
          onClick={refreshMetrics} 
          disabled={loading}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Metrics'}
        </Button>
      </div>

      {/* Quality Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Tests Passing</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.testsPassingCount}</div>
            <p className="text-xs text-green-600 mt-1">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.warningsCount}</div>
            <p className="text-xs text-yellow-600 mt-1">Minor issues detected</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalIssuesCount}</div>
            <p className="text-xs text-red-600 mt-1">No critical issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health Scores</CardTitle>
            <CardDescription>Overall system quality metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">System Health</span>
                <span className="text-sm font-bold">{metrics.systemHealthScore}%</span>
              </div>
              <Progress value={metrics.systemHealthScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Security Score</span>
                <span className="text-sm font-bold">{metrics.securityScore}%</span>
              </div>
              <Progress value={metrics.securityScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Performance Score</span>
                <span className="text-sm font-bold">{metrics.performanceScore}%</span>
              </div>
              <Progress value={metrics.performanceScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm font-bold text-green-600">{metrics.uptime}%</span>
              </div>
              <Progress value={metrics.uptime} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Run quality assurance checks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => runQualityCheck('Security Audit')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Run Security Audit
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => runQualityCheck('Performance Test')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Run Performance Test
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => runQualityCheck('Database Check')}
            >
              <Database className="h-4 w-4 mr-2" />
              Database Integrity Check
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => runQualityCheck('System Health')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Full System Health Check
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quality Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2" />
            Recent Quality Checks
          </CardTitle>
          <CardDescription>
            History of recent quality assurance activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentChecks.map((check) => {
              const IconComponent = check.icon;
              return (
                <div key={check.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(check.status)}
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-muted-foreground">{check.description}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {check.timestamp}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quality Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Trends</CardTitle>
          <CardDescription>Quality metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">+5.2%</div>
              <div className="text-sm text-green-600">System Health (7 days)</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">-12%</div>
              <div className="text-sm text-blue-600">Warnings (7 days)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-purple-600">Uptime (30 days)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}