"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Brain, Star, Trash2, BarChart3, ChevronRight, Loader2, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";import { useUser } from "@clerk/nextjs";

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
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ProjectMetrics>({
    total: 0,
    inProgress: 0,
    completed: 0
  });
  const { user } = useUser();

  useEffect(() => {
    async function fetchIdeas() {
      setLoading(true);
      
      try {
        if (!user) {
          // If no user is logged in yet or in development mode
          const storedIdea = sessionStorage.getItem('currentIdea');
          if (storedIdea) {
            const parsedIdea = JSON.parse(storedIdea);
            setIdeas([parsedIdea]);
            setMetrics({
              total: 1,
              inProgress: 1,
              completed: 0
            });
          } else {
            setIdeas([]);
            setMetrics({
              total: 0,
              inProgress: 0,
              completed: 0
            });
          }
          setLoading(false);
          return;
        }
        
        // Fetch ideas from Supabase
        const { data: ideasData, error: ideasError } = await supabase
          .from('ideas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (ideasError) {
          console.error("Error fetching ideas:", ideasError);
          toast.error("Failed to load projects");
          setIdeas([]);
          setLoading(false);
          return;
        }
        
        if (ideasData && ideasData.length > 0) {
          setIdeas(ideasData);
          
          // Fetch blueprints to determine project status
          const { data: blueprintsData, error: blueprintsError } = await supabase
            .from('blueprints')
            .select('*')
            .in('idea_id', ideasData.map(idea => idea.id));
            
          if (blueprintsError) {
            console.error("Error fetching blueprints:", blueprintsError);
          }
          
          // Calculate metrics
          const completed = blueprintsData?.filter(bp => {
            const sections = Object.keys(bp).filter(k => 
              !['id', 'idea_id', 'created_at', 'updated_at'].includes(k) && 
              bp[k] && (
                (typeof bp[k] === 'object' && Object.keys(bp[k]).length > 0) ||
                (typeof bp[k] === 'string' && bp[k].length > 0)
              )
            ).length;
            const progress = Math.min(100, Math.round((sections / 6) * 100));
            return progress >= 90;
          }).length || 0;
          
          setMetrics({
            total: ideasData.length,
            inProgress: ideasData.length - completed,
            completed
          });
        } else {
          setIdeas([]);
          setMetrics({
            total: 0,
            inProgress: 0,
            completed: 0
          });
        }
      } catch (error) {
        console.error("Error fetching ideas:", error);
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
      
      // If user is logged in, delete from Supabase
      if (user) {
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
      } else {
        // For development mode, remove from sessionStorage
        const storedIdea = sessionStorage.getItem('currentIdea');
        if (storedIdea) {
          const parsedIdea = JSON.parse(storedIdea);
          if (parsedIdea.id === ideaId) {
            sessionStorage.removeItem('currentIdea');
            sessionStorage.removeItem('currentBlueprint');
          }
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
      <div className="container py-10 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">Welcome to Genarki</h1>
          <p className="text-muted-foreground text-lg">Your SaaS idea validation and blueprint platform</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.03 }}
            className="transition-all duration-200"
          >
            <Card className="bg-gradient-to-br from-blue-600/90 to-blue-500 text-white shadow-lg shadow-blue-100 dark:shadow-blue-900/20 border-0 h-full">
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
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            className="transition-all duration-200"
          >
            <Card className="bg-gradient-to-br from-purple-600/90 to-purple-500 text-white shadow-lg shadow-purple-100 dark:shadow-purple-900/20 border-0 h-full">
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
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            className="transition-all duration-200"
          >
            <Card className="bg-gradient-to-br from-green-600/90 to-green-500 text-white shadow-lg shadow-green-100 dark:shadow-green-900/20 border-0 h-full">
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
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2"
            asChild
          >
            <Link href="/generate">
              <PlusCircle className="h-4 w-4" />
              <span>New Project</span>
            </Link>
          </Button>
        </motion.div>

        {/* Project listing */}
        <AnimatePresence>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : ideas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ideas.slice(0, 6).map((idea, i) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="hover:z-10"
                >
                  <Card className="h-full flex flex-col hover:shadow-lg transition-all group border border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800">
                    <CardHeader className="pb-2 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{idea.title}</CardTitle>
                        <div className="flex">
                          {renderStars(idea.validation_score)}
                        </div>
                      </div>
                      <CardDescription>
                        Created {new Date(idea.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 group-hover:bg-blue-50/30 dark:group-hover:bg-blue-900/10 transition-colors">
                      <p className="line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                        {idea.description}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2 pt-4 border-t group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-colors">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteIdea(idea.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button 
                        size="sm" 
                        asChild
                        className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
                      >
                        <Link href={`/idea/${idea.id}`} className="flex items-center">
                          View 
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="rounded-full bg-muted p-6 mb-6">
                <Brain className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start by creating your first SaaS project blueprint and get
                instant validation for your idea
              </p>
              <Button 
                className="bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-2"
                asChild
              >
                <Link href="/generate">
                  <PlusCircle className="h-4 w-4" />
                  Generate First Blueprint
                </Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
} 