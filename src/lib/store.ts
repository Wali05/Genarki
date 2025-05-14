import { create } from 'zustand';

type Blueprint = {
  validation: {
    score: number;
    feedback: string;
    improvements: string[];
  };
  features: {
    core: string[];
    premium: string[];
    future: string[];
  };
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    hosting: string[];
    other: string[];
  };
  pricingModel: {
    tiers: {
      name: string;
      price: string;
      features: string[];
    }[];
    strategy: string;
  };
  userFlow: string;
  tasks: {
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    category: string;
    status?: 'Todo' | 'In Progress' | 'Done';
  }[];
};

type IdeaInfo = {
  id?: string;
  title: string;
  description: string;
};

type StoreState = {
  currentIdea: IdeaInfo | null;
  currentBlueprint: Blueprint | null;
  isGenerating: boolean;
  currentStep: number;
  setCurrentIdea: (idea: IdeaInfo) => void;
  setCurrentBlueprint: (blueprint: Blueprint) => void;
  setIsGenerating: (state: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetSteps: () => void;
  reset: () => void;
};

export const useStore = create<StoreState>((set) => ({
  currentIdea: null,
  currentBlueprint: null,
  isGenerating: false,
  currentStep: 0,
  setCurrentIdea: (idea) => set({ currentIdea: idea }),
  setCurrentBlueprint: (blueprint) => set({ currentBlueprint: blueprint }),
  setIsGenerating: (state) => set({ isGenerating: state }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  resetSteps: () => set({ currentStep: 0 }),
  reset: () => set({ 
    currentIdea: null, 
    currentBlueprint: null, 
    isGenerating: false,
    currentStep: 0 
  }),
})); 