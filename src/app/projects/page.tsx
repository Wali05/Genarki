"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, Star, Trash2, ChevronRight, ArrowUpDown, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

type Project = {
  id: string;
  title: string;
  description: string;
  validation_score: number;
  created_at: string;
  status: "planning" | "in_progress" | "completed";
  progress: number;
};

const sampleProjects: Project[] = [
  {
    id: "1",
    title: "AI Writing Assistant",
    description: "A tool that helps content creators generate high-quality articles with AI assistance",
    validation_score: 8,
    created_at: new Date().toISOString(),
    status: "in_progress",
    progress: 65
  },
  {
    id: "2",
    title: "Remote Team Collaboration Platform",
    description: "An all-in-one workspace for remote teams to collaborate, share files, and manage projects",
    validation_score: 7,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    status: "planning",
    progress: 30
  },
  {
    id: "3",
    title: "SaaS Analytics Dashboard",
    description: "Comprehensive analytics solution for SaaS businesses to track key metrics and customer behavior",
    validation_score: 9,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    status: "completed",
    progress: 100
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      
      try {
        // Always check session storage first, regardless of user status
        const storedIdea = sessionStorage.getItem('currentIdea');
        const sessionProjects: Project[] = [];
        
        if (storedIdea) {
          try {
            const parsedIdea = JSON.parse(storedIdea);
            const blueprintData = sessionStorage.getItem('currentBlueprint');
            let progress = 0;
            
            if (blueprintData) {
              const blueprint = JSON.parse(blueprintData);
              // Calculate progress based on completed sections
              const sections = Object.keys(blueprint).filter(k => 
                blueprint[k] && typeof blueprint[k] === 'object' && Object.keys(blueprint[k]).length > 0
              ).length;
              progress = Math.min(100, Math.round((sections / 6) * 100));
            }
            
            // Create a project from the stored idea
            const newProject: Project = {
              id: parsedIdea.id,
              title: parsedIdea.title,
              description: parsedIdea.description,
              validation_score: parsedIdea.validation_score || 7,
              created_at: parsedIdea.created_at || new Date().toISOString(),
              status: progress >= 100 ? "completed" : progress > 30 ? "in_progress" : "planning",
              progress: progress
            };
            
            sessionProjects.push(newProject);
          } catch (error) {
            console.error("Error parsing stored idea:", error);
          }
        }
        
        // If we're not logged in, just use session storage projects
        if (!user) {
          setProjects(sessionProjects);
          setLoading(false);
          return;
        }
        
        console.log("Fetching Supabase projects for user:", user.id);
        
        // Otherwise, also fetch from Supabase and combine with session storage
        const { data: ideasData, error: ideasError } = await supabase
          .from('ideas')
          .select('*')
          .eq('user_id', user.id);
        
        if (ideasError) {
          console.error("Error fetching ideas from Supabase:", ideasError);
          
          // If Supabase fetch fails, still show session storage projects
          if (sessionProjects.length > 0) {
            setProjects(sessionProjects);
          } else {
            toast.error("Failed to load projects");
            setProjects([]);
          }
          
          setLoading(false);
          return;
        }
        
        // If no Supabase projects but we have session projects, use those
        if (!ideasData || ideasData.length === 0) {
          setProjects(sessionProjects);
          setLoading(false);
          return;
        }
        
        // Fetch blueprints for these ideas
        const { data: blueprintsData, error: blueprintsError } = await supabase
          .from('blueprints')
          .select('*')
          .in('idea_id', ideasData.map(idea => idea.id));
        
        if (blueprintsError) {
          console.error("Error fetching blueprints:", blueprintsError);
        }
        
        // Map ideas to projects, combining with blueprint data
        const projectsData = ideasData.map(idea => {
          const blueprint = blueprintsData?.find(bp => bp.idea_id === idea.id);
          let progress = 0;
          let status: "planning" | "in_progress" | "completed" = "planning";
          
          if (blueprint) {
            // Calculate progress based on completed sections
            const sections = Object.keys(blueprint).filter(k => 
              !['id', 'idea_id', 'created_at', 'updated_at'].includes(k) && 
              blueprint[k] && (
                (typeof blueprint[k] === 'object' && Object.keys(blueprint[k]).length > 0) ||
                (typeof blueprint[k] === 'string' && blueprint[k].length > 0)
              )
            ).length;
            progress = Math.min(100, Math.round((sections / 6) * 100));
            status = progress >= 100 ? "completed" : progress > 30 ? "in_progress" : "planning";
          }
          
          return {
            id: idea.id,
            title: idea.title,
            description: idea.description,
            validation_score: idea.validation_score || 5,
            created_at: idea.created_at,
            status,
            progress
          };
        });
        
        // Combine session projects with Supabase projects, avoiding duplicates
        const combinedProjects = [...projectsData];
        
        // Add session projects that don't exist in Supabase
        sessionProjects.forEach(sessionProject => {
          if (!combinedProjects.some(p => p.id === sessionProject.id)) {
            combinedProjects.push(sessionProject);
          }
        });
        
        setProjects(combinedProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        
        // Always try to show session storage projects even if there's an error
        const storedIdea = sessionStorage.getItem('currentIdea');
        if (storedIdea) {
          try {
            const parsedIdea = JSON.parse(storedIdea);
            const newProject: Project = {
              id: parsedIdea.id,
              title: parsedIdea.title,
              description: parsedIdea.description,
              validation_score: parsedIdea.validation_score || 7,
              created_at: parsedIdea.created_at || new Date().toISOString(),
              status: "planning",
              progress: 30
            };
            setProjects([newProject]);
          } catch (e) {
            toast.error("Failed to load projects");
            setProjects([]);
          }
        } else {
          toast.error("Failed to load projects");
          setProjects([]);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchProjects();
  }, [user]);

  const filteredProjects = projects
    .filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(project => statusFilter === "all" || project.status === statusFilter)
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const deleteProject = async (projectId: string) => {
    try {
      setProjects(projects.filter(project => project.id !== projectId));
      
      // Always try to remove from sessionStorage first
      const storedIdea = sessionStorage.getItem('currentIdea');
      if (storedIdea) {
        try {
          const parsedIdea = JSON.parse(storedIdea);
          if (parsedIdea.id === projectId) {
            console.log("Removing project from session storage:", projectId);
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
        console.log("Deleting project from Supabase:", projectId);
        
        // First delete any blueprint (due to foreign key constraint)
        const { error: blueprintError } = await supabase
          .from('blueprints')
          .delete()
          .eq('idea_id', projectId);
        
        if (blueprintError) {
          console.error("Error deleting blueprint:", blueprintError);
        }
        
        // Then delete the idea
        const { error: ideaError } = await supabase
          .from('ideas')
          .delete()
          .eq('id', projectId);
        
        if (ideaError) {
          console.error("Error deleting idea:", ideaError);
          toast.error("Failed to delete project");
          return;
        }
      }
      
      toast.success("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500";
      case "in_progress": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500";
      case "completed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400";
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">Manage your SaaS projects and blueprints</p>
          </div>
          
          <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 shrink-0">
            <Link href="/generate">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="flex items-center justify-between"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <div className="flex items-center">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <span>Date {sortOrder === "asc" ? "Oldest" : "Newest"}</span>
            </div>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="opacity-70 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed"
          >
            <h2 className="text-2xl font-semibold mb-2">No projects found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Start by creating your first SaaS project blueprint"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button 
                size="lg" 
                asChild
                className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
              >
                <Link href="/generate">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Generate First Blueprint
                </Link>
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="hover:shadow-md transition-all group overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 min-w-0">
                      <CardHeader className="pb-2 md:pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors truncate">
                              {project.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(project.status)}`}>
                                {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex md:hidden">
                            {renderStars(project.validation_score)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                          {project.description}
                        </p>
                        
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium">Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                    
                    <div className="md:w-64 md:shrink-0 md:border-l dark:border-gray-800 flex flex-col md:justify-between">
                      <div className="p-6 hidden md:flex md:justify-end">
                        {renderStars(project.validation_score)}
                      </div>
                      
                      <div className="p-4 md:p-6 flex md:flex-col gap-4 border-t md:border-t-0 dark:border-gray-800">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProject(project.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 w-full"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button 
                          size="sm" 
                          asChild
                          className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 w-full"
                        >
                          <Link href={`/idea/${project.id}`} className="flex items-center justify-center">
                            View 
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 