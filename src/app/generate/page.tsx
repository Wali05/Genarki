"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Sparkles, 
  BrainCircuit, 
  CheckCircle, 
  Layers, 
  Code, 
  LineChart, 
  Users, 
  Zap, 
  Lightbulb,
  Rocket,
  Star,
  Target,
  TrendingUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/auth-context";
import { databaseService } from "@/lib/database-service";
import { BackButton } from "@/components/ui/back-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

// Steps in the generation process
const generationSteps = [
  { 
    id: "analyze", 
    title: "Analyzing project description", 
    icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
    duration: 1500
  },
  { 
    id: "name", 
    title: "Generating project name", 
    icon: <BrainCircuit className="h-5 w-5 text-purple-500" />,
    duration: 1200
  },
  { 
    id: "features", 
    title: "Identifying core features", 
    icon: <Layers className="h-5 w-5 text-indigo-500" />,
    duration: 2000
  },
  { 
    id: "technical", 
    title: "Determining technical requirements", 
    icon: <Code className="h-5 w-5 text-green-500" />,
    duration: 1800
  },
  { 
    id: "market", 
    title: "Analyzing market potential", 
    icon: <LineChart className="h-5 w-5 text-orange-500" />,
    duration: 1700
  },
  { 
    id: "audience", 
    title: "Identifying target audience", 
    icon: <Users className="h-5 w-5 text-red-500" />,
    duration: 1500
  },
  { 
    id: "pricing", 
    title: "Developing pricing strategy", 
    icon: <Zap className="h-5 w-5 text-amber-500" />,
    duration: 1800
  }
];

// Function to generate blueprint using the Gemini API
const generateRealBlueprint = async (title: string, description: string) => {
  // Call our API endpoint which interfaces with Gemini
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate blueprint');
  }

  const result = await response.json();
  return result.data;
};

