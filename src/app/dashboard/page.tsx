"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Brain, Star, Trash2, BarChart3, ChevronRight, Loader2, TrendingUp, Clock, CheckCircle, ArrowUpRight, ListTodo, CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import { Progress } from "@/components/ui/progress";

type Idea = {
  id: string;
  title: string;
  description: string;
  validation_score: number;
  created_at: string;
};

type ProjectMetrics = {
  total: number;
  inProgress: number;
  completed: number;
}

export default function DashboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    total: 0,
    inProgress: 0,
    completed: 0
  });
  const { user } = useAuth();

  // Function to link tasks to projects and track progress
  const getTasksForProject = (projectId: string, allTasks: any[]) => {
    return allTasks.filter(task => task.project_id === projectId);
  };
  
  const getTaskProgress = (tasks: any[]) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'Done').length;
    return Math.round((completed / tasks.length) * 100);
  };

  useEffect(() => {
    async function fetchIdeas() {
      setLoading(true);
      
      try {
        // Always check session storage first, regardless of user status
        const storedIdea = sessionStorage.getItem('currentIdea');
        let sessionIdeas: Idea[] = [];
        let sessionTasks: any[] = [];
        
        if (storedIdea) {
          try {
            const parsedIdea = JSON.parse(storedIdea);
            sessionIdeas = [parsedIdea];
            
            // Get tasks from the blueprint
            const storedBlueprint = sessionStorage.getItem('currentBlueprint');
            if (storedBlueprint) {
              const parsedBlueprint = JSON.parse(storedBlueprint);
              if (parsedBlueprint.tasks && Array.isArray(parsedBlueprint.tasks)) {
                sessionTasks = parsedBlueprint.tasks.map((task: any, index: number) => ({
                  id: `${parsedIdea.id}-task-${index}`,
                  project_id: parsedIdea.id,
                  title: task.title,
                  description: task.description || "",
                  priority: task.priority || "Medium",
                  category: task.category || "General",
                  status: task.status || "Todo"
                }));
              }
            }
            
            // Always show session storage ideas as a fallback
            setIdeas(sessionIdeas);
            setTasks(sessionTasks);
            setMetrics({
              total: 1,
              inProgress: 1,
              completed: 0
            });
          } catch (error) {
            console.error("Error parsing stored idea:", error);
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
            // Fetch blueprints to get task data
            const { data: blueprintsData, error: blueprintsError } = await supabase
              .from('blueprints')
              .select('idea_id, tasks')
              .in('idea_id', ideasData.map(idea => idea.id));
            
            if (blueprintsError) {
              console.error("Error fetching blueprints:", blueprintsError);
            }
            
            // Extract tasks from blueprints
            let dbTasks: any[] = [];
            if (blueprintsData) {
              blueprintsData.forEach(blueprint => {
                if (blueprint.tasks && Array.isArray(blueprint.tasks)) {
                  const projectTasks = blueprint.tasks.map((task: any, index: number) => ({
                    id: `${blueprint.idea_id}-task-${index}`,
                    project_id: blueprint.idea_id,
                    title: task.title,
                    description: task.description || "",
                    priority: task.priority || "Medium",
                    category: task.category || "General",
                    status: task.status || "Todo"
                  }));
                  dbTasks = [...dbTasks, ...projectTasks];
                }
              });
            }
            
            // Set data from database
            setIdeas(ideasData);
            setTasks([...sessionTasks, ...dbTasks]);
            
            // Calculate metrics
            const completed = ideasData.filter(idea => idea.validation_score >= 8).length;
            setMetrics({
              total: ideasData.length,
              inProgress: ideasData.length - completed,
              completed
            });
          } else if (sessionIdeas.length > 0) {
            // Use session ideas if no database ideas
            setIdeas(sessionIdeas);
            setTasks(sessionTasks);
            setMetrics({
              total: 1,
              inProgress: 1,
              completed: 0
            });
          } else {
            // No ideas found
            setIdeas([]);
            setTasks([]);
            setMetrics({
              total: 0,
              inProgress: 0,
              completed: 0
            });
          }
        }
      } catch (error) {
        console.error("Error in fetchIdeas:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    
    fetchIdeas();
  }, [user]);

  const deleteIdea = async (ideaId: string) => {
    try {
      setIdeas(ideas.filter(idea => idea.id !== ideaId));
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        total: prev.total - 1,
        inProgress: Math.max(0, prev.inProgress - 1)
      }));
      
      // Always try to remove from sessionStorage first
      const storedIdea = sessionStorage.getItem('currentIdea');
      if (storedIdea) {
        try {
          const parsedIdea = JSON.parse(storedIdea);
          if (parsedIdea.id === ideaId) {
            console.log("Removing project from session storage:", ideaId);
            sessionStorage.removeItem('currentIdea');
            sessionStorage.removeItem('currentBlueprint');
            sessionStorage.removeItem('projectSaved');
          }
        } catch (e) {
          console.error("Error parsing stored idea:", e);
        }
      }
      
      // If user is logged in, also delete from Supabase
      if (user) {
        console.log("Deleting project from Supabase:", ideaId);
        
        // First delete any blueprint (due to foreign key constraint)
        const { error: blueprintError } = await supabase
          .from('blueprints')
          .delete()
          .eq('idea_id', ideaId);
        
        if (blueprintError) {
          console.error("Error deleting blueprint:", blueprintError);
        }
        
        // Then delete the idea
        const { error: ideaError } = await supabase
          .from('ideas')
          .delete()
          .eq('id', ideaId);
        
        if (ideaError) {
          console.error("Error deleting idea:", ideaError);
          toast.error("Failed to delete project");
          return;
        }
      }
      
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error("Failed to delete project");
    }
  };

  const renderStars = (score: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.round(score / 2) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <DashboardLayout>
      <div className="container py-6 max-w-5xl mx-auto">
        <div className="mb-6 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-blue-600">
            Welcome to Genarki
          </h1>
          <p className="text-muted-foreground text-base">
            Your AI-powered SaaS idea validation and blueprint platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-blue-600 text-white shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <TrendingUp className="h-5 w-5" />
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.total}</div>
              <p className="text-blue-100 text-sm">Your blueprint collection</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-600 text-white shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <Clock className="h-5 w-5" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.inProgress}</div>
              <p className="text-purple-100 text-sm">Projects being developed</p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-600 text-white shadow border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <CheckCircle className="h-5 w-5" />
                Successful Launch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.completed}</div>
              <p className="text-green-100 text-sm">Projects ready for market</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Projects</h2>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-500 transition-colors"
            asChild
          >
            <Link href="/generate">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Project listing */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : ideas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.slice(0, 6).map((idea) => {
              const ideaTasks = getTasksForProject(idea.id, tasks);
              const taskProgress = getTaskProgress(ideaTasks);
              const taskCount = ideaTasks.length;
              
              return (
                <Card key={idea.id} className="h-full border-gray-200 dark:border-gray-700 hover:shadow-md transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1">
                      <Link 
                        href={`/idea/${idea.id}`} 
                        className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        {idea.title}
                        <ArrowUpRight className="h-4 w-4 opacity-70" />
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {idea.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-0">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Validation Score</span>
                          <span className={`font-medium ${
                            idea.validation_score >= 8 ? 'text-green-600 dark:text-green-400' :
                            idea.validation_score >= 6 ? 'text-blue-600 dark:text-blue-400' :
                            idea.validation_score >= 4 ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {idea.validation_score}/10
                          </span>
                        </div>
                        
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              idea.validation_score >= 8 ? 'bg-green-500' :
                              idea.validation_score >= 6 ? 'bg-blue-500' :
                              idea.validation_score >= 4 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${idea.validation_score * 10}%` }}
                          />
                        </div>
                      </div>
                      
                      {taskCount > 0 && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                              <Link 
                                href="/tasks" 
                                className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
                              >
                                <ListTodo className="h-3.5 w-3.5" />
                                Tasks
                              </Link>
                            </span>
                            <span className="font-medium">
                              {ideaTasks.filter(t => t.status === 'Done').length}/{taskCount}
                            </span>
                          </div>
                          
                          <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-purple-500"
                              style={{ width: `${taskProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex items-center justify-between pt-4 mt-4 border-t">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <Link 
                      href={`/idea/${idea.id}`}
                      className="text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md transition-colors"
                    >
                      View Details
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white/50 dark:bg-black/30 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900/40 p-6 mb-6">
              <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start by creating your first SaaS project blueprint and get
              instant validation for your idea
            </p>
            <Button 
              className="bg-blue-600 hover:bg-blue-500 transition-colors"
              asChild
            >
              <Link href="/generate">
                <PlusCircle className="h-4 w-4 mr-2" />
                Generate First Blueprint
              </Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 