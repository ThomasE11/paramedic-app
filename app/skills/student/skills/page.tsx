
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Star, AlertCircle, CheckCircle, Play, Eye } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CategoryWithSkills, SkillWithProgress, SubjectWithSkills, SkillWithSubjects } from '@/lib/types';

export default function StudentSkills() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [subjects, setSubjects] = useState<SubjectWithSkills[]>([]);
  const [allSkills, setAllSkills] = useState<SkillWithSubjects[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<SkillWithSubjects[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Check if user is lecturer in student view mode
  const isLecturerInStudentView = session?.user?.role === 'LECTURER' && session?.user?.viewMode === 'student';
  const isAdmin = session?.user?.role === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  // Set initial category filter from URL parameters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  useEffect(() => {
    filterSkills();
  }, [allSkills, searchTerm, selectedSubject, selectedCategory, selectedDifficulty, selectedStatus]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/student/enrolled-skills');
      const data = await response.json();
      setSubjects(data.subjects || []);
      setAllSkills(data.skills || []);
    } catch (error) {
      console.error('Error fetching enrolled skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = [...allSkills];

    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(skill => 
        skill.subjects?.some(subjectSkill => 
          subjectSkill.subjectId === parseInt(selectedSubject)
        )
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => {
        // Handle both string and number category IDs
        const skillCategoryId = skill.categoryId?.toString();
        const selectedCategoryId = selectedCategory.toString();
        return skillCategoryId === selectedCategoryId;
      });
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(skill => skill.difficultyLevel === selectedDifficulty);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(skill => {
        const status = skill.progress?.status || 'NOT_STARTED';
        return status === selectedStatus;
      });
    }

    setFilteredSkills(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'MASTERED':
        return <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'MASTERED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {isLecturerInStudentView || isAdmin ? 'All Available Skills' : 'My Enrolled Skills'}
                </h1>
                {isLecturerInStudentView && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Lecturer View
                  </Badge>
                )}
                {isAdmin && (
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Admin View
                  </Badge>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
                {isLecturerInStudentView || isAdmin 
                  ? `Browse all paramedic skills in the system (${subjects.length} categories, ${allSkills.length} skills)`
                  : `Practice paramedic skills from your enrolled subjects (${subjects.length} subjects, ${allSkills.length} skills)`
                }
              </p>
              {subjects.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {subjects.map(subject => (
                    <Badge key={subject.id} className="bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm px-4 py-2 text-sm font-medium">
                      {subject.code}: {subject.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6">
              Filter Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-4 w-4 text-slate-500 dark:text-slate-400" />
                <Input
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id.toString()}>
                    {subject.code} - {subject.level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {/* Extract unique categories from all skills */}
                {Array.from(new Set(allSkills.map(skill => skill.category).filter(Boolean)))
                  .map(category => (
                    <SelectItem key={category!.id} value={category!.id}>
                      {category!.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl">
                  <SelectValue placeholder="All Difficulties" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="MASTERED">Mastered</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map(skill => {
          const status = skill.progress?.status || 'NOT_STARTED';
          const progressPercentage = skill.progress?.completedSteps?.length 
            ? (skill.progress.completedSteps.length / (skill.steps?.length || 1)) * 100 
            : 0;

            return (
              <div key={skill.id} className="group relative">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-800/50 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <Badge className={`${getStatusColor(status)} backdrop-blur-sm`}>
                          {status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getDifficultyColor(skill.difficultyLevel)} backdrop-blur-sm`}>
                          {skill.difficultyLevel}
                        </Badge>
                        {skill.isCritical && (
                          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 backdrop-blur-sm">Critical</Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{skill.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {skill.description}
                    </p>
                    <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: skill.category?.colorCode }}
                      />
                      {skill.category?.name}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {skill.estimatedTimeMinutes}m
                    </div>
                  </div>
                  
                  {/* Subject information */}
                  {skill.subjects && skill.subjects.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Subjects:</div>
                      <div className="flex flex-wrap gap-1">
                        {skill.subjects.map(subjectSkill => (
                          <Badge key={subjectSkill.id} variant="secondary" className="text-xs">
                            {subjectSkill.subject?.code}
                            {subjectSkill.isCore && <span className="ml-1">⭐</span>}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {skill.progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      {skill.progress.attempts > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {skill.progress.attempts} attempt{skill.progress.attempts !== 1 ? 's' : ''} • 
                          {skill.progress.timeSpentMinutes}m practiced
                        </div>
                      )}
                    </div>
                  )}
                  
                      <Link href={`/skills/student/skills/${skill.id}`}>
                        <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
                          {isLecturerInStudentView || isAdmin ? 'View Skill' : (status === 'NOT_STARTED' ? 'Start Practice' : 'Continue Practice')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSkills.length === 0 && (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-12 shadow-2xl text-center">
            <AlertCircle className="h-16 w-16 text-slate-400 dark:text-slate-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No skills found</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto">
              Try adjusting your filters or search terms to find the skills you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
