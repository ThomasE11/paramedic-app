// AI Memory System for Educational Assistant
// Manages user preferences, context, and learning patterns

export interface UserMemory {
  userId: string;
  preferences: {
    preferredMode: string;
    preferredDifficulty: string;
    favoriteSpecialties: string[];
    commonModules: string[];
    teachingStyle: string;
  };
  context: {
    institution: string;
    role: string;
    currentModules: string[];
    studentCount: number;
    recentTopics: string[];
  };
  patterns: {
    frequentRequests: string[];
    successfulFormats: string[];
    preferredCaseTypes: string[];
    feedbackHistory: Array<{
      request: string;
      rating: number;
      feedback: string;
      timestamp: Date;
    }>;
  };
  conversationSummaries: Array<{
    id: string;
    title: string;
    summary: string;
    keyTopics: string[];
    outcomes: string[];
    timestamp: Date;
  }>;
  lastUpdated: Date;
}

export interface ConversationMemory {
  conversationId: string;
  userId: string;
  context: {
    mode: string;
    specialty: string;
    difficulty: string;
    moduleContext?: any;
    studentContext?: any;
  };
  keyTopics: string[];
  generatedContent: Array<{
    type: string;
    title: string;
    summary: string;
    timestamp: Date;
  }>;
  userFeedback: Array<{
    messageId: string;
    rating?: number;
    feedback?: string;
    timestamp: Date;
  }>;
  learningObjectives: string[];
  progressNotes: string[];
}

class AIMemoryManager {
  private static instance: AIMemoryManager;
  private userMemories: Map<string, UserMemory> = new Map();
  private conversationMemories: Map<string, ConversationMemory> = new Map();

  static getInstance(): AIMemoryManager {
    if (!AIMemoryManager.instance) {
      AIMemoryManager.instance = new AIMemoryManager();
    }
    return AIMemoryManager.instance;
  }

  // Load user memory from storage
  async loadUserMemory(userId: string): Promise<UserMemory> {
    if (this.userMemories.has(userId)) {
      return this.userMemories.get(userId)!;
    }

    // Try to load from localStorage (client-side) or database (server-side)
    try {
      const stored = localStorage.getItem(`ai-memory-${userId}`);
      if (stored) {
        const memory = JSON.parse(stored);
        // Convert date strings back to Date objects
        memory.lastUpdated = new Date(memory.lastUpdated);
        memory.patterns.feedbackHistory = memory.patterns.feedbackHistory.map((f: any) => ({
          ...f,
          timestamp: new Date(f.timestamp)
        }));
        memory.conversationSummaries = memory.conversationSummaries.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        }));
        
