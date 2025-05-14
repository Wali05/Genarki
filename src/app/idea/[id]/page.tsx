"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Loader2, 
  Star, 
  ArrowLeft, 
  Trash2, 
  Code, 
  Database, 
  Server, 
  Globe, 
  Save,
  Check,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Network,
  Layers,
  Cloud,
  BarChart,
  Users,
  Megaphone,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  Sparkles,
  Rocket,
  Wrench
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import { databaseService } from "@/lib/database-service";

// Import our enhanced idea components
import {
  IdeaScoreCard,
  StrengthCard,
  ChallengeCard,
  RadarChart
} from "@/components/idea";

// Lazy-load the mermaid component to avoid SSR issues
const MermaidChart = dynamic(
  () => import("@/components/idea/mermaid-chart"),
  { ssr: false, loading: () => <div className="h-60 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">Loading diagram...</div> }
);

type Idea = {
  id: string;
  title: string;
  description: string;
  validation_score: number;
  created_at: string;
};

type Blueprint = any;

// Import helper functions from our component library
import { getStrengthContext, getWeaknessContext, getScoreColorClass } from "@/components/idea/idea-validation-helpers";

// Get formatted pillars data for radar chart visualization
const getNormalizedPillars = (pillars: Record<string, number> | undefined) => {
  if (!pillars || Object.keys(pillars).length === 0) {
    // Return default pillars if none exist
    return {
      "Market Fit": 7,
      "Uniqueness": 8,
      "Scalability": 7,
      "Revenue": 6,
      "Execution": 7,
      "Expertise": 6
    };
  }
  return pillars;
};

// Helper function to get tech stack icons
const getTechIcon = (tech: string) => {
  // Convert tech name to lowercase for easier matching
  const techLower = tech.toLowerCase();
  
  // Frontend technologies
  if (techLower.includes('react')) {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 ml-auto">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    );
  }
  
  if (techLower.includes('next')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-black dark:text-white">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
    );
  }
  
  if (techLower.includes('tailwind')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-blue-400">
        <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
        <path d="M2 17l10 5 10-5"></path>
        <path d="M2 12l10 5 10-5"></path>
      </svg>
    );
  }
  
  // Backend technologies
  if (techLower.includes('node')) {
    return <Server className="h-4 w-4 ml-auto text-green-500" />;
  }
  
  if (techLower.includes('express')) {
    return <Globe className="h-4 w-4 ml-auto text-gray-500" />;
  }
  
  // Database technologies
  if (techLower.includes('postgres') || techLower.includes('sql')) {
    return <Database className="h-4 w-4 ml-auto text-blue-600" />;
  }
  
  if (techLower.includes('redis')) {
    return <Database className="h-4 w-4 ml-auto text-red-500" />;
  }
  
  // Default icon for other technologies
  return <Code className="h-4 w-4 ml-auto text-gray-400" />;
};

  // Function to normalize blueprint data structure
const normalizeBlueprint = (blueprint: any) => {
  if (!blueprint) return {};
  
  const normalized: Record<string, any> = {};
  
  // Core fields
  normalized.validation = blueprint.validation || {};
  normalized.features = blueprint.features || {};
  normalized.market = blueprint.market || {};
  normalized.technical = blueprint.technical || {};
  normalized.tasks = blueprint.tasks || [];
  
  // Fields that might have alternative names
  normalized.techStack = blueprint.techStack || blueprint.tech_stack || {};
  normalized.pricingModel = blueprint.pricingModel || blueprint.pricing_model || {};
  normalized.targetAudience = blueprint.targetAudience || blueprint.target_audience || {};
  normalized.userExperience = blueprint.userExperience || blueprint.user_experience || {};
  normalized.marketAnalysis = blueprint.marketAnalysis || blueprint.market_analysis || {};
  normalized.competitorAnalysis = blueprint.competitorAnalysis || blueprint.competitor_analysis || {};
  normalized.developmentTimeline = blueprint.developmentTimeline || blueprint.development_timeline || {};
  normalized.marketingStrategy = blueprint.marketingStrategy || blueprint.marketing_strategy || {};
  normalized.userFlow = blueprint.userFlow || blueprint.userflow || "";
  
  return normalized;
};

