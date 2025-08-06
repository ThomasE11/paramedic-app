
export type Role = 'STUDENT' | 'LECTURER' | 'ADMIN';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';
export type NotificationType = 'FEEDBACK' | 'PROGRESS_UPDATE' | 'SYSTEM_MESSAGE' | 'REMINDER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  studentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  colorCode: string;
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: number;
  name: string;
  categoryId: number;
  difficultyLevel: DifficultyLevel;
  description: string;
  prerequisites: string[];
  estimatedTimeMinutes: number;
  isCritical: boolean;
  objectives: string[];
  indications: string[];
  contraindications: string[];
  equipment: any[];
  commonErrors: string[];
  documentationReqs: string[];
  minimumPracticeCount: number;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
  steps?: SkillStep[];
  assessmentCriteria?: AssessmentCriteria[];
  progress?: StudentProgress[];
}

export interface SkillStep {
  id: number;
  skillId: number;
  stepNumber: number;
  title: string;
  description: string;
  keyPoints: string[];
  isCritical: boolean;
  timeEstimate: number;
}

export interface AssessmentCriteria {
  id: number;
  skillId: number;
  criteriaName: string;
  description: string;
  weight: number;
  isMandatory: boolean;
  evaluationPoints: string[];
}

export interface StudentProgress {
  id: string;
  userId: string;
  skillId: number;
  status: ProgressStatus;
  attempts: number;
  completedSteps: number[];
  timeSpentMinutes: number;
  lastAttemptDate?: Date;
  completionDate?: Date;
  selfAssessmentScore?: number;
  instructorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  skill?: Skill;
}

export interface QuizQuestion {
  id: number;
  skillId: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: DifficultyLevel;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  questionId: number;
  skillId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  attemptDate: Date;
}

export interface ReflectionNote {
  id: string;
  userId: string;
  skillId: number;
  content: string;
  rating: number;
  whatWentWell: string;
  whatToimprove: string;
  futureGoals: string;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  skill?: Skill;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedSkillId?: number;
  createdAt: Date;
}

export interface SkillWithProgress extends Omit<Skill, 'progress'> {
  progress?: StudentProgress;
}

export interface CategoryWithSkills extends Category {
  skills: SkillWithProgress[];
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ProgressStats {
  totalSkills: number;
  completedSkills: number;
  masteredSkills: number;
  inProgressSkills: number;
  totalTimeSpent: number;
  averageScore: number;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  level: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSubject {
  id: string;
  userId: string;
  subjectId: number;
  enrolledAt: Date;
  isActive: boolean;
  user?: User;
  subject?: Subject;
}

export interface SubjectSkill {
  id: string;
  subjectId: number;
  skillId: number;
  isCore: boolean;
  subject?: Subject;
  skill?: Skill;
}

export interface SkillWithSubjects extends SkillWithProgress {
  subjects?: SubjectSkill[];
}

export interface SubjectWithSkills extends Subject {
  skills: SubjectSkill[];
  skillCount?: number;
}

export interface UserEnrollment extends UserSubject {
  subject: SubjectWithSkills;
}

export type VideoAnalysisStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface VideoAnalysisSession {
  id: string;
  userId: string;
  skillId: number;
  videoPath: string;
  videoDuration: number;
  status: VideoAnalysisStatus;
  createdAt: Date;
  updatedAt: Date;
  analysisResults?: VideoAnalysisResult[];
  user?: User;
  skill?: Skill;
}

export interface VideoAnalysisResult {
  id: string;
  sessionId: string;
  overallScore: number;
  techniqueScore: number;
  sequenceScore: number;
  timingScore: number;
  communicationScore: number;
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  specificRecommendations: string[];
  stepAnalysis: any; // JSON object containing step-by-step analysis
  audioTranscription?: string;
  detectedSteps: number[];
  missedSteps: number[];
  incorrectSteps: number[];
  timestampAnalysis?: TimestampAnalysis;
  educationalRecommendations?: string[];
  createdAt: Date;
  session?: VideoAnalysisSession;
}

export interface VideoAnalysisRequest {
  skillId: number;
  videoBlob: Blob;
  videoDuration: number;
}

export interface VideoAnalysisResponse {
  sessionId: string;
  status: VideoAnalysisStatus;
  message: string;
}

export interface StepAnalysis {
  stepNumber: number;
  detected: boolean;
  accuracy: number;
  timing: number;
  feedback: string;
  criticalErrors: string[];
  suggestions: string[];
  timestampMoments?: string[];
}

export interface TimestampMoment {
  time: string;
  description: string;
  skill: string;
  suggestion?: string;
}

export interface TimestampAnalysis {
  excellentMoments: TimestampMoment[];
  improvementMoments: TimestampMoment[];
}
