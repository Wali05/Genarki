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
  Cloud
} from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";

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
  const contentRef = useRef(null);
  
  useEffect(() => {
    async function fetchIdeaAndBlueprint() {
      try {
        const id = params.id as string;
        
        // First check sessionStorage for development mode
        const storedIdea = sessionStorage.getItem('currentIdea');
        const storedBlueprint = sessionStorage.getItem('currentBlueprint');
        
        if (storedIdea && storedBlueprint) {
          const parsedIdea = JSON.parse(storedIdea);
          const parsedBlueprint = JSON.parse(storedBlueprint);
          
          // Only use this data if the ID matches
          if (parsedIdea.id === id) {
            setIdea(parsedIdea);
            setBlueprint(parsedBlueprint);
            setLoading(false);
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
  
  const deleteIdea = async () => {
    try {
      if (!idea) return;
      
      setLoading(true);
      
      // Check if using sessionStorage
      const storedIdea = sessionStorage.getItem('currentIdea');
      if (storedIdea) {
        // For development mode, just clear sessionStorage
        sessionStorage.removeItem('currentIdea');
        sessionStorage.removeItem('currentBlueprint');
        router.push('/dashboard');
        return;
      }
      
      // If using Supabase
      try {
        // Delete blueprint first (foreign key constraint)
        await supabase.from('blueprints').delete().eq('idea_id', idea.id);
        
        // Then delete the idea
        const { error } = await supabase.from('ideas').delete().eq('id', idea.id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting from Supabase:', error);
        throw error;
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting idea:', error);
      setLoading(false);
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
      if (!idea) return;
      
      setSavingProject(true);
      
      // Check if using sessionStorage
      const storedIdea = sessionStorage.getItem('currentIdea');
      if (storedIdea) {
        // For development mode, just update localStorage and redirect
        sessionStorage.setItem('projectSaved', 'true');
        toast?.success("Blueprint saved successfully in development mode!");
        setSaved(true);
        
        // Don't clear storage in dev mode to allow continued testing
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
        return;
      }
      
      // If using Supabase
      try {
        // Check if blueprint already exists for this idea
        const { data: existingBlueprint, error: checkError } = await supabase
          .from('blueprints')
          .select('id')
          .eq('idea_id', idea.id)
          .maybeSingle();
        
        if (checkError) {
          console.error('Error checking existing blueprint:', checkError);
          toast?.error(`Error checking for existing blueprint: ${checkError.message}`);
          throw checkError;
        }
        
        // Prepare the blueprint data
        const blueprintData = {
          idea_id: idea.id,
          validation: blueprint.validation || {},
          features: blueprint.features || {},
          tech_stack: blueprint.techStack || blueprint.tech_stack || {},
          pricing_model: blueprint.pricingModel || blueprint.pricing_model || {},
          user_flow: blueprint.userFlow || blueprint.user_flow || "",
          tasks: blueprint.tasks || [],
          progress: blueprint.progress || {}
        };
        
        let saveResult;
        
        if (existingBlueprint) {
          // If blueprint exists, update it
          console.log('Updating existing blueprint:', existingBlueprint.id);
          saveResult = await supabase
            .from('blueprints')
            .update(blueprintData)
            .eq('id', existingBlueprint.id);
        } else {
          // If blueprint doesn't exist, insert it
          console.log('Creating new blueprint for idea:', idea.id);
          saveResult = await supabase
            .from('blueprints')
            .insert([blueprintData]);
        }
        
        if (saveResult.error) {
          console.error('Save error:', saveResult.error);
          toast?.error(`Failed to save blueprint: ${saveResult.error.message}`);
          throw saveResult.error;
        }
        
        console.log('Blueprint saved successfully:', saveResult);
        toast?.success("Blueprint saved successfully!");
        setSaved(true);
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (error: any) {
        console.error('Error saving to Supabase:', error);
        toast?.error(`Failed to save blueprint: ${error.message || 'Unknown error'}`);
        setSavingProject(false);
      }
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast?.error(`Error: ${error.message || 'Unknown error'}`);
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

  // Normalize the blueprint structure
  const normalizedBlueprint = {
    validation: blueprint.validation || {},
    features: blueprint.features || {},
    techStack: blueprint.techStack || blueprint.tech_stack || {},
    pricingModel: blueprint.pricingModel || blueprint.pricing_model || {},
    userFlow: blueprint.userFlow || blueprint.user_flow || "",
    tasks: blueprint.tasks || [],
    progress: blueprint.progress || {}
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => router.push('/projects')}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{idea.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Created {new Date(idea.created_at).toLocaleDateString()}</span>
                  <span className="inline-flex">{renderStars(idea.validation_score)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end md:self-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={deleteIdea} 
                disabled={loading}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                Delete
              </Button>
              
              {!saved && (
                <Button 
                  size="sm" 
                  onClick={saveProject}
                  disabled={savingProject}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
                >
                  {savingProject ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Save Project
                    </>
                  )}
                </Button>
              )}
              
              {saved && displayLimit === "evaluation" && (
                <Button 
                  size="sm" 
                  onClick={() => setDisplayLimit("full")}
                  className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-500 hover:to-green-300"
                >
                  <Network className="h-4 w-4 mr-1.5" />
                  View Full Project
                </Button>
              )}
              
              {saved && displayLimit === "full" && (
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
          
          <Card className="border-b">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{idea.description}</p>
            </CardContent>
          </Card>
          
          <div ref={contentRef}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
                <TabsTrigger value="validation" className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span className="hidden md:inline">Validation</span>
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden md:inline">Features</span>
                </TabsTrigger>
                <TabsTrigger value="tech" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  <span className="hidden md:inline">Tech Stack</span>
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">Pricing</span>
                </TabsTrigger>
                
                {displayLimit === "full" && (
                  <TabsTrigger value="workflow" className="flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    <span className="hidden md:inline">Workflow</span>
                  </TabsTrigger>
                )}
                
                {displayLimit !== "full" && (
                  <TabsTrigger value="" disabled className="flex items-center gap-2 opacity-50">
                    <Layers className="h-4 w-4" />
                    <span className="hidden md:inline">More...</span>
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="validation" className="mt-6 space-y-6">
                {/* Overall Validation Score Card with enhanced visualization */}
                <IdeaScoreCard 
                  score={idea.validation_score} 
                  feedback={normalizedBlueprint.validation.feedback} 
                  pillars={getNormalizedPillars(normalizedBlueprint.validation.pillars)}
                />

                {/* Strengths and Challenges Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StrengthCard strengths={normalizedBlueprint.validation.strengths || []} />
                  <ChallengeCard challenges={normalizedBlueprint.validation.weaknesses || []} />
                </div>
                
                {/* Improvement Suggestions Section */}
                {normalizedBlueprint.validation.improvements && normalizedBlueprint.validation.improvements.length > 0 && (
                  <Card className="overflow-hidden border-purple-100 dark:border-purple-900/30 transition-all duration-300 hover:shadow-md group">
                    <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/20 dark:to-transparent border-b border-purple-100 dark:border-purple-900/30">
                      <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                          <path d="M12 20h9"></path>
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                        Improvement Suggestions
                      </CardTitle>
                      <CardDescription>
                        Strategic recommendations to enhance your product
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {normalizedBlueprint.validation.improvements.map((improvement: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative p-4 rounded-lg border border-purple-100 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all duration-300 cursor-default group"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-400 dark:bg-purple-600 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mt-0.5">
                                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-purple-900 dark:text-purple-200">{improvement}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Market Validation Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Market Validation</CardTitle>
                    <CardDescription>
                      Overall assessment of the business idea's market potential
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      {Object.entries(getNormalizedPillars(normalizedBlueprint.validation.pillars)).map(([category, score], index) => {
                        const scoreValue = typeof score === 'number' ? score : 7;
                        const colorClass = getScoreColorClass(scoreValue);
                        return (
                          <Card key={index} className="bg-muted/50 hover:shadow-md transition-all duration-300">
                            <CardContent className="p-4 text-center space-y-2">
                              <h4 className="text-sm font-medium">{category}</h4>
                              <div className="flex justify-center">
                                <div className={`text-2xl font-bold ${colorClass}`}>
                                  {scoreValue}/10
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Suggested Improvements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {normalizedBlueprint.validation.improvements?.map((improvement: string, index: number) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30"
                        >
                          <span className="h-6 w-6 flex items-center justify-center bg-blue-500 text-white rounded-full shrink-0 text-xs font-medium">{index + 1}</span>
                          <span>{improvement}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-transparent border-blue-100 dark:border-blue-900/30">
                    <CardHeader>
                      <CardTitle className="text-blue-700 dark:text-blue-400">Core Features</CardTitle>
                      <CardDescription>Essential functionality for MVP</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {normalizedBlueprint.features.core?.map((feature: string, index: number) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <div className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 text-xs">
                              {index + 1}
                            </div>
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-transparent border-purple-100 dark:border-purple-900/30">
                    <CardHeader>
                      <CardTitle className="text-purple-700 dark:text-purple-400">Premium Features</CardTitle>
                      <CardDescription>Added value for paying customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {normalizedBlueprint.features.premium?.map((feature: string, index: number) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <div className="h-5 w-5 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 text-xs">
                              P{index + 1}
                            </div>
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-900/20 dark:to-transparent border-emerald-100 dark:border-emerald-900/30">
                    <CardHeader>
                      <CardTitle className="text-emerald-700 dark:text-emerald-400">Future Roadmap</CardTitle>
                      <CardDescription>Features for later versions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {normalizedBlueprint.features.future?.map((feature: string, index: number) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs">
                              F{index + 1}
                            </div>
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tech" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Technology Stack</CardTitle>
                    <CardDescription>
                      Optimal technologies for building this SaaS product
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-blue-500" />
                          <h3 className="font-semibold">Frontend</h3>
                        </div>
                        <ul className="space-y-2 pl-7">
                          {normalizedBlueprint.techStack.frontend?.map((tech: string, index: number) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <span>{tech}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Server className="h-5 w-5 text-purple-500" />
                          <h3 className="font-semibold">Backend</h3>
                        </div>
                        <ul className="space-y-2 pl-7">
                          {normalizedBlueprint.techStack.backend?.map((tech: string, index: number) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                              <span>{tech}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Database className="h-5 w-5 text-green-500" />
                          <h3 className="font-semibold">Database</h3>
                        </div>
                        <ul className="space-y-2 pl-7">
                          {normalizedBlueprint.techStack.database?.map((tech: string, index: number) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              <span>{tech}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-5 w-5 text-amber-500" />
                          <h3 className="font-semibold">Hosting</h3>
                        </div>
                        <ul className="space-y-2 pl-7">
                          {normalizedBlueprint.techStack.hosting?.map((tech: string, index: number) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              <span>{tech}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Code className="h-5 w-5 text-red-500" />
                          <h3 className="font-semibold">Additional Tools</h3>
                        </div>
                        <ul className="space-y-2 pl-7">
                          {normalizedBlueprint.techStack.other?.map((tech: string, index: number) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-2"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              <span>{tech}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

              {displayLimit === "full" && (
                <TabsContent value="workflow" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Flow Diagram</CardTitle>
                      <CardDescription>
                        Visual representation of the application's core user journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                          <MermaidChart
                            chart={normalizedBlueprint.userFlow}
                            config={{
                              theme: "neutral"
                            }}
                          />
                        </div>
                      </div>
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