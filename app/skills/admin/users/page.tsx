'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Shield, 
  BookOpen, 
  Mail, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  studentId?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    // Mock data since database is offline
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@doe.com',
        role: 'ADMIN',
        status: 'active',
        lastLogin: '2024-01-15'
      },
      {
        id: '2',
        name: 'Lecturer Test',
        email: 'lecturer@test.com',
        role: 'LECTURER',
        status: 'active',
        lastLogin: '2024-01-14'
      },
      {
        id: '3',
        name: 'Student Test',
        email: 'student@test.com',
        role: 'STUDENT',
        studentId: 'ST001',
        status: 'active',
        lastLogin: '2024-01-13'
      },
      {
        id: '4',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        role: 'LECTURER',
        status: 'active',
        lastLogin: '2024-01-12'
      },
      {
        id: '5',
        name: 'Mike Wilson',
        email: 'mike.wilson@student.com',
        role: 'STUDENT',
        studentId: 'ST002',
        status: 'active',
        lastLogin: '2024-01-11'
      }
    ];
    setUsers(mockUsers);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'LECTURER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'STUDENT': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <Shield className="h-3 w-3" />;
      case 'LECTURER': return <Users className="h-3 w-3" />;
      case 'STUDENT': return <BookOpen className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  const roleStats = {
    total: users.length,
    admin: users.filter(u => u.role === 'ADMIN').length,
    lecturer: users.filter(u => u.role === 'LECTURER').length,
    student: users.filter(u => u.role === 'STUDENT').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-3xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  User Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
                  Manage all users in the system
                </p>
              </div>
              <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0 rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                <UserPlus className="h-5 w-5 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</h3>
              <Users className="h-5 w-5 text-slate-500" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{roleStats.total}</div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Administrators</h3>
              <Shield className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{roleStats.admin}</div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Lecturers</h3>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{roleStats.lecturer}</div>
          </div>
          
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Students</h3>
              <BookOpen className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{roleStats.student}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">
              Filter Users
            </h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-3 h-12 border rounded-xl bg-white/80 dark:bg-slate-800/80 border-white/30 dark:border-slate-700/30 backdrop-blur-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500/20 transition-all"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="LECTURER">Lecturer</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
          <div className="relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Users ({filteredUsers.length})</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Showing {filteredUsers.length} of {users.length} users
              </p>
            </div>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-6 bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/20 rounded-2xl backdrop-blur-sm hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-300 hover:scale-[1.01]">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-500 text-white text-lg font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{user.name}</h3>
                        <Badge className={`${getRoleColor(user.role)} backdrop-blur-sm border`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                        {user.studentId && (
                          <div>ID: {user.studentId}</div>
                        )}
                        {user.lastLogin && (
                          <div>Last login: {user.lastLogin}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300'} backdrop-blur-sm border px-3 py-1`}>
                      {user.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/20">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}