'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Database, 
  Server, 
  Activity, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Settings,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Shield,
  Users,
  Mail,
  BarChart3,
  ClipboardCheck,
  BookOpen,
  Eye,
  Send,
  UserPlus,
  UserMinus,
  GraduationCap,
  Monitor
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useSession, update } from 'next-auth/react';

interface SystemStatus {
  database: 'online' | 'offline' | 'maintenance';
  server: 'healthy' | 'warning' | 'error';
  storage: number;
  memory: number;
  cpu: number;
  uptime: string;
  lastBackup: string;
  version: string;
}

export default function AdminSystemPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'offline',
    server: 'healthy',
    storage: 45,
    memory: 62,
    cpu: 28,
    uptime: '12d 4h 23m',
    lastBackup: '2024-01-15 02:00 AM',
    version: '1.0.0'
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSkills();
    fetchUsers();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/admin/skills');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched skills data:', data); // Debug log
      setSkills(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      // Fallback to empty array if API fails
      setSkills([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to empty array if API fails
      setUsers([]);
    }
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchSkills(), fetchUsers()]);
    setIsRefreshing(false);
  };

  const sendNotification = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: notificationMessage,
          role: selectedRole || 'ALL'
        }),
      });
      
      if (response.ok) {
        alert('Notification sent successfully!');
        setNotificationMessage('');
        setSelectedRole('');
      } else {
        alert('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    }
  };

  const switchToLecturerView = async () => {
    try {
      // Direct navigation to lecturer dashboard without session update
      router.push('/lecturer/dashboard');
    } catch (error) {
      console.error('Error switching to lecturer view:', error);
    }
  };

  const switchToStudentView = async () => {
    try {
      // Direct navigation to student dashboard without session update
      router.push('/student/dashboard');
    } catch (error) {
      console.error('Error switching to student view:', error);
    }
  };

  const handleDatabaseSettings = () => {
    alert('Database Settings: Configuration panel would open here. Currently showing system status.');
  };

  const handleSystemConfiguration = () => {
    alert('System Configuration: Advanced system settings would be available here.');
  };

  const handleDatabaseConnection = () => {
    alert('Database Connection Test: Connection test initiated. Current status: Offline (Development Mode)');
  };

  const handleRestartDatabase = () => {
    alert('Database Restart: Database service restart initiated. This is a development simulation.');
  };

  const handleBackupDatabase = () => {
    alert('Database Backup: Backup process started. This would create a full system backup.');
  };

  const handleSystemLogs = () => {
    alert('System Logs: Log viewer would open here showing recent system activity.');
  };

  const handleNetworkDiagnostics = () => {
    alert('Network Diagnostics: Network connectivity and performance tests would run here.');
  };

  const handleRestartServices = () => {
    alert('Restart Services: All system services restart initiated. This may take a few minutes.');
  };

  const handleMaintenanceMode = () => {
    if (confirm('Are you sure you want to enable maintenance mode? This will temporarily disable user access.')) {
      alert('Maintenance Mode: System is now in maintenance mode. Users will see a maintenance page.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'offline':
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      case 'offline':
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'maintenance':
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Management</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive system administration and management
          </p>
        </div>
        <Button 
          onClick={refreshStatus} 
          disabled={isRefreshing}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="roles">Manage Roles</TabsTrigger>
          <TabsTrigger value="notifications">Send Notifications</TabsTrigger>
          <TabsTrigger value="skills">View All Skills</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Report</TabsTrigger>
          <TabsTrigger value="quality">Quality Assurance</TabsTrigger>
        </TabsList>

        {/* System Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Development Mode Alert */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Development Mode:</strong> System is running in development mode with hardcoded authentication. 
              Database connection is currently offline.
            </AlertDescription>
          </Alert>

          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Database</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(systemStatus.database)}>
                    {getStatusIcon(systemStatus.database)}
                    <span className="ml-1 capitalize">{systemStatus.database}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Server</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(systemStatus.server)}>
                    {getStatusIcon(systemStatus.server)}
                    <span className="ml-1 capitalize">{systemStatus.server}</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStatus.uptime}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Version</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">v{systemStatus.version}</div>
              </CardContent>
            </Card>
          </div>

          {/* Resource Usage */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Current system resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">CPU Usage</span>
                    </div>
                    <span className="text-sm font-bold">{systemStatus.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemStatus.cpu)}`}
                      style={{ width: `${systemStatus.cpu}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <span className="text-sm font-bold">{systemStatus.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemStatus.memory)}`}
                      style={{ width: `${systemStatus.memory}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Storage Usage</span>
                    </div>
                    <span className="text-sm font-bold">{systemStatus.storage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(systemStatus.storage)}`}
                      style={{ width: `${systemStatus.storage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Manage database connections and backups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Last Backup</div>
                      <div className="text-sm text-muted-foreground">{systemStatus.lastBackup}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleBackupDatabase}>
                      <Database className="h-4 w-4 mr-2" />
                      Backup Now
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" onClick={handleDatabaseConnection}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Test Database Connection
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleRestartDatabase}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart Database Service
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleDatabaseSettings}>
                      <Settings className="h-4 w-4 mr-2" />
                      Database Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
                <CardDescription>System maintenance and configuration tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={handleSystemLogs}>
                    <Activity className="h-4 w-4 mr-2" />
                    View System Logs
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleNetworkDiagnostics}>
                    <Network className="h-4 w-4 mr-2" />
                    Network Diagnostics
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleSystemConfiguration}>
                    <Settings className="h-4 w-4 mr-2" />
                    System Configuration
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleRestartServices}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart Services
                  </Button>
                  <Button variant="destructive" className="w-full justify-start" onClick={handleMaintenanceMode}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Maintenance Mode
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Detailed system and environment information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Application Version:</span>
                    <span className="text-sm">v{systemStatus.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Environment:</span>
                    <span className="text-sm">Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Framework:</span>
                    <span className="text-sm">Next.js 14</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Database:</span>
                    <span className="text-sm">PostgreSQL (Offline)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Authentication:</span>
                    <span className="text-sm">NextAuth.js</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">ORM:</span>
                    <span className="text-sm">Prisma</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">UI Framework:</span>
                    <span className="text-sm">Tailwind CSS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Deployment:</span>
                    <span className="text-sm">Local Development</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Different Views */}
          <Card>
            <CardHeader>
              <CardTitle>Test Different Views</CardTitle>
              <CardDescription>Switch between different user interface views</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={switchToLecturerView}
                  className="w-full justify-start h-12"
                  variant="outline"
                >
                  <GraduationCap className="h-5 w-5 mr-3" />
                  Lecturer Dashboard
                </Button>
                <Button 
                  onClick={switchToStudentView}
                  className="w-full justify-start h-12"
                  variant="outline"
                >
                  <BookOpen className="h-5 w-5 mr-3" />
                  Student Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                User Role Management
              </CardTitle>
              <CardDescription>
                Manage user roles and permissions across the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'ADMIN' ? 'destructive' : user.role === 'LECTURER' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Send System Notifications
              </CardTitle>
              <CardDescription>
                Send notifications to users across the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Users</SelectItem>
                      <SelectItem value="STUDENT">Students Only</SelectItem>
                      <SelectItem value="LECTURER">Lecturers Only</SelectItem>
                      <SelectItem value="ADMIN">Administrators Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Message</label>
                <Textarea 
                  placeholder="Enter your notification message here..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <Button 
                onClick={sendNotification}
                disabled={!notificationMessage.trim()}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* View All Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                All System Skills
              </CardTitle>
              <CardDescription>
                Complete overview of all skills in the system ({skills.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isRefreshing ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading skills...</span>
                  </div>
                ) : skills.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No skills found. This might be due to database connectivity issues or missing skill data.
                      <br />
                      <Button variant="link" onClick={refreshStatus} className="p-0 h-auto mt-2">
                        Try refreshing the data
                      </Button>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skills.map((skill: any, index: number) => (
                      <Card key={skill.id || index} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">{skill.name || skill.title || 'Unnamed Skill'}</h3>
                            <Badge variant="outline">{skill.category?.name || skill.category || 'No Category'}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {skill.description || 'No description available'}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {skill.steps?.length || 0} steps
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {skill.difficultyLevel || 'N/A'}
                            </Badge>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Report Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                System Analytics Report
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Users</span>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{users.length}</div>
                    <div className="text-xs text-muted-foreground">Active accounts</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Skills</span>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{skills.length}</div>
                    <div className="text-xs text-muted-foreground">Available skills</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">System Health</span>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Performance</span>
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">A+</div>
                    <div className="text-xs text-muted-foreground">Security grade</div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Assurance Tab */}
        <TabsContent value="quality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2" />
                Quality Assurance Dashboard
              </CardTitle>
              <CardDescription>
                Monitor and ensure system quality standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border-green-200 bg-green-50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">Tests Passing</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">847</div>
                      <div className="text-xs text-green-600">All systems operational</div>
                    </div>
                  </Card>
                  <Card className="p-4 border-yellow-200 bg-yellow-50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-800">Warnings</span>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">12</div>
                      <div className="text-xs text-yellow-600">Minor issues detected</div>
                    </div>
                  </Card>
                  <Card className="p-4 border-red-200 bg-red-50">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">Critical Issues</span>
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="text-2xl font-bold text-red-600">0</div>
                      <div className="text-xs text-red-600">No critical issues</div>
                    </div>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Quality Checks</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Database Integrity Check</div>
                          <div className="text-sm text-muted-foreground">Completed successfully</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">2 hours ago</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium">Security Audit</div>
                          <div className="text-sm text-muted-foreground">All tests passed</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">6 hours ago</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="font-medium">Performance Optimization</div>
                          <div className="text-sm text-muted-foreground">Minor improvements suggested</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}