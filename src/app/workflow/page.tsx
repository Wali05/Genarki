"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import MermaidChart from "@/components/idea/mermaid-chart";
import { Loader2, FileText, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { BackButton } from "@/components/ui/back-button";

type Idea = {
  id: string;
  title: string;
  description: string;
  created_at: string;
};

type Blueprint = {
  id: string;
  idea_id: string;
  tech_stack: any;
  workflow: string;
  user_flow: string;
  tasks: any[];
};

export default function WorkflowPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [blueprints, setBlueprints] = useState<Record<string, Blueprint>>({});
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Always check session storage first, regardless of user status
        const storedIdea = sessionStorage.getItem('currentIdea');
        const storedBlueprint = sessionStorage.getItem('currentBlueprint');
        
        let sessionIdeas: Idea[] = [];
        let sessionBlueprints: Record<string, Blueprint> = {};
        
        if (storedIdea && storedBlueprint) {
          try {
            const parsedIdea = JSON.parse(storedIdea);
            const parsedBlueprint = JSON.parse(storedBlueprint);
            
            sessionIdeas = [parsedIdea];
            sessionBlueprints = {
              [parsedIdea.id]: {
                id: parsedBlueprint.id || parsedIdea.id,
                idea_id: parsedIdea.id,
                tech_stack: parsedBlueprint.tech_stack || {},
                workflow: parsedBlueprint.workflow || "",
                user_flow: parsedBlueprint.user_flow || "",
                tasks: parsedBlueprint.tasks || []
              }
            };
            
            // Always show session storage ideas as a fallback
            setIdeas(sessionIdeas);
            setBlueprints(sessionBlueprints);
            
            // Select the idea from session storage
            if (sessionIdeas.length > 0) {
              setSelectedIdeaId(sessionIdeas[0].id);
            }
          } catch (error) {
            console.error("Error parsing stored data:", error);
          }
        }
        
        // If logged in, fetch from Supabase
        if (user) {
          const { data: ideasData, error: ideasError } = await supabase
            .from('ideas')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (ideasError) {
            console.error("Error fetching ideas:", ideasError);
            toast.error("Failed to load projects");
            return;
          }
          
          if (ideasData && ideasData.length > 0) {
            // Fetch blueprints
            const { data: blueprintsData, error: blueprintsError } = await supabase
              .from('blueprints')
              .select('*')
              .in('idea_id', ideasData.map(idea => idea.id));
            
            if (blueprintsError) {
              console.error("Error fetching blueprints:", blueprintsError);
              toast.error("Failed to load blueprints");
              return;
            }
            
            // Create a lookup map for blueprints
            const blueprintMap: Record<string, Blueprint> = {};
            if (blueprintsData) {
              blueprintsData.forEach(blueprint => {
                blueprintMap[blueprint.idea_id] = blueprint;
              });
            }
            
            // Merge session data with database data
            const mergedIdeas = [...ideasData];
            const mergedBlueprints = { ...blueprintMap, ...sessionBlueprints };
            
            setIdeas(mergedIdeas);
            setBlueprints(mergedBlueprints);
            
            // Select the first idea if none is selected
            if (!selectedIdeaId && mergedIdeas.length > 0) {
              const ideaWithBlueprint = mergedIdeas.find(idea => !!mergedBlueprints[idea.id]);
              setSelectedIdeaId(ideaWithBlueprint?.id || mergedIdeas[0].id);
            }
          } else if (sessionIdeas.length > 0) {
            // Use session ideas if no database ideas
            setIdeas(sessionIdeas);
            setBlueprints(sessionBlueprints);
            setSelectedIdeaId(sessionIdeas[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [user, selectedIdeaId]);

  const getSelectedIdea = () => {
    return ideas.find(idea => idea.id === selectedIdeaId);
  };

  const getSelectedBlueprint = () => {
    if (!selectedIdeaId) return null;
    return blueprints[selectedIdeaId];
  };

  return (
    <DashboardLayout>
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10"
          animate={{ 
            x: [0, 40, 0],
            y: [0, 60, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 20,
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-600/10"
          animate={{ 
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 15,
            ease: "easeInOut" 
          }}
        />
      </div>

      <div className="container py-8 max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <BackButton href="/dashboard" variant="primary" />
          <motion.h1 
            className="text-3xl font-bold ml-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Workflow Diagrams
          </motion.h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <motion.div 
              className="p-4 relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-12 h-12 rounded-full border-t-2 border-l-2 border-blue-600 animate-spin"></div>
              <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-purple-600 absolute top-6 left-6 animate-spin"></div>
            </motion.div>
          </div>
        ) : ideas.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center h-96 text-center"
          >
            <div className="rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 p-6 mb-6 shadow-inner">
              <FileText className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Generate your first SaaS idea blueprint to view workflow diagrams
            </p>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-colors"
              onClick={() => router.push('/generate')}
            >
              Generate Blueprint
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Project Selector */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Project
              </label>
              <select 
                className="w-full max-w-md px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedIdeaId || ''}
                onChange={(e) => setSelectedIdeaId(e.target.value)}
              >
                <option value="">Select a project...</option>
                {ideas.map(idea => (
                  <option key={idea.id} value={idea.id} disabled={!blueprints[idea.id]?.workflow}>
                    {idea.title} {!blueprints[idea.id]?.workflow && '(No workflow available)'}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Workflow Diagram */}
            <AnimatePresence mode="wait">
              {selectedIdeaId && getSelectedBlueprint()?.workflow ? (
                <motion.div
                  key={selectedIdeaId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border dark:border-gray-800 shadow-md bg-white dark:bg-gray-900">
                    <CardHeader>
                      <CardTitle className="text-xl">{getSelectedIdea()?.title} - Workflow</CardTitle>
                      <CardDescription>
                        Visual representation of the application process flow
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <MermaidChart 
                          chart={getSelectedBlueprint()?.workflow || ''} 
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : selectedIdeaId ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-64 text-center"
                >
                  <p className="text-muted-foreground mb-4">
                    No workflow diagram available for this project.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/idea/${selectedIdeaId}`)}
                  >
                    View Project Details
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 