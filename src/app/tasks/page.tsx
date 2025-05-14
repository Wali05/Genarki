"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PlusCircle, 
  Search, 
  ListTodo, 
  Code, 
  Clock, 
  AlertCircle, 
  Tag, 
  XCircle,
  Clock3,
  CheckCircle,
  FilterX,
  Trash2,
  Paintbrush,
  Users,
  Server,
  FileText,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  status: 'Todo' | 'In Progress' | 'Done';
  project: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const { user } = useUser();

  useEffect(() => {
    async function fetchTasks() {
      setLoading(true);
      
      try {
        if (!user) {
          // If no user is logged in, use session storage for development
          const storedBlueprint = sessionStorage.getItem('currentBlueprint');
          
          if (storedBlueprint) {
            try {
              const parsedBlueprint = JSON.parse(storedBlueprint);
              const storedIdea = sessionStorage.getItem('currentIdea');
              
              if (storedIdea && parsedBlueprint.tasks && parsedBlueprint.tasks.length > 0) {
                const parsedIdea = JSON.parse(storedIdea);
                
                // Convert blueprint tasks to our Task format
                const blueprintTasks = parsedBlueprint.tasks.map((task: any, index: number) => ({
                  id: `${parsedIdea.id}-task-${index}`,
                  title: task.title,
                  description: task.description || "",
                  priority: task.priority || "Medium",
                  category: task.category || "General",
                  status: task.status || "Todo",
                  project: parsedIdea.title
                }));
                
                setTasks(blueprintTasks);
              } else {
                setTasks([]);
              }
            } catch (error) {
              console.error("Error parsing stored blueprint:", error);
              setTasks([]);
            }
          } else {
            setTasks([]);
          }
          setLoading(false);
          return;
        }
        
        // Fetch ideas from Supabase to get project names
        const { data: ideasData, error: ideasError } = await supabase
          .from('ideas')
          .select('id, title')
          .eq('user_id', user.id);
        
        if (ideasError) {
          console.error("Error fetching ideas:", ideasError);
          toast.error("Failed to load projects");
          setTasks([]);
          setLoading(false);
          return;
        }
        
        // Create a map of idea IDs to titles
        const projectTitles = new Map(ideasData?.map(idea => [idea.id, idea.title]) || []);
        
        // Fetch blueprints to get tasks
        const { data: blueprintsData, error: blueprintsError } = await supabase
          .from('blueprints')
          .select('idea_id, tasks')
          .in('idea_id', ideasData?.map(idea => idea.id) || []);
        
        if (blueprintsError) {
          console.error("Error fetching blueprints:", blueprintsError);
          toast.error("Failed to load tasks");
          setTasks([]);
          setLoading(false);
          return;
        }
        
        // Extract and format tasks from all blueprints
        const allTasks: Task[] = [];
        
        blueprintsData?.forEach(blueprint => {
          if (blueprint.tasks && Array.isArray(blueprint.tasks) && blueprint.tasks.length > 0) {
            const projectName = projectTitles.get(blueprint.idea_id) || "Unknown Project";
            
            const blueprintTasks = blueprint.tasks.map((task: any, index: number) => ({
              id: `${blueprint.idea_id}-task-${index}`,
              title: task.title,
              description: task.description || "",
              priority: task.priority || "Medium",
              category: task.category || "General",
              status: task.status || "Todo",
              project: projectName
            }));
            
            allTasks.push(...blueprintTasks);
          }
        });
        
        setTasks(allTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTasks();
  }, [user]);

  const updateTaskStatus = async (taskId: string, newStatus: 'Todo' | 'In Progress' | 'Done') => {
    try {
      // Update the task in local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
      
      toast.success(`Task updated to ${newStatus}`);
      
      // If using Supabase, update the task in the database
      if (user) {
        const [ideaId, _] = taskId.split('-task-');
        const taskIndex = parseInt(taskId.split('-task-')[1]);
        
        // Get the current blueprint
        const { data: blueprint, error: getError } = await supabase
          .from('blueprints')
          .select('tasks')
          .eq('idea_id', ideaId)
          .single();
        
        if (getError) {
          console.error("Error fetching blueprint:", getError);
          toast.error("Failed to update task on server");
          return;
        }
        
        if (blueprint && blueprint.tasks && Array.isArray(blueprint.tasks)) {
          // Update the task status
          const updatedTasks = [...blueprint.tasks];
          if (updatedTasks[taskIndex]) {
            updatedTasks[taskIndex].status = newStatus;
            
            // Save the updated tasks back to Supabase
            const { error: updateError } = await supabase
              .from('blueprints')
              .update({ tasks: updatedTasks })
              .eq('idea_id', ideaId);
            
            if (updateError) {
              console.error("Error updating tasks:", updateError);
              toast.error("Failed to update task on server");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      // Remove from local state
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success("Task deleted successfully");
      
      // If using Supabase, update the tasks in the database
      if (user) {
        const [ideaId, _] = taskId.split('-task-');
        const taskIndex = parseInt(taskId.split('-task-')[1]);
        
        // Get the current blueprint
        const { data: blueprint, error: getError } = await supabase
          .from('blueprints')
          .select('tasks')
          .eq('idea_id', ideaId)
          .single();
        
        if (getError) {
          console.error("Error fetching blueprint:", getError);
          toast.error("Failed to delete task on server");
          return;
        }
        
        if (blueprint && blueprint.tasks && Array.isArray(blueprint.tasks)) {
          // Remove the task
          const updatedTasks = blueprint.tasks.filter((_, index) => index !== taskIndex);
          
          // Save the updated tasks back to Supabase
          const { error: updateError } = await supabase
            .from('blueprints')
            .update({ tasks: updatedTasks })
            .eq('idea_id', ideaId);
          
          if (updateError) {
            console.error("Error updating tasks:", updateError);
            toast.error("Failed to delete task on server");
          }
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const getFilteredTasks = (status: 'Todo' | 'In Progress' | 'Done') => {
    return tasks.filter(task => 
      task.status === status &&
      (searchTerm === "" || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        task.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (projectFilter === "all" || task.project === projectFilter) &&
      (categoryFilter === "all" || task.category === categoryFilter) &&
      (priorityFilter === "all" || task.priority === priorityFilter)
    );
  };

  const projects = Array.from(new Set(tasks.map(task => task.project)));
  const categories = Array.from(new Set(tasks.map(task => task.category)));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500";
      case "Medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500";
      case "Low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "development": return <Code className="h-4 w-4 text-blue-500" />;
      case "design": return <Paintbrush className="h-4 w-4 text-purple-500" />;
      case "ux": return <Users className="h-4 w-4 text-pink-500" />;
      case "devops": return <Server className="h-4 w-4 text-green-500" />;
      case "documentation": return <FileText className="h-4 w-4 text-amber-500" />;
      default: return <Tag className="h-4 w-4 text-gray-500" />;
    }
  };

  const todoTasks = getFilteredTasks("Todo");
  const inProgressTasks = getFilteredTasks("In Progress");
  const doneTasks = getFilteredTasks("Done");

  return (
    <DashboardLayout>
      <div className="container py-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">Task Board</h1>
            <p className="text-muted-foreground">Manage and organize your project tasks</p>
          </div>
          
          <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 shrink-0 shadow-sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tasks..." 
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project}>{project}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          </div>
        ) : todoTasks.length === 0 && inProgressTasks.length === 0 && doneTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed shadow-sm"
          >
            <ListTodo className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No tasks found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-lg mx-auto">
              {searchTerm || projectFilter !== "all" || categoryFilter !== "all" || priorityFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Start by adding tasks to your projects to track progress and manage development"}
            </p>
            {searchTerm || projectFilter !== "all" || categoryFilter !== "all" || priorityFilter !== "all" ? (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setProjectFilter("all");
                  setCategoryFilter("all");
                  setPriorityFilter("all");
                }}
                className="shadow-sm"
              >
                <FilterX className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            ) : (
              <Button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 shadow-sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First Task
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="border border-amber-100 dark:border-amber-900/20 shadow-sm">
              <CardHeader className="pb-3 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <ListTodo className="h-5 w-5 mr-2 text-amber-500" />
                    To Do
                    <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full px-2 py-0.5">
                      {todoTasks.length}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 overflow-y-auto max-h-[600px]">
                <AnimatePresence>
                  <div className="space-y-3">
                    {todoTasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                      >
                        <TaskCard 
                          task={task} 
                          onStatusChange={updateTaskStatus}
                          onDelete={deleteTask}
                          getPriorityColor={getPriorityColor}
                          getCategoryIcon={getCategoryIcon}
                        />
                      </motion.div>
                    ))}
                    
                    {todoTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No tasks in this column
                      </div>
                    )}
                  </div>
                </AnimatePresence>
              </CardContent>
            </Card>
            
            <Card className="border border-blue-100 dark:border-blue-900/20 shadow-sm">
              <CardHeader className="pb-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Clock3 className="h-5 w-5 mr-2 text-blue-500" />
                    In Progress
                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-full px-2 py-0.5">
                      {inProgressTasks.length}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 overflow-y-auto max-h-[600px]">
                <AnimatePresence>
                  <div className="space-y-3">
                    {inProgressTasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                      >
                        <TaskCard 
                          task={task} 
                          onStatusChange={updateTaskStatus}
                          onDelete={deleteTask}
                          getPriorityColor={getPriorityColor}
                          getCategoryIcon={getCategoryIcon}
                        />
                      </motion.div>
                    ))}
                    
                    {inProgressTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No tasks in this column
                      </div>
                    )}
                  </div>
                </AnimatePresence>
              </CardContent>
            </Card>
            
            <Card className="border border-green-100 dark:border-green-900/20 shadow-sm">
              <CardHeader className="pb-3 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Done
                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full px-2 py-0.5">
                      {doneTasks.length}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-3 overflow-y-auto max-h-[600px]">
                <AnimatePresence>
                  <div className="space-y-3">
                    {doneTasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.2 }}
                      >
                        <TaskCard 
                          task={task} 
                          onStatusChange={updateTaskStatus}
                          onDelete={deleteTask}
                          getPriorityColor={getPriorityColor}
                          getCategoryIcon={getCategoryIcon}
                        />
                      </motion.div>
                    ))}
                    
                    {doneTasks.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No tasks in this column
                      </div>
                    )}
                  </div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

// TaskCard component
function TaskCard({ 
  task, 
  onStatusChange, 
  onDelete, 
  getPriorityColor, 
  getCategoryIcon 
}: { 
  task: Task; 
  onStatusChange: (id: string, status: 'Todo' | 'In Progress' | 'Done') => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  getCategoryIcon: (category: string) => React.ReactNode;
}) {
  return (
    <Card className="border-t-4 border-t-blue-500 hover:shadow-md transition-all duration-300 group/card">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{task.title}</h3>
          <div className="opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" 
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <div className="flex items-center">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {getCategoryIcon(task.category)}
            <span>{task.category}</span>
          </div>
          
          <div className="ml-auto text-xs text-muted-foreground truncate max-w-[100px]">
            {task.project}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-t-slate-100 dark:border-t-slate-800">
          <Select 
            value={task.status} 
            onValueChange={(value) => onStatusChange(task.id, value as 'Todo' | 'In Progress' | 'Done')}
          >
            <SelectTrigger className="h-7 text-xs px-2 py-0">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todo">To Do</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
} 