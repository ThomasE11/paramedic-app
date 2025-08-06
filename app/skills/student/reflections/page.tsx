
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Star, Calendar, BookOpen, Eye, EyeOff, Clock } from 'lucide-react';
import { ReflectionNote } from '@/lib/types';

export default function StudentReflections() {
  const [reflections, setReflections] = useState<ReflectionNote[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReflections();
  }, []);

  const fetchReflections = async () => {
    try {
      const response = await fetch('/api/reflections');
      const data = await response.json();
      // Handle both direct array and paginated response formats
      setReflections(data.reflections || data);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReflections = reflections.filter(reflection => {
    if (selectedSkill !== 'all' && reflection.skill?.name !== selectedSkill) {
      return false;
    }
    if (selectedRating !== 'all' && (reflection.rating || 0) !== parseInt(selectedRating)) {
      return false;
    }
    return true;
  });

  const uniqueSkills = Array.from(new Set(reflections.map(r => r.skill?.name).filter(Boolean)));

  const getRatingColor = (rating: number) => {
    const safeRating = rating || 0;
    if (safeRating >= 4) return 'text-green-600 dark:text-green-400';
    if (safeRating >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm p-6 border border-border/50">
        <h1 className="text-3xl font-bold text-foreground">My Reflections</h1>
        <p className="text-muted-foreground mt-2">
          Review your learning reflections and track your thoughts on skill development
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reflections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Skill
              </label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="All Skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  {uniqueSkills.map(skill => (
                    <SelectItem key={skill} value={skill!}>
                      {skill}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Rating
              </label>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger>
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedSkill('all');
                  setSelectedRating('all');
                }}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reflections List */}
      <div className="space-y-4">
        {filteredReflections.map((reflection) => (
          <Card key={reflection.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: reflection.skill?.category?.colorCode || '#6b7280' }}
                  />
                  <div>
                    <CardTitle className="text-lg">{reflection.skill?.name || 'Unknown Skill'}</CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(reflection.createdAt)}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center ${getRatingColor(reflection.rating || 0)}`}>
                    {[...Array(Math.max(0, Math.min(5, reflection.rating || 0)))].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    {[...Array(Math.max(0, 5 - Math.max(0, Math.min(5, reflection.rating || 0))))].map((_, i) => (
                      <Star key={i + (reflection.rating || 0)} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                    ))}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    {reflection.isPrivate ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span>{reflection.isPrivate ? 'Private' : 'Shared'}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Overall Reflection</h4>
                  <p className="text-muted-foreground">{reflection.content || 'No reflection content provided'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">What went well</h4>
                    <p className="text-sm text-muted-foreground">{reflection.whatWentWell || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-700 dark:text-orange-400 mb-1">Areas for improvement</h4>
                    <p className="text-sm text-muted-foreground">{reflection.whatToimprove || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">Future goals</h4>
                    <p className="text-sm text-muted-foreground">{reflection.futureGoals || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Rating: {reflection.rating || 0}/5</span>
                    <span>•</span>
                    <span>
                      {reflection.isPrivate ? 'Private reflection' : 'Shared with instructors'}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {reflection.skill?.category?.name || 'Unknown Category'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReflections.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No reflections found</h3>
            <p className="text-muted-foreground text-center">
              {reflections.length === 0 
                ? "You haven't written any reflections yet. Complete some skills to start reflecting on your learning!"
                : "No reflections match your current filters. Try adjusting your criteria."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
