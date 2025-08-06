'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Server, HardDrive, Cpu, MemoryStick, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SystemPage() {
  const systemMetrics = [
    { name: 'Database Status', value: 'Online', status: 'healthy', icon: Database },
    { name: 'Server Load', value: '23%', status: 'healthy', icon: Server },
    { name: 'Memory Usage', value: '1.2GB/4GB', status: 'healthy', icon: MemoryStick },
    { name: 'CPU Usage', value: '15%', status: 'healthy', icon: Cpu },
    { name: 'Storage', value: '45GB/100GB', status: 'warning', icon: HardDrive },
    { name: 'Uptime', value: '15 days', status: 'healthy', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">System Management</h1>
          <p className="text-muted-foreground">Monitor and manage system resources and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {systemMetrics.map((metric) => {
            const Icon = metric.icon;
            const statusColor = metric.status === 'healthy' ? 'text-green-600' : 
                               metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600';
            const StatusIcon = metric.status === 'healthy' ? CheckCircle : AlertTriangle;
            
            return (
              <Card key={metric.name} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center">
                      <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                      <Badge variant={metric.status === 'healthy' ? 'default' : 'destructive'} className="ml-2">
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Actions</CardTitle>
              <CardDescription>Perform system maintenance operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Database className="h-4 w-4 mr-2" />
                Backup Database
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Server className="h-4 w-4 mr-2" />
                Restart Services
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HardDrive className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>System events and maintenance logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  Database backup completed successfully
                </div>
                <div className="flex items-center text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-600 mr-2" />
                  System health check passed
                </div>
                <div className="flex items-center text-muted-foreground">
                  <AlertTriangle className="h-3 w-3 text-yellow-600 mr-2" />
                  Storage usage above 40%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}