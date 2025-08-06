'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, BookOpen, TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const analytics = [
    { name: 'Total Users', value: '1,234', change: '+12%', trend: 'up', icon: Users },
    { name: 'Active Skills', value: '56', change: '+3%', trend: 'up', icon: BookOpen },
    { name: 'Completion Rate', value: '78%', change: '-2%', trend: 'down', icon: TrendingUp },
    { name: 'Daily Sessions', value: '892', change: '+8%', trend: 'up', icon: Activity },
  ];

  const skillsData = [
    { skill: 'IV Cannulation', completions: 45, passRate: 89 },
    { skill: 'CPR', completions: 67, passRate: 95 },
    { skill: 'Intubation', completions: 23, passRate: 76 },
    { skill: 'ECG Reading', completions: 38, passRate: 82 },
    { skill: 'Medication Admin', completions: 29, passRate: 91 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track performance metrics and usage statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {analytics.map((item) => {
            const Icon = item.icon;
            const TrendIcon = item.trend === 'up' ? TrendingUp : TrendingDown;
            const trendColor = item.trend === 'up' ? 'text-green-600' : 'text-red-600';
            
            return (
              <Card key={item.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendIcon className={`h-3 w-3 mr-1 ${trendColor}`} />
                    <span className={trendColor}>{item.change}</span>
                    <span className="ml-1">from last month</span>
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
                <BarChart3 className="h-5 w-5 mr-2" />
                Skills Performance
              </CardTitle>
              <CardDescription>Completion rates and pass rates by skill</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillsData.map((skill) => (
                  <div key={skill.skill} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{skill.skill}</div>
                      <div className="text-sm text-muted-foreground">
                        {skill.completions} completions
                      </div>
                    </div>
                    <Badge variant={skill.passRate >= 85 ? 'default' : 'secondary'}>
                      {skill.passRate}% pass rate
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>Platform activity over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Peak Usage Hours</span>
                  <span className="font-medium">2:00 PM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Most Active Day</span>
                  <span className="font-medium">Wednesday</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Session</span>
                  <span className="font-medium">24 minutes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bounce Rate</span>
                  <span className="font-medium">12%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}