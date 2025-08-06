'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Filter, Eye, Edit, Plus, BarChart3, AlertTriangle } from 'lucide-react';

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      console.log('🔄 Fetching skills from API...');
      const response = await fetch('/api/admin/skills', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('✅ Skills data received:', data.length);
      setSkills(data);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching skills:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSkill = (skillId: string) => {
    alert(`View skill ${skillId} details would be implemented here.`);
  };

  const handleEditSkill = (skillId: string) => {
    alert(`Edit skill ${skillId} functionality would be implemented here.`);
  };

  const handleAddSkill = () => {
    alert('Add new skill functionality would be implemented here.');
  };

  const filteredSkills = skills.filter((skill: any) => {
    const skillName = skill.name || skill.title || '';
    const skillDescription = skill.description || '';
    const matchesSearch = skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skillDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const skillCategory = skill.category?.name || skill.category || '';
    const matchesCategory = !selectedCategory || skillCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(skills.map((skill: any) => skill.category?.name || skill.category))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Skills Management</h1>
            <p className="text-muted-foreground mt-1">Error loading skills data</p>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-lg font-semibold">Error Loading Skills</h2>
            </div>
            <p className="text-red-500 mb-4">{error}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Troubleshooting:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Make sure you're logged in as an admin user</li>
                <li>Check browser console for detailed error messages</li>
                <li>Verify skills data files exist in /data directory</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
            <Button onClick={fetchSkills} className="mt-4">
              Retry Loading Skills
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Skills Management</h1>
          <p className="text-muted-foreground mt-1">
            Complete overview of all skills in the system ({skills.length} total)
          </p>
        </div>
        <Button onClick={handleAddSkill} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add New Skill
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{skills.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Steps</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {skills.length > 0 ? Math.round(skills.reduce((sum: number, skill: any) => sum + (skill.steps?.length || 0), 0) / skills.length) : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Skills</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{skills.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill: any) => (
          <Card key={skill.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">{skill.name || skill.title || 'Unnamed Skill'}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {skill.category?.name || skill.category || 'Uncategorized'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm text-muted-foreground">
                {skill.description && skill.description.length > 100 
                  ? skill.description.substring(0, 100) + '...' 
                  : skill.description || 'No description available'}
              </CardDescription>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Steps: {skill.steps?.length || 0}</span>
                <span>ID: {skill.id}</span>
              </div>

              {skill.objectives && skill.objectives.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Objectives:</div>
                  <div className="text-xs text-muted-foreground">
                    {skill.objectives.join(', ').length > 80 
                      ? skill.objectives.join(', ').substring(0, 80) + '...'
                      : skill.objectives.join(', ')}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleViewSkill(skill.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEditSkill(skill.id)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSkills.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No skills found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory 
                ? "Try adjusting your search or filter criteria." 
                : "No skills are currently available in the system."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}