export default function GeneratePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [showForm, setShowForm] = useState(true);
  const { user } = useAuth();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Effect to handle step progression in the generation process
  useEffect(() => {
    if (!isGenerating) return;
    
    let currentStepIndex = 0;
    let totalDuration = generationSteps.reduce((sum, step) => sum + step.duration, 0);
    let elapsedTime = 0;
    
    // Update the current step and progress
    const updateStep = () => {
      if (currentStepIndex >= generationSteps.length) return;
      
      const step = generationSteps[currentStepIndex];
      setCurrentStep(currentStepIndex);
      
      setTimeout(() => {
        elapsedTime += step.duration;
        setProgress(Math.min(Math.floor((elapsedTime / totalDuration) * 100), 100));
        currentStepIndex++;
        if (currentStepIndex < generationSteps.length) {
          updateStep();
        }
      }, step.duration);
    };
    
    updateStep();
  }, [isGenerating]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsGenerating(true);
      setShowForm(false);
      setProgress(0);
      
      // Generate blueprint with real AI call to Gemini
      const blueprint = await generateRealBlueprint(values.title, values.description);
      
      // Generate a random ID for local storage
      const tempId = Math.random().toString(36).substring(2, 10);
      
      // Store in session storage for preview - we'll only save to database when user explicitly saves
      sessionStorage.setItem('currentIdea', JSON.stringify({
        id: tempId,
        title: values.title,
        description: values.description,
        validation_score: (blueprint as any).validation.score,
        created_at: new Date().toISOString(),
      }));
      
      sessionStorage.setItem('currentBlueprint', JSON.stringify(blueprint));
      
      // Flag to indicate this is a newly generated, unsaved project
      sessionStorage.setItem('projectSaved', 'false');
      
      // Automatically save to database for authenticated users
      if (user) {
        try {
          // Save the idea to the database immediately
          const { data: ideaData, error: ideaError } = await databaseService.saveIdea(
            values.title,
            values.description,
            (blueprint as any).validation.score
          );
          
          if (ideaError) throw ideaError;
          
          // Save the blueprint with the idea ID
          const { error: blueprintError } = await databaseService.saveBlueprint(
            ideaData.id,
            blueprint
          );
          
          if (blueprintError) throw blueprintError;
          
          // Use the real ID from the database
          sessionStorage.setItem('currentIdea', JSON.stringify({
            ...ideaData,
            validation_score: (blueprint as any).validation.score,
          }));
          
          sessionStorage.setItem('currentBlueprint', JSON.stringify(blueprint));
          
          // Mark as saved
          sessionStorage.setItem('projectSaved', 'true');
          
          // Complete the generation animation then navigate
          setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
              router.push(`/idea/${ideaData.id}`);
            }, 500);
          }, 1500);
          
        } catch (error: any) {
          console.error("Error saving to database:", error);
          toast.error(`Error saving project: ${error.message}`);
          
          // Still navigate to the temporary idea in case of error
          setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
              router.push(`/idea/${tempId}`);
            }, 500);
          }, 1500);
        }
      } else {
        // For demo mode when not authenticated
        // Complete the generation animation
        setTimeout(() => {
          setProgress(100);
          setTimeout(() => {
            // Navigate to the idea detail page
            router.push(`/idea/${tempId}`);
          }, 500);
        }, 1500);
      }
      
    } catch (error: any) {
      setIsGenerating(false);
      setShowForm(true);
      console.error("Blueprint generation error:", error);
      toast.error(`Failed to generate blueprint: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div className="container mx-auto">
        <header className="px-6 py-4 flex justify-between items-center">
          <BackButton href="/dashboard" label="Back to Dashboard" />
          <ThemeToggle />
        </header>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/10 dark:bg-blue-500/5"
            style={{
              width: `${20 + Math.random() * 100}px`,
              height: `${20 + Math.random() * 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 10,
            }}
          />
        ))}
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-10 px-4 relative z-10">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-2 inline-block"
                >
                  <motion.div 
                    animate={{ 
                      rotate: [0, 10, 0, -10, 0],
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative"
                  >
                    <div className="absolute -inset-4 rounded-full bg-blue-400/20 blur-xl animate-pulse"></div>
                    <BrainCircuit className="h-16 w-16 mx-auto text-blue-500 relative z-10" />
                  </motion.div>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Generate Your SaaS Blueprint
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-slate-600 dark:text-slate-300 mt-3 text-lg"
                >
                  Share your idea and let AI craft a comprehensive blueprint
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="border shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                      <Rocket className="h-5 w-5 text-purple-500" />
                      <span>Tell us about your idea</span>
                    </CardTitle>
                    <CardDescription className="text-base">
                      Provide details about your SaaS concept and our AI will validate and blueprint it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5">
                                  <Star className="h-4 w-4 text-amber-500" />
                                  Idea Title
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="E.g., Subscription Management Platform" 
                                    className="bg-white/80 dark:bg-gray-950/50 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  The name or title of your SaaS idea
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <motion.div
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1.5">
                                  <Target className="h-4 w-4 text-green-500" />
                                  Description
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Describe your SaaS idea in detail. What problem does it solve? Who is it for? What are the main features you envision?" 
                                    className="min-h-32 bg-white/80 dark:bg-gray-950/50 border-blue-200 dark:border-blue-900 focus-visible:ring-blue-500" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormDescription>
                                  The more details you provide, the better blueprint our AI can generate
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                        
                        <div className="flex justify-center pt-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              type="submit" 
                              size="lg"
                              disabled={isGenerating}
                              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium px-8 py-6 rounded-xl shadow-lg shadow-blue-500/20 dark:shadow-blue-800/30"
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  <span>Generating Blueprint...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-5 w-5" />
                                  <span>Generate Blueprint</span>
                                </>
                              )}
                              
                              {!isGenerating && (
                                <motion.span 
                                  className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                                  initial={{ x: '-100%', opacity: 0.5 }}
                                  animate={{ 
                                    x: ['-100%', '100%'],
                                    opacity: [0.2, 0.3, 0.2]
                                  }}
                                  transition={{ 
                                    repeat: Infinity, 
                                    duration: 2.5,
                                    ease: "linear"
                                  }}
                                />
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span>Our AI analyzes your idea across 6 core pillars to create your blueprint</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden">
                <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-blue-100 dark:border-blue-800">
                  <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    Generating Your Blueprint
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                    Our AI is analyzing your idea and creating a comprehensive blueprint
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-8">
                  {/* Enhanced animated brain visualization */}
                  <div className="relative w-full h-56 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl overflow-hidden flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.1)_0%,_transparent_70%)] opacity-70"></div>
                    
                    {/* Grid lines */}
                    <div className="absolute inset-0">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.div
                          key={`grid-h-${i}`}
                          className="absolute left-0 right-0 h-px bg-blue-200/30 dark:bg-blue-700/20"
                          style={{ top: `${i * 10}%` }}
                          animate={{ 
                            opacity: [0.3, 0.8, 0.3], 
                            scaleX: [0.9, 1, 0.9] 
                          }}
                          transition={{ 
                            duration: 3 + i % 3, 
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.div
                          key={`grid-v-${i}`}
                          className="absolute top-0 bottom-0 w-px bg-blue-200/30 dark:bg-blue-700/20"
                          style={{ left: `${i * 10}%` }}
                          animate={{ 
                            opacity: [0.3, 0.8, 0.3], 
                            scaleY: [0.9, 1, 0.9] 
                          }}
                          transition={{ 
                            duration: 3 + i % 3, 
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Animated brain particles */}
                    <div className="relative w-24 h-24">
                      <motion.div
                        className="absolute w-32 h-32 rounded-full bg-blue-500/20 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                        animate={{ 
                          scale: [1, 1.4, 1],
                          opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 4,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"
                          style={{ 
                            top: '50%', 
                            left: '50%',
                            x: '-50%',
                            y: '-50%',
                          }}
                          animate={{ 
                            x: [
                              `calc(-50% + ${Math.cos(i * 24 * Math.PI / 180) * 50}px)`,
                              `calc(-50% + ${Math.cos((i * 24 + 180) * Math.PI / 180) * 50}px)`,
                              `calc(-50% + ${Math.cos(i * 24 * Math.PI / 180) * 50}px)`
                            ],
                            y: [
                              `calc(-50% + ${Math.sin(i * 24 * Math.PI / 180) * 50}px)`,
                              `calc(-50% + ${Math.sin((i * 24 + 180) * Math.PI / 180) * 50}px)`,
                              `calc(-50% + ${Math.sin(i * 24 * Math.PI / 180) * 50}px)`
                            ],
                            opacity: [0.4, 1, 0.4],
                            scale: [0.8, 1.5, 0.8],
                            boxShadow: [
                              '0 0 0px rgba(59, 130, 246, 0.4)',
                              '0 0 8px rgba(59, 130, 246, 0.7)',
                              '0 0 0px rgba(59, 130, 246, 0.4)'
                            ]
                          }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 5 + (i % 5),
                            ease: "easeInOut",
                            delay: i * 0.2
                          }}
                        />
                      ))}
                      
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut"
                        }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <BrainCircuit className="h-12 w-12 text-blue-500" />
                      </motion.div>
                    </div>
                    
                    {/* Neural connections */}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div
                        key={`line-${i}`}
                        className="absolute h-px bg-gradient-to-r from-blue-500/0 via-blue-500/70 to-blue-500/0"
                        style={{ 
                          width: `${60 + Math.random() * 200}px`,
                          transform: `rotate(${Math.random() * 360}deg)`,
                          left: `${Math.random() * 85}%`,
                          top: `${Math.random() * 85}%`,
                        }}
                        animate={{ 
                          opacity: [0, 0.9, 0],
                          width: [`${60 + Math.random() * 100}px`, `${100 + Math.random() * 200}px`, `${60 + Math.random() * 100}px`],
                          boxShadow: [
                            '0 0 0px rgba(59, 130, 246, 0)',
                            '0 0 3px rgba(59, 130, 246, 0.5)',
                            '0 0 0px rgba(59, 130, 246, 0)'
                          ]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 2 + Math.random() * 3,
                          ease: "easeInOut",
                          delay: Math.random() * 2
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${progress}%` }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  
                  {/* Steps */}
                  <div className="space-y-3 mt-4">
                    {generationSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0.5, x: -10 }}
                        animate={{ 
                          opacity: currentStep >= index ? 1 : 0.5,
                          x: currentStep === index ? 5 : 0,
                          backgroundColor: currentStep === index 
                            ? 'rgba(59, 130, 246, 0.1)' 
                            : 'rgba(59, 130, 246, 0)'
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          currentStep === index 
                            ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30' 
                            : currentStep > index
                            ? 'text-slate-400 dark:text-slate-600' 
                            : ''
                        }`}
                      >
                        <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full">
                          {currentStep > index ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </motion.div>
                          ) : currentStep === index ? (
                            <motion.div
                              animate={{ 
                                rotate: 360,
                              }}
                              transition={{ 
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "linear"
                              }}
                              className="relative"
                            >
                              <Loader2 className="h-5 w-5 text-blue-500" />
                              <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/20 delay-300"></div>
                            </motion.div>
                          ) : (
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 5 }}
                              className="opacity-60"
                            >
                              {step.icon}
                            </motion.div>
                          )}
                        </div>
                        <span className={`text-sm ${
                          currentStep === index 
                            ? 'font-medium text-blue-800 dark:text-blue-300' 
                            : ''
                        }`}>
                          {step.title}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-gray-500 dark:text-gray-400 py-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-1">
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ repeat: Infinity, duration: 1 }} 
                      className="h-2 w-2 bg-blue-500 rounded-full"
                    />
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} 
                      className="h-2 w-2 bg-blue-500 rounded-full"
                    />
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} 
                      className="h-2 w-2 bg-blue-500 rounded-full"
                    />
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 