        this.userMemories.set(userId, memory);
        return memory;
      }
    } catch (error) {
      console.error('Failed to load user memory:', error);
    }

    // Create new memory if none exists
    const newMemory: UserMemory = {
      userId,
      preferences: {
        preferredMode: 'case_study',
        preferredDifficulty: 'intermediate',
        favoriteSpecialties: [],
        commonModules: [],
        teachingStyle: 'interactive'
      },
      context: {
        institution: 'HCT Al Ain',
        role: 'instructor',
        currentModules: [],
        studentCount: 0,
        recentTopics: []
      },
      patterns: {
        frequentRequests: [],
        successfulFormats: [],
        preferredCaseTypes: [],
        feedbackHistory: []
      },
      conversationSummaries: [],
      lastUpdated: new Date()
    };

    this.userMemories.set(userId, newMemory);
    return newMemory;
  }

  // Save user memory to storage
  async saveUserMemory(memory: UserMemory): Promise<void> {
    memory.lastUpdated = new Date();
    this.userMemories.set(memory.userId, memory);
    
    try {
      localStorage.setItem(`ai-memory-${memory.userId}`, JSON.stringify(memory));
    } catch (error) {
      console.error('Failed to save user memory:', error);
    }
  }

  // Update user preferences based on usage patterns
  async updateUserPreferences(userId: string, updates: Partial<UserMemory['preferences']>): Promise<void> {
    const memory = await this.loadUserMemory(userId);
    memory.preferences = { ...memory.preferences, ...updates };
    await this.saveUserMemory(memory);
  }

  // Track user request patterns
  async trackRequest(userId: string, request: string, mode: string, specialty?: string): Promise<void> {
    const memory = await this.loadUserMemory(userId);
    
    // Update frequent requests
    const existingIndex = memory.patterns.frequentRequests.findIndex(r => r === request);
    if (existingIndex >= 0) {
      // Move to front (most recent)
      memory.patterns.frequentRequests.splice(existingIndex, 1);
    }
    memory.patterns.frequentRequests.unshift(request);
    memory.patterns.frequentRequests = memory.patterns.frequentRequests.slice(0, 20); // Keep last 20

    // Update preferred mode if used frequently
    if (mode !== memory.preferences.preferredMode) {
      const modeCount = memory.patterns.frequentRequests.filter(r => r.includes(mode)).length;
      if (modeCount > 5) {
        memory.preferences.preferredMode = mode;
      }
    }

    // Update favorite specialties
    if (specialty && !memory.preferences.favoriteSpecialties.includes(specialty)) {
      memory.preferences.favoriteSpecialties.push(specialty);
      memory.preferences.favoriteSpecialties = memory.preferences.favoriteSpecialties.slice(0, 10);
    }

    await this.saveUserMemory(memory);
  }

  // Get personalized suggestions based on memory
  async getPersonalizedSuggestions(userId: string, moduleContext?: any): Promise<string[]> {
    const memory = await this.loadUserMemory(userId);
    const suggestions: string[] = [];

    // Based on frequent requests
    if (memory.patterns.frequentRequests.length > 0) {
      suggestions.push(`Continue with ${memory.patterns.frequentRequests[0]}`);
    }

    // Based on favorite specialties
    memory.preferences.favoriteSpecialties.forEach(specialty => {
      suggestions.push(`Create a ${specialty.toLowerCase()} case study for ${memory.preferences.preferredDifficulty} students`);
    });

    // Based on module context
    if (moduleContext?.code) {
      suggestions.push(`Generate assessment questions for ${moduleContext.code}`);
      suggestions.push(`Create practical scenarios for ${moduleContext.code} students`);
    }

    // Based on recent topics
    memory.context.recentTopics.forEach(topic => {
      suggestions.push(`Expand on ${topic} with additional scenarios`);
    });

    return suggestions.slice(0, 6); // Return top 6 suggestions
  }

  // Create conversation memory
  async createConversationMemory(conversationId: string, userId: string, context: any): Promise<ConversationMemory> {
    const memory: ConversationMemory = {
      conversationId,
      userId,
      context,
      keyTopics: [],
      generatedContent: [],
      userFeedback: [],
      learningObjectives: [],
      progressNotes: []
    };

    this.conversationMemories.set(conversationId, memory);
    return memory;
  }

  // Update conversation memory with generated content
  async updateConversationContent(conversationId: string, content: any): Promise<void> {
    const memory = this.conversationMemories.get(conversationId);
    if (!memory) return;

    if (content.title) {
      memory.generatedContent.push({
        type: content.mode || 'case_study',
        title: content.title,
        summary: content.description || '',
        timestamp: new Date()
      });
    }

    if (content.learningObjectives) {
      memory.learningObjectives.push(...content.learningObjectives);
    }

    // Extract key topics from content
    if (content.scenario?.presentation?.chiefComplaint) {
      memory.keyTopics.push(content.scenario.presentation.chiefComplaint);
    }

    this.conversationMemories.set(conversationId, memory);
  }

  // Get conversation context for AI
  async getConversationContext(conversationId: string): Promise<string> {
    const memory = this.conversationMemories.get(conversationId);
    if (!memory) return '';

    let context = `Previous conversation context:\n`;
    context += `Mode: ${memory.context.mode}\n`;
    context += `Specialty: ${memory.context.specialty}\n`;
    context += `Difficulty: ${memory.context.difficulty}\n`;

    if (memory.keyTopics.length > 0) {
      context += `Key topics discussed: ${memory.keyTopics.join(', ')}\n`;
    }

    if (memory.generatedContent.length > 0) {
      context += `Previously generated content:\n`;
      memory.generatedContent.slice(-3).forEach(content => {
        context += `- ${content.title} (${content.type})\n`;
      });
    }

    return context;
  }

  // Build enhanced system prompt with memory
  async buildEnhancedPrompt(userId: string, basePrompt: string, conversationId?: string): Promise<string> {
    const userMemory = await this.loadUserMemory(userId);
    let enhancedPrompt = basePrompt;

    // Add user context
    enhancedPrompt += `\n\nUSER MEMORY CONTEXT:`;
    enhancedPrompt += `\nPreferred Mode: ${userMemory.preferences.preferredMode}`;
    enhancedPrompt += `\nPreferred Difficulty: ${userMemory.preferences.preferredDifficulty}`;
    enhancedPrompt += `\nTeaching Style: ${userMemory.preferences.teachingStyle}`;
    
    if (userMemory.preferences.favoriteSpecialties.length > 0) {
      enhancedPrompt += `\nFavorite Specialties: ${userMemory.preferences.favoriteSpecialties.join(', ')}`;
    }

    if (userMemory.patterns.frequentRequests.length > 0) {
      enhancedPrompt += `\nRecent Request Patterns: ${userMemory.patterns.frequentRequests.slice(0, 3).join(', ')}`;
    }

    // Add conversation context if available
    if (conversationId) {
      const conversationContext = await this.getConversationContext(conversationId);
      if (conversationContext) {
        enhancedPrompt += `\n\n${conversationContext}`;
      }
    }

    enhancedPrompt += `\n\nPlease tailor your response to match the user's preferences and build upon previous conversations when relevant.`;

    return enhancedPrompt;
  }
}

export const aiMemoryManager = AIMemoryManager.getInstance();
