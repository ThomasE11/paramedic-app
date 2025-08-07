'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  CheckCircle, 
  MessageSquare, 
  Star,
  Trophy,
  Target
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Skill {
  id: string;
  name: string;
  description: string;
  category: {
    name: string;
    colorCode: string;
  };
  steps: any[];
}

export default function SkillReflection() {
  const params = useParams();
  const router = useRouter();
  const skillId = params.id as string;
  
  const [skill, setSkill] = useState<Skill | null>(null);
  const [reflection, setReflection] = useState('');
  const [selfRating, setSelfRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSkill();
  }, [skillId]);

  const fetchSkill = async () => {
    try {
      const response = await fetch(`/api/skills/${skillId}`);
      const data = await response.json();
      setSkill(data);
    } catch (error) {
      console.error('Error fetching skill:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReflection = async () => {
    // Enhanced validation
    if (!reflection.trim()) {
      toast({
        title: 'Reflection Required',
        description: 'Please write a reflection before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (reflection.trim().length < 10) {
      toast({
        title: 'Reflection Too Short',
        description: 'Please write at least 10 characters for a meaningful reflection.',
        variant: 'destructive',
      });
      return;
    }

    if (selfRating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please rate your performance before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (selfRating < 1 || selfRating > 5) {
      toast({
        title: 'Invalid Rating',
        description: 'Please select a rating between 1 and 5.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      // Submit reflection with proper field mapping
      const reflectionResponse = await fetch('/api/reflections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          content: reflection.trim(), // Map reflection to content
          rating: selfRating, // Map selfRating to rating
          whatWentWell: '', // Default empty for simple form
          whatToimprove: '', // Default empty for simple form
          futureGoals: '', // Default empty for simple form
          isPrivate: false, // Default to public
        }),
      });

      if (!reflectionResponse.ok) {
        const errorData = await reflectionResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${reflectionResponse.status}: ${reflectionResponse.statusText}`);
      }

      // Mark reflection as completed in the attempt
      await fetch('/api/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId,
          action: 'REFLECTION_COMPLETE',
        }),
      });

      toast({
        title: 'Reflection Submitted!',
        description: 'Your reflection has been saved successfully.',
      });

      // Redirect back to skill overview
      router.push(`/skills/student/skills/${skillId}`);
    } catch (error) {
      console.error('Error submitting reflection:', error);
      
      // Enhanced error handling with specific messages
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      toast({
        title: 'Submission Failed',
        description: `Failed to submit reflection: ${errorMessage}. Please check your connection and try again.`,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Skill not found</h2>
        <p className="text-gray-600">The skill you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl" />
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => router.push(`/skills/student/skills/${skillId}`)}
                className="mb-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Skill
              </Button>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                  <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Skill Reflection
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    {skill.name}
                  </p>
                </div>
              </div>
              
              <Badge 
                className="text-white border-0 px-4 py-2 font-medium"
                style={{ backgroundColor: skill.category.colorCode }}
              >
                {skill.category.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reflection Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl">
              <CardHeader className="border-b border-white/20 dark:border-slate-800/50">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-blue-500" />
                  Practice Reflection
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400">
                  Reflect on your practice session and rate your performance
                </p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Self Rating */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-slate-900 dark:text-white">
                    How would you rate your performance? *
                  </Label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelfRating(rating)}
                        className={`p-3 rounded-xl transition-all duration-200 ${
                          selfRating >= rating
                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                            : 'bg-white/60 dark:bg-slate-800/60 text-slate-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                        }`}
                      >
                        <Star 
                          className={`h-6 w-6 ${
                            selfRating >= rating ? 'fill-current' : ''
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {selfRating === 0 && 'Select a rating'}
                    {selfRating === 1 && 'Needs significant improvement'}
                    {selfRating === 2 && 'Below expectations'}
                    {selfRating === 3 && 'Meets expectations'}
                    {selfRating === 4 && 'Above expectations'}
                    {selfRating === 5 && 'Excellent performance'}
                  </div>
                </div>

                {/* Reflection Text */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-slate-900 dark:text-white">
                    Practice Reflection *
                  </Label>
                  <Textarea
                    placeholder="Reflect on your practice session. What went well? What could you improve? What did you learn?"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="min-h-[150px] bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  />
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {reflection.length} characters
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    onClick={submitReflection}
                    disabled={submitting || !reflection.trim() || selfRating === 0}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0 rounded-xl py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Reflection'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Completion Summary */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Practice Complete!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ✓
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Skill Practiced</div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Skill</span>
                      <span className="font-medium">{skill.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total steps</span>
                      <span className="font-medium">{skill.steps?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-500" />
                  Reflection Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>What steps did you find most challenging?</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>How confident do you feel with this skill?</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>What would you do differently next time?</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0" />
                    <span>How does this skill relate to patient care?</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}