export default function IdeaPage() {
  const router = useRouter();
  const params = useParams();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("validation");
  const [displayLimit, setDisplayLimit] = useState("evaluation");
  const [saved, setSaved] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [showingTutorial, setShowingTutorial] = useState(false);
  const contentRef = useRef(null);
  const { user } = useAuth();
  
  useEffect(() => {
    async function fetchIdeaAndBlueprint() {
      try {
        const id = params.id as string;
        
        // First check sessionStorage for development mode
        const storedIdea = sessionStorage.getItem('currentIdea');
        const storedBlueprint = sessionStorage.getItem('currentBlueprint');
        const projectSaved = sessionStorage.getItem('projectSaved');
        
        // Check if project is saved
        if (projectSaved === 'true') {
          setSaved(true);
        } else {
          setSaved(false);
          // Show tutorial for new projects
          setShowingTutorial(true);
          setTimeout(() => {
            setShowingTutorial(false);
          }, 5000);
        }
        
        if (storedIdea && storedBlueprint) {
          const parsedIdea = JSON.parse(storedIdea);
          const parsedBlueprint = JSON.parse(storedBlueprint);
          
          // Only use this data if the ID matches
          if (parsedIdea.id === id) {
            setIdea(parsedIdea);
            setBlueprint(parsedBlueprint);
            setLoading(false);
            
            // If not saved and user is authenticated, auto-save
            if (projectSaved !== 'true' && user) {
              console.log("Auto-saving new project to database");
              saveProject();
            }
            
            return;
          }
        }
        
        // If no sessionStorage data or ID mismatch, try Supabase
        try {
          // Fetch idea
          const { data: ideaData, error: ideaError } = await supabase
            .from('ideas')
            .select('*')
            .eq('id', id)
            .single();
            
          if (ideaError) throw ideaError;
          
          // Fetch blueprint
          const { data: blueprintData, error: blueprintError } = await supabase
            .from('blueprints')
            .select('*')
            .eq('idea_id', id)
            .single();
            
          if (blueprintError) throw blueprintError;
          
          setIdea(ideaData);
          setBlueprint(blueprintData);
          setSaved(true);
        } catch (error) {
          console.error('Error fetching from Supabase:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error fetching idea details:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    
    fetchIdeaAndBlueprint();
  }, [params.id, router]);
  
  // Progress through sections with animations
  useEffect(() => {
    if (!loading && blueprint && !saved) {
      const timer = setInterval(() => {
        setActiveSection(prev => {
          const next = prev + 1;
          if (next > 7) { // Total number of sections
            clearInterval(timer);
            return prev;
          }
          return next;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [loading, blueprint, saved]);

  const deleteIdea = async () => {
    try {
      if (!idea) return;
      
      setLoading(true);
      
      // Always try to remove from sessionStorage first
      console.log("Removing project from session storage:", idea.id);
      sessionStorage.removeItem('currentIdea');
      sessionStorage.removeItem('currentBlueprint');
      sessionStorage.removeItem('projectSaved');
      
      // If using Supabase
      if (user) {
        console.log("Deleting project from Supabase:", idea.id);
        try {
          // Delete blueprint first (foreign key constraint)
          const { error: blueprintError } = await supabase
            .from('blueprints')
            .delete()
            .eq('idea_id', idea.id);
            
          if (blueprintError) {
            console.error("Error deleting blueprint:", blueprintError);
          }
          
          // Then delete the idea
          const { error } = await supabase
            .from('ideas')
            .delete()
            .eq('id', idea.id);
          
          if (error) {
            console.error("Error deleting idea:", error);
            toast.error("Failed to delete from database, but removed locally");
          }
        } catch (error) {
          console.error('Error deleting from Supabase:', error);
        }
      }
      
      toast.success("Project deleted successfully");
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting idea:', error);
      setLoading(false);
      toast.error("Error deleting project");
    }
  };

  const renderStars = (score: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < Math.round(score / 2) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  const saveProject = async () => {
    try {
      if (!idea || !blueprint) return;
      
      setSavingProject(true);
      
      // Check if using sessionStorage
      const storedIdea = sessionStorage.getItem('currentIdea');
      if (storedIdea) {
        try {
          // For authenticated users, save to database
          if (user) {
            console.log("Saving project to database for user:", user.id);
            
            // Extract validation score from blueprint
            let validationScore = 5; // Default score
            try {
              if (blueprint?.validation?.score) {
                validationScore = Number(blueprint.validation.score);
                if (isNaN(validationScore)) validationScore = 5;
              }
            } catch (e) {
              console.warn("Error parsing validation score:", e);
            }
            
            // Step 1: Save idea first
            const { data: ideaResult, error: ideaError } = await databaseService.saveIdea(
              idea.title,
              idea.description,
              validationScore
            );
            
            if (ideaError) {
              console.error("Error saving idea:", ideaError);
              toast.error("Failed to save project: " + ideaError);
              setSavingProject(false);
              return;
            }
            
            if (!ideaResult || !ideaResult.id) {
              throw new Error("No idea ID returned");
            }
            
            // Update session storage with real ID
            const newIdea = {
              ...idea,
              id: ideaResult.id
            };
            
            setIdea(newIdea);
            sessionStorage.setItem('currentIdea', JSON.stringify(newIdea));
            
            // Step 2: Save complete blueprint with all fields
            const { error: blueprintError } = await databaseService.saveBlueprint(
              ideaResult.id,
              blueprint
            );
            
            if (blueprintError) {
              console.error("Error saving blueprint:", blueprintError);
              toast.warning("Project saved but some details may be missing");
            }
            
            // Update status
            sessionStorage.setItem('projectSaved', 'true');
            toast.success("Project saved successfully!");
            setSaved(true);
            
            // Update URL to reflect the new ID
            router.replace(`/idea/${ideaResult.id}`);
          } else {
            // For dev/demo mode when not authenticated
            sessionStorage.setItem('projectSaved', 'true');
            toast.success("Project saved in demo mode");
            setSaved(true);
          }
        } catch (error: any) {
          console.error("Error during save:", error);
          toast.error("Save failed: " + error.message);
          setSavingProject(false);
          return;
        }
      } else {
        // If not using sessionStorage, use direct Supabase method
        try {
          // Check if blueprint already exists
          const { data: existingBlueprint, error: checkError } = await supabase
            .from('blueprints')
            .select('id')
            .eq('idea_id', idea.id)
            .maybeSingle();
            
          if (checkError) throw checkError;
          
          // Prepare complete blueprint data
          const blueprintData = {
            idea_id: idea.id,
            features: blueprint.features || {},
            market: blueprint.market || {},
            technical: blueprint.technical || {},
            validation: blueprint.validation || {},
            userflow: blueprint.userflow || blueprint.userFlow || "",
            tasks: blueprint.tasks || [],
            pricingModel: blueprint.pricingModel || {},
            techStack: blueprint.techStack || {},
            targetAudience: blueprint.targetAudience || blueprint.target_audience || {},
            userExperience: blueprint.userExperience || blueprint.user_experience || {},
            marketAnalysis: blueprint.marketAnalysis || blueprint.market_analysis || {},
            competitorAnalysis: blueprint.competitorAnalysis || blueprint.competitor_analysis || {},
            developmentTimeline: blueprint.developmentTimeline || blueprint.development_timeline || {},
            marketingStrategy: blueprint.marketingStrategy || blueprint.marketing_strategy || {}
          };
          
          // Update or insert blueprint
          let saveResult;
          if (existingBlueprint) {
            saveResult = await supabase
              .from('blueprints')
              .update(blueprintData)
              .eq('id', existingBlueprint.id);
          } else {
            saveResult = await supabase
              .from('blueprints')
              .insert([blueprintData]);
          }
          
          if (saveResult.error) throw saveResult.error;
          
          sessionStorage.setItem('projectSaved', 'true');
          toast.success("Project saved successfully!");
          setSaved(true);
        } catch (error: any) {
          console.error("Error saving to Supabase:", error);
          toast.error("Failed to save: " + error.message);
        }
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error("Error: " + error.message);
    } finally {
      setSavingProject(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container py-10 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Loading blueprint...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!idea || !blueprint) {
    return (
      <DashboardLayout>
        <div className="container py-10">
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Blueprint not found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The idea you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Replace the current normalizedBlueprint assignment with a call to our helper function
  const normalizedBlueprint = normalizeBlueprint(blueprint);

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <BackButton 
                href="/projects" 
                variant="primary"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{idea.title}</h1>
                <motion.div 
                  className="flex items-center gap-2 text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span>Created {new Date(idea.created_at).toLocaleDateString()}</span>
                  <div className="inline-flex">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.5, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              i < Math.round(idea.validation_score / 2) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-auto">
              {displayLimit === "evaluation" && (
                <Button 
                  size="sm" 
                  onClick={() => setDisplayLimit("full")}
                  className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-500 hover:to-green-300"
                >
                  <Network className="h-4 w-4 mr-1.5" />
                  View Full Project
                </Button>
              )}
              
              {displayLimit === "full" && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setDisplayLimit("evaluation")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" />
                  Back to Summary
                </Button>
              )}
            </div>
          </div>
          
          {/* Tutorial guide for new users */}
          {showingTutorial && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-2"
            >
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
                  <Sparkles className="h-5 w-5 text-blue-500" />
                </div>
                              <div>
                <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-1">Your blueprint is ready!</h3>
                <p className="text-blue-600/80 dark:text-blue-300/80 text-sm">
                  Explore the tabs below to see your complete SaaS blueprint. Your project has been automatically saved to your account.
                </p>
              </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowingTutorial(false)}
                  className="ml-auto shrink-0 h-8 w-8 p-0"
                >
                  ×
                </Button>
              </div>
            </motion.div>
          )}
          
          <Card className="border-b">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{idea.description}</p>
            </CardContent>
          </Card>
          
          <div ref={contentRef}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-4">
                <TabsList className="grid grid-cols-3 md:grid-cols-8 rounded-xl bg-blue-50/50 dark:bg-gray-800/50 p-1 backdrop-blur-sm shadow-inner mx-auto border border-blue-200/50 dark:border-gray-700/30">
                  <TabsTrigger 
                    value="validation" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  >
                    <Check className="h-4 w-4" />
                    <span className="hidden md:inline">Validation</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="features" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:inline">Features</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tech" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  >
                    <Code className="h-4 w-4" />
                    <span className="hidden md:inline">Tech</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pricing" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden md:inline">Pricing</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="market" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  >
                    <BarChart className="h-4 w-4" />
                    <span className="hidden md:inline">Market</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="competitors" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden md:inline">Competitors</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="marketing" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  >
                    <Megaphone className="h-4 w-4" />
                    <span className="hidden md:inline">Marketing</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="workflow" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm data-[state=active]:font-medium transition-all duration-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                  >
                    <Network className="h-4 w-4" />
                    <span className="hidden md:inline">Workflow</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <AnimatePresence>
                <TabsContent value="validation" className="mt-6 space-y-6">
                  {(saved || activeSection >= 1) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <IdeaScoreCard 
                        score={idea.validation_score} 
                        feedback={normalizedBlueprint.validation.feedback} 
                        pillars={getNormalizedPillars(normalizedBlueprint.validation.pillars)}
                      />
                    </motion.div>
                  )}

                  {(saved || activeSection >= 2) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StrengthCard strengths={normalizedBlueprint.validation.strengths || []} />
                        <ChallengeCard challenges={normalizedBlueprint.validation.weaknesses || []} />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Rest of validation content... */}
                </TabsContent>
              </AnimatePresence>

              <TabsContent value="features" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-transparent border-blue-100 dark:border-blue-900/30 h-full overflow-hidden group hover:shadow-lg hover:shadow-blue-100/40 dark:hover:shadow-blue-900/20 transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/10 border-b border-blue-100 dark:border-blue-800/20">
                        <CardTitle className="text-blue-700 dark:text-blue-400 flex items-center gap-2">
                          <Layers className="h-5 w-5" />
                          <span>Core Features</span>
                        </CardTitle>
                        <CardDescription className="text-blue-600/70 dark:text-blue-400/70">Essential functionality for MVP</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <ul className="space-y-4">
                          {normalizedBlueprint.features.core?.map((feature: string, index: number) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileHover={{ x: 3 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 group/feature"
                            >
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shrink-0 text-xs drop-shadow-sm group-hover/feature:shadow-md group-hover/feature:shadow-blue-200 dark:group-hover/feature:shadow-blue-900/30 transition-all">
                                {index + 1}
                              </div>
                              <motion.span 
                                className="text-gray-700 dark:text-gray-200 group-hover/feature:text-blue-700 dark:group-hover/feature:text-blue-400 transition-colors"
                                whileHover={{ scale: 1.01 }}
                              >
                                {feature}
                              </motion.span>
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card className="bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-transparent border-purple-100 dark:border-purple-900/30 h-full overflow-hidden group hover:shadow-lg hover:shadow-purple-100/40 dark:hover:shadow-purple-900/20 transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/10 border-b border-purple-100 dark:border-purple-800/20">
                        <CardTitle className="text-purple-700 dark:text-purple-400 flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          <span>Premium Features</span>
                        </CardTitle>
                        <CardDescription className="text-purple-600/70 dark:text-purple-400/70">Added value for paying customers</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <ul className="space-y-4">
                          {normalizedBlueprint.features.premium?.map((feature: string, index: number) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileHover={{ x: 3 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 group/feature"
                            >
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center shrink-0 text-xs drop-shadow-sm group-hover/feature:shadow-md group-hover/feature:shadow-purple-200 dark:group-hover/feature:shadow-purple-900/30 transition-all">
                                P{index + 1}
                              </div>
                              <motion.span 
                                className="text-gray-700 dark:text-gray-200 group-hover/feature:text-purple-700 dark:group-hover/feature:text-purple-400 transition-colors"
                                whileHover={{ scale: 1.01 }}
                              >
                                {feature}
                              </motion.span>
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-transparent border-emerald-100 dark:border-emerald-900/30 h-full overflow-hidden group hover:shadow-lg hover:shadow-emerald-100/40 dark:hover:shadow-emerald-900/20 transition-all duration-300">
                      <CardHeader className="bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/10 border-b border-emerald-100 dark:border-emerald-800/20">
                        <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                          <Rocket className="h-5 w-5" />
                          <span>Future Roadmap</span>
                        </CardTitle>
                        <CardDescription className="text-emerald-600/70 dark:text-emerald-400/70">Features for later versions</CardDescription>
                      </CardHeader>
                      <CardContent className="p-5">
                        <ul className="space-y-4">
                          {normalizedBlueprint.features.future?.map((feature: string, index: number) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              whileHover={{ x: 3 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 group/feature"
                            >
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shrink-0 text-xs drop-shadow-sm group-hover/feature:shadow-md group-hover/feature:shadow-emerald-200 dark:group-hover/feature:shadow-emerald-900/30 transition-all">
                                F{index + 1}
                              </div>
                              <motion.span 
                                className="text-gray-700 dark:text-gray-200 group-hover/feature:text-emerald-700 dark:group-hover/feature:text-emerald-400 transition-colors"
                                whileHover={{ scale: 1.01 }}
                              >
                                {feature}
                              </motion.span>
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              <TabsContent value="tech" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="overflow-hidden border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-500" />
                        <span>Recommended Technology Stack</span>
                      </CardTitle>
                      <CardDescription className="text-gray-500 dark:text-gray-400">
                        Optimal technologies for building this SaaS product
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                            <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center text-white">
                              <Globe className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-blue-700 dark:text-blue-400">Frontend</h3>
                          </div>
                          <ul className="space-y-3 pl-2">
                            {normalizedBlueprint.techStack.frontend?.map((tech: string, index: number) => (
                              <motion.li 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: 3 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 group cursor-default"
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                                  <span className="h-2 w-2 rounded-full bg-blue-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                  {tech}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>

                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-md">
                            <div className="w-10 h-10 rounded-md bg-purple-500 flex items-center justify-center text-white">
                              <Server className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-purple-700 dark:text-purple-400">Backend</h3>
                          </div>
                          <ul className="space-y-3 pl-2">
                            {normalizedBlueprint.techStack.backend?.map((tech: string, index: number) => (
                              <motion.li 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: 3 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 group cursor-default"
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                                  <span className="h-2 w-2 rounded-full bg-purple-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                                  {tech}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>

                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                            <div className="w-10 h-10 rounded-md bg-green-500 flex items-center justify-center text-white">
                              <Database className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-green-700 dark:text-green-400">Database</h3>
                          </div>
                          <ul className="space-y-3 pl-2">
                            {normalizedBlueprint.techStack.database?.map((tech: string, index: number) => (
                              <motion.li 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: 3 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 group cursor-default"
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                                  <span className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                                  {tech}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>

                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
                            <div className="w-10 h-10 rounded-md bg-amber-500 flex items-center justify-center text-white">
                              <Cloud className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-amber-700 dark:text-amber-400">Hosting</h3>
                          </div>
                          <ul className="space-y-3 pl-2">
                            {normalizedBlueprint.techStack.hosting?.map((tech: string, index: number) => (
                              <motion.li 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: 3 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 group cursor-default"
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors">
                                  <span className="h-2 w-2 rounded-full bg-amber-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                  {tech}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>

                        <motion.div 
                          className="space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                            <div className="w-10 h-10 rounded-md bg-red-500 flex items-center justify-center text-white">
                              <Wrench className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-red-700 dark:text-red-400">Additional Tools</h3>
                          </div>
                          <ul className="space-y-3 pl-2">
                            {normalizedBlueprint.techStack.other?.map((tech: string, index: number) => (
                              <motion.li 
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                whileHover={{ x: 3 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-3 group cursor-default"
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                                  <span className="h-2 w-2 rounded-full bg-red-500 group-hover:scale-110 transition-transform" />
                                </div>
                                <span className="text-gray-700 dark:text-gray-300 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                                  {tech}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="pricing" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Strategy</CardTitle>
                    <CardDescription>
                      {normalizedBlueprint.pricingModel.strategy || "Tiered subscription model with monthly and annual plans"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {normalizedBlueprint.pricingModel.tiers?.map((tier: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className={`h-full ${index === 1 ? "border-blue-500 dark:border-blue-500 shadow-lg" : ""}`}>
                            {index === 1 && (
                              <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                                RECOMMENDED
                              </div>
                            )}
                            <CardHeader className={index === 1 ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                              <CardTitle>{tier.name}</CardTitle>
                              <div className="mt-2.5">
                                <span className="text-3xl font-bold">{tier.price}</span>
                                {tier.price.includes("/month") && (
                                  <span className="text-sm text-muted-foreground ml-1">per user</span>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <ul className="space-y-2">
                                {tier.features.map((feature: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Check className={`h-5 w-5 shrink-0 ${index === 1 ? "text-blue-500" : "text-green-500"}`} />
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                            <CardFooter>
                              <Button 
                                className={index === 1 
                                  ? "w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300" 
                                  : "w-full"
                                }
                                variant={index === 1 ? "default" : "outline"}
                              >
                                Select Plan
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* New Market Analysis Tab */}
              <TabsContent value="market" className="mt-6 space-y-6">
                <Card className="overflow-hidden border-green-100 dark:border-green-900/30 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-white dark:from-green-900/20 dark:to-transparent border-b border-green-100 dark:border-green-900/30">
                    <CardTitle className="text-green-700 dark:text-green-400">Market Overview</CardTitle>
                    <CardDescription>Analysis of the total addressable market</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Market Size</h4>
                        <p className="text-gray-700 dark:text-gray-300">{normalizedBlueprint.market?.size || "Not specified"}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
                        <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Growth Rate</h4>
                        <p className="text-gray-700 dark:text-gray-300">{normalizedBlueprint.market?.growth || "Not specified"}</p>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
                      <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Key Opportunity</h4>
                      <p className="text-gray-700 dark:text-gray-300">{normalizedBlueprint.market?.opportunity || "Not specified"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden shadow-sm">
                  <CardHeader>
                    <CardTitle>Target Demographics</CardTitle>
                    <CardDescription>Key demographic groups for your product</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {normalizedBlueprint.market?.demographics?.map((demographic: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30"
                        >
                          {demographic}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden shadow-sm">
                  <CardHeader>
                    <CardTitle>Market Analysis</CardTitle>
                    <CardDescription>Insights and trends in the target market</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="text-lg font-medium mb-3">Key Trends</h4>
                      <div className="grid gap-3">
                        {normalizedBlueprint.marketAnalysis?.trends?.map((trend: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3"
                          >
                            <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                            <span>{trend}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-3">Risks & Challenges</h4>
                      <div className="grid gap-3">
                        {normalizedBlueprint.marketAnalysis?.risks?.map((risk: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 rounded-md bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 flex items-start gap-3"
                          >
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <span>{risk}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-3">Opportunities</h4>
                      <div className="grid gap-3">
                        {normalizedBlueprint.marketAnalysis?.opportunities?.map((opportunity: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-3 rounded-md bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 flex items-start gap-3"
                          >
                            <ArrowUpRight className="h-5 w-5 text-green-500 mt-0.5" />
                            <span>{opportunity}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Competitor Analysis Tab */}
              <TabsContent value="competitors" className="mt-6 space-y-6">
                <Card className="overflow-hidden border-purple-100 dark:border-purple-900/30 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-transparent border-b border-purple-100 dark:border-purple-900/30">
                    <CardTitle className="text-purple-700 dark:text-purple-400">Competitive Landscape</CardTitle>
                    <CardDescription>Analysis of direct and indirect competitors</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <h4 className="text-lg font-medium mb-3">Direct Competitors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {normalizedBlueprint.competitorAnalysis?.direct?.map((competitor: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg border border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700">
                                {index + 1}
                              </div>
                              <span className="font-medium">{competitor}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-3">Indirect Competitors</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {normalizedBlueprint.competitorAnalysis?.indirect?.map((competitor: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                                {index + 1}
                              </div>
                              <span className="font-medium">{competitor}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <Card className="border-green-100 dark:border-green-900/30">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-green-700 dark:text-green-400">Your Competitive Advantages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {normalizedBlueprint.competitorAnalysis?.advantages?.map((advantage: string, index: number) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3"
                            >
                              <div className="mt-0.5">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              </div>
                              <span>{advantage}</span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Marketing Strategy Tab */}
              <TabsContent value="marketing" className="mt-6 space-y-6">
                <Card className="overflow-hidden border-blue-100 dark:border-blue-900/30 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-transparent border-b border-blue-100 dark:border-blue-900/30">
                    <CardTitle className="text-blue-700 dark:text-blue-400">Marketing Strategy</CardTitle>
                    <CardDescription>Comprehensive plan to reach and engage your target audience</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                      <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">Marketing Approach</h4>
                      <p className="text-gray-700 dark:text-gray-300">{normalizedBlueprint.marketingStrategy?.approach || "Not specified"}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                      <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">Recommended Budget</h4>
                      <p className="text-gray-700 dark:text-gray-300">{normalizedBlueprint.marketingStrategy?.budget || "Not specified"}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Marketing Channels</CardTitle>
                      <CardDescription>Primary distribution channels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {normalizedBlueprint.marketingStrategy?.channels?.map((channel: string, index: number) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30"
                          >
                            <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                              {index + 1}
                            </div>
                            <span>{channel}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Marketing Tactics</CardTitle>
                      <CardDescription>Specific strategies to implement</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {normalizedBlueprint.marketingStrategy?.tactics?.map((tactic: string, index: number) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-2 p-3 rounded-md bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30"
                          >
                            <div className="h-6 w-6 rounded-full bg-purple-500 text-white flex items-center justify-center">
                              {index + 1}
                            </div>
                            <span>{tactic}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Development Timeline</CardTitle>
                    <CardDescription>Project roadmap and timeline</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                        <h4 className="font-medium text-center mb-2">MVP</h4>
                        <p className="text-center font-bold text-blue-700">{normalizedBlueprint.developmentTimeline?.mvp || "3-4 months"}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10">
                        <h4 className="font-medium text-center mb-2">Beta Release</h4>
                        <p className="text-center font-bold text-purple-700">{normalizedBlueprint.developmentTimeline?.beta || "6 months"}</p>
                      </div>
                      <div className="p-4 rounded-lg border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10">
                        <h4 className="font-medium text-center mb-2">Official Launch</h4>
                        <p className="text-center font-bold text-green-700">{normalizedBlueprint.developmentTimeline?.launch || "9 months"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium mb-3">Development Phases</h4>
                      <div className="space-y-3">
                        {normalizedBlueprint.developmentTimeline?.phases?.map((phase: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-8 py-3 border-l-2 border-blue-400"
                          >
                            <div className="absolute left-[-9px] top-3 h-4 w-4 rounded-full bg-blue-500"></div>
                            <div className="text-sm font-medium text-blue-700 mb-1">Phase {index + 1}</div>
                            <div>{phase}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {displayLimit === "full" && (
                <TabsContent value="workflow" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Interactive User Flow Diagram</CardTitle>
                      <CardDescription>
                        Visual representation of the application's core user journey. You can drag to move, zoom in/out, and interact with the diagram.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-6">
                      <MermaidChart
                        chart={normalizedBlueprint.userFlow || 'graph TD\n  A[User Sign Up] --> B[Onboarding]\n  B --> C[Dashboard]\n  C --> D[Features]\n  D --> E[Conversion]'}
                        config={{
                          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'neutral',
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 