'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCheck, Shield, GraduationCap, BookOpen, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  icon: any;
  color: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access and management',
      userCount: 3,
      permissions: ['user-management', 'system-settings', 'view-analytics', 'manage-content', 'manage-students', 'create-assessments', 'view-reports', 'export-data'],
      icon: Shield,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 2,
      name: 'Lecturer',
      description: 'Manage students and course content',
      userCount: 12,
      permissions: ['view-analytics', 'manage-content', 'manage-students', 'create-assessments', 'view-reports'],
      icon: GraduationCap,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 3,
      name: 'Student',
      description: 'Access learning materials and assessments',
      userCount: 145,
      permissions: ['view-content'],
      icon: BookOpen,
      color: 'bg-green-100 text-green-800'
    }
  ]);

  const [permissions] = useState<Permission[]>([
    { id: 'user-management', name: 'User Management', description: 'Create, edit, and delete users' },
    { id: 'system-settings', name: 'System Settings', description: 'Configure system settings' },
    { id: 'view-analytics', name: 'View Analytics', description: 'Access analytics and reports' },
    { id: 'manage-content', name: 'Manage Content', description: 'Create and edit learning content' },
    { id: 'manage-students', name: 'Manage Students', description: 'Oversee student progress and enrollment' },
    { id: 'create-assessments', name: 'Create Assessments', description: 'Design and manage assessments' },
    { id: 'view-reports', name: 'View Reports', description: 'Access detailed reports' },
    { id: 'export-data', name: 'Export Data', description: 'Export system data' },
    { id: 'view-content', name: 'View Content', description: 'Access learning materials' }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    icon: BookOpen,
    color: 'bg-green-100 text-green-800'
  });

  const iconOptions = [
    { value: Shield, label: 'Shield', component: Shield },
    { value: GraduationCap, label: 'Graduation Cap', component: GraduationCap },
    { value: BookOpen, label: 'Book', component: BookOpen },
    { value: UserCheck, label: 'User Check', component: UserCheck }
  ];

  const colorOptions = [
    { value: 'bg-red-100 text-red-800', label: 'Red' },
    { value: 'bg-blue-100 text-blue-800', label: 'Blue' },
    { value: 'bg-green-100 text-green-800', label: 'Green' },
    { value: 'bg-purple-100 text-purple-800', label: 'Purple' },
    { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow' }
  ];

  const handleCreateRole = () => {
    if (!newRole.name.trim()) return;
    
    const role: Role = {
      id: Date.now(),
      name: newRole.name,
      description: newRole.description,
      userCount: 0,
      permissions: newRole.permissions,
      icon: newRole.icon,
      color: newRole.color
    };
    
    setRoles([...roles, role]);
    setNewRole({
      name: '',
      description: '',
      permissions: [],
      icon: BookOpen,
      color: 'bg-green-100 text-green-800'
    });
    setIsCreateModalOpen(false);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsEditModalOpen(true);
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;
    
    setRoles(roles.map(role => 
      role.id === editingRole.id ? editingRole : role
    ));
    setEditingRole(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteRole = (roleId: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(role => role.id !== roleId));
    }
  };

  const togglePermission = (roleId: number, permissionId: string) => {
    setRoles(roles.map(role => {
      if (role.id === roleId) {
        const hasPermission = role.permissions.includes(permissionId);
        return {
          ...role,
          permissions: hasPermission 
            ? role.permissions.filter(p => p !== permissionId)
            : [...role.permissions, permissionId]
        };
      }
      return role;
    }));
  };

  const hasPermission = (roleId: number, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.permissions.includes(permissionId) || false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Role Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
                <DialogDescription>Define a new role with specific permissions</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    placeholder="Enter role name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-description">Description</Label>
                  <Textarea
                    id="role-description"
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    placeholder="Describe the role"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`new-${permission.id}`}
                          checked={newRole.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewRole({
                                ...newRole,
                                permissions: [...newRole.permissions, permission.id]
                              });
                            } else {
                              setNewRole({
                                ...newRole,
                                permissions: newRole.permissions.filter(p => p !== permission.id)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`new-${permission.id}`} className="text-sm">
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>Create Role</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${role.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <Badge variant="secondary">{role.userCount} users</Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.userCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Permissions:</div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permissionId) => {
                        const permission = permissions.find(p => p.id === permissionId);
                        return (
                          <Badge key={permissionId} variant="outline" className="text-xs">
                            {permission?.name || permissionId}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Role Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>Modify role details and permissions</DialogDescription>
            </DialogHeader>
            {editingRole && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role-name">Role Name</Label>
                  <Input
                    id="edit-role-name"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({...editingRole, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role-description">Description</Label>
                  <Textarea
                    id="edit-role-description"
                    value={editingRole.description}
                    onChange={(e) => setEditingRole({...editingRole, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${permission.id}`}
                          checked={editingRole.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditingRole({
                                ...editingRole,
                                permissions: [...editingRole.permissions, permission.id]
                              });
                            } else {
                              setEditingRole({
                                ...editingRole,
                                permissions: editingRole.permissions.filter(p => p !== permission.id)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole}>Update Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="h-5 w-5 mr-2" />
                Interactive Permission Matrix
              </CardTitle>
              <CardDescription>Click to toggle permissions for each role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Permission</TableHead>
                      {roles.map((role) => (
                        <TableHead key={role.id} className="text-center min-w-[120px]">
                          <div className="flex items-center justify-center space-x-1">
                            <role.icon className="h-4 w-4" />
                            <span>{role.name}</span>
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{permission.name}</div>
                            <div className="text-xs text-muted-foreground">{permission.description}</div>
                          </div>
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center">
                            <Switch
                              checked={hasPermission(role.id, permission.id)}
                              onCheckedChange={() => togglePermission(role.id, permission.id)}
                              className="mx-auto"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Role Changes</CardTitle>
              <CardDescription>Track role modifications and assignments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="font-medium">John Smith promoted to Lecturer</div>
                    <div className="text-sm text-muted-foreground">2 hours ago</div>
                  </div>
                  <Badge>Promoted</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="font-medium">New Student role created</div>
                    <div className="text-sm text-muted-foreground">1 day ago</div>
                  </div>
                  <Badge variant="secondary">Created</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="font-medium">Lecturer permissions updated</div>
                    <div className="text-sm text-muted-foreground">3 days ago</div>
                  </div>
                  <Badge variant="outline">Modified</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}