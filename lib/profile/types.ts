export type KnowledgeLevel = 0 | 1 | 2 | 3 | 4;

export type ProfileData = {
  personal: {
    fullName: string;
    preferredName: string;
    city: string;
    country: string;
    language: string;
    timezone: string;
  };
  professional: {
    title: string;
    company: string;
    department: string;
    area: string;
    education: string;
    experienceYears: string;
    workMode: string;
    linkedin: string;
    github: string;
    portfolio: string;
    certifications: string;
  };
  behavior: {
    communicationStyle: string;
    detailLevel: string;
    formality: string;
    learningStyle: string;
    decisionSupport: string;
    leadershipProfile: string;
  };
  goals: {
    categories: string[];
    mainProject: string;
    currentProjects: string;
    expectedSupport: string;
  };
  routine: {
    workHours: string;
    studyHours: string;
    activeDays: string[];
    recurringPriorities: string;
  };
  tools: {
    selected: string[];
    notes: string;
  };
  knowledge: Record<string, KnowledgeLevel>;
  preferences: {
    responseStyle: string;
    tone: string;
    askBeforeActing: boolean;
    confirmCriticalActions: boolean;
    useTables: boolean;
    useMarkdown: boolean;
    citeSources: boolean;
    generateDocuments: boolean;
    preferStepByStep: boolean;
    directToCode: boolean;
    avoidEmojis: boolean;
  };
};

export type UserContext = {
  identity: {
    email: string;
    fullName: string;
    preferredName: string;
    location: string | null;
    language: string;
    timezone: string;
  };
  professional: {
    title: string;
    company: string;
    department: string;
    area: string;
    education: string;
    experienceYears: string;
    workMode: string;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
  };
  behavior: ProfileData['behavior'];
  goals: ProfileData['goals'];
  routine: ProfileData['routine'];
  tools: ProfileData['tools'];
  knowledge: Record<string, { level: KnowledgeLevel; label: string }>;
  aiPreferences: ProfileData['preferences'];
  promptInstruction: string;
};
