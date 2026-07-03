export type ProfileEngineData = {
  personal: {
    fullName?: string;
    preferredName?: string;
    birthDate?: string;
    language?: string;
    country?: string;
    city?: string;
    timezone?: string;
  };
  professional: {
    title?: string;
    company?: string;
    area?: string;
    education?: string;
    certifications?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  behavioral: {
    disc?: string;
    communicationStyle?: string;
    detailLevel?: string;
    formality?: string;
    learningStyle?: string;
    leadershipStyle?: string;
  };
  goals: {
    primary?: string[];
    currentProjects?: string;
    desiredOutcomes?: string;
  };
  routine: {
    workHours?: string;
    studyHours?: string;
    focusDays?: string[];
    priorities?: string;
  };
  tools: {
    selected?: string[];
    notes?: string;
  };
  skills: Record<string, number>;
  aiPreferences: {
    responseStyle?: string;
    useTables?: boolean;
    useMarkdown?: boolean;
    citeSources?: boolean;
    generateDocuments?: boolean;
    avoidEmojis?: boolean;
    tone?: string;
  };
};

export type ProfileEngineRow = {
  personal: ProfileEngineData['personal'];
  professional: ProfileEngineData['professional'];
  behavioral: ProfileEngineData['behavioral'];
  goals: ProfileEngineData['goals'];
  routine: ProfileEngineData['routine'];
  tools: ProfileEngineData['tools'];
  skills: ProfileEngineData['skills'];
  ai_preferences: ProfileEngineData['aiPreferences'];
  user_context: Record<string, unknown>;
  completion_percent: number;
};
