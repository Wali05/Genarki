"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
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
import { Loader2, Sparkles, BrainCircuit, CheckCircle, Layers, Code, LineChart, Users, Zap, Lightbulb } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { 
  testSupabaseConnection, 
  prepareIdeaData, 
  prepareBlueprintData 
} from "@/lib/supabase-helpers";

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
  const { user } = useUser();
  
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
      let savedIdeaId = tempId;
      
      // Store in session storage for backup and offline use
      sessionStorage.setItem('currentIdea', JSON.stringify({
        id: tempId,
        title: values.title,
        description: values.description,
        validation_score: (blueprint as any).validation.score,
        created_at: new Date().toISOString(),
      }));
      
      sessionStorage.setItem('currentBlueprint', JSON.stringify(blueprint));
      
      // If user is logged in, save to Supabase
      if (user) {
        try {
          console.log("User information:", { 
            id: user.id, 
            firstName: user.firstName, 
            email: user.emailAddresses?.[0]?.emailAddress 
          });
          
          // Step 1: Test Supabase connection
          const connectionTest = await testSupabaseConnection();
          console.log("Supabase connection test result:", connectionTest);
          
          if (!connectionTest.connected) {
            throw new Error(`Supabase connection error: ${connectionTest.message}`);
          }
          
          // Step 2: Extract validation score from blueprint
          let validationScore = 5; // Default score
          try {
            if (blueprint?.validation?.score) {
              validationScore = Number(blueprint.validation.score);
              if (isNaN(validationScore)) validationScore = 5;
            }
          } catch (e) {
            console.warn("Error parsing validation score, using default value", e);
          }
          
          // Step 3: Prepare cleaned idea data with helper function
          const ideaData = prepareIdeaData(
            values.title, 
            values.description, 
            user.id, 
            validationScore
          );
          
          console.log("Inserting idea with prepared data:", ideaData);
          
          // Step 4: Insert the idea
          const { data: ideaResult, error: ideaError } = await supabase
            .from('ideas')
            .insert([ideaData])
            .select('id')
            .single();
          
          // Handle idea insertion error with detailed logging
          if (ideaError) {
            console.error("Supabase idea insertion error details:", {
              code: ideaError.code,
              message: ideaError.message,
              details: ideaError.details,
              hint: ideaError.hint
            });
            
            // Check for common error types
            if (ideaError.code === '23505') {
              toast.error("A project with this title already exists");
            } else if (ideaError.code === '42501') {
              toast.error("Permission denied. Check RLS policies in Supabase.");
            } else {
              toast.error(`Database error: ${ideaError.message || "Unknown error"}`);
            }
            
            throw new Error(`Failed to save idea: ${ideaError.message}`);
          }
          
          // Step 5: If we get here, idea insertion was successful
          if (!ideaResult || !ideaResult.id) {
            throw new Error("Idea saved but no ID was returned");
          }
          
          const savedIdeaId = ideaResult.id;
          console.log("Idea saved successfully with ID:", savedIdeaId);
          
          // Step 6: Prepare blueprint data with helper function
          const blueprintData = prepareBlueprintData(savedIdeaId, blueprint);
          
          console.log("Inserting blueprint with prepared data");
          
          // Step 7: Insert the blueprint
          const { error: blueprintError } = await supabase
            .from('blueprints')
            .insert([blueprintData]);
          
          // Handle blueprint insertion error
          if (blueprintError) {
            console.error("Blueprint insertion error:", {
              code: blueprintError.code,
              message: blueprintError.message,
              details: blueprintError.details,
              hint: blueprintError.hint
            });
            
            toast.warning("Project saved but blueprint details may be incomplete");
          } else {
            console.log("Blueprint saved successfully");
            toast.success("Project saved to your account!", {
              duration: 3000,
              position: "top-center",
              style: { backgroundColor: "#4ade80", color: "white" }
            });
          }
          
          // Update session storage with real ID
          sessionStorage.setItem('currentIdea', JSON.stringify({
            id: savedIdeaId,
            title: values.title,
            description: values.description,
            validation_score: validationScore,
            created_at: new Date().toISOString(),
          }));
          
        } catch (dbError: any) {
          console.error("Database operation failed:", dbError);
          toast.error(`Database error: ${dbError.message || "Unknown error"}`);
          
          // Continue with session storage as fallback
          console.log("Using session storage as fallback due to database error");
        }
      } else {
        console.log("User not logged in. Using session storage only.");
        toast.info("Sign in to save your projects permanently!", {
          duration: 5000,
          position: "top-center"
        });
      }
      
      toast.success("Blueprint generated successfully!", {
        duration: 3000,
        position: "top-center",
        style: { backgroundColor: "#4ade80", color: "white" }
      });
      
      // Navigate to the new idea page after a short delay for the toast to be seen
      setTimeout(() => {
        router.push(`/idea/${savedIdeaId}`);
      }, 1500);
    } catch (error) {
      console.error("Error generating blueprint:", error);
      toast.error("Failed to generate blueprint. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: { backgroundColor: "#f43f5e", color: "white" }
      });
      setShowForm(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-10 px-4">
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
                  <BrainCircuit className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400"
                >
                  Generate Your SaaS Blueprint
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-slate-600 dark:text-slate-400 mt-2"
                >
                  Share your idea and let AI craft a comprehensive blueprint
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Card className="border shadow-lg bg-card">
                  <CardHeader>
                    <CardTitle>Tell us about your idea</CardTitle>
                    <CardDescription>
                      Provide details about your SaaS concept and our AI will validate and blueprint it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Idea Title</FormLabel>
                              <FormControl>
                                <Input placeholder="E.g., Subscription Management Platform" {...field} />
                              </FormControl>
                              <FormDescription>
                                The name or title of your SaaS idea
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe your SaaS idea in detail. What problem does it solve? Who is it for? What are the main features you envision?" 
                                  className="min-h-32" 
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
                        
                        <div className="flex justify-center pt-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              type="submit" 
                              size="lg"
                              disabled={isGenerating}
                              className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-medium px-8 py-6"
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
                                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"
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
                    Our AI analyzes your idea across 6 core pillars to create your blueprint
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
              <Card className="border shadow-lg bg-card overflow-hidden">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Generating Your Blueprint</CardTitle>
                  <CardDescription>
                    Our AI is analyzing your idea and creating a comprehensive blueprint
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Animated brain visualization */}
                  <div className="relative w-full h-40 bg-slate-50 dark:bg-slate-800/50 rounded-xl overflow-hidden flex items-center justify-center mb-6">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    
                    {/* Animated brain particles */}
                    <div className="relative w-20 h-20">
                      <motion.div
                        className="absolute w-20 h-20 rounded-full bg-blue-500/20"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 3,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full bg-blue-500"
                          style={{ 
                            top: '50%', 
                            left: '50%',
                            x: '-50%',
                            y: '-50%',
                          }}
                          animate={{ 
                            x: [
                              `calc(-50% + ${Math.cos(i * 36 * Math.PI / 180) * 40}px)`,
                              `calc(-50% + ${Math.cos((i * 36 + 180) * Math.PI / 180) * 40}px)`,
                              `calc(-50% + ${Math.cos(i * 36 * Math.PI / 180) * 40}px)`
                            ],
                            y: [
                              `calc(-50% + ${Math.sin(i * 36 * Math.PI / 180) * 40}px)`,
                              `calc(-50% + ${Math.sin((i * 36 + 180) * Math.PI / 180) * 40}px)`,
                              `calc(-50% + ${Math.sin(i * 36 * Math.PI / 180) * 40}px)`
                            ],
                            opacity: [0.2, 1, 0.2],
                            scale: [0.8, 1.2, 0.8]
                          }}
                          transition={{ 
                            repeat: Infinity,
                            duration: 5 + (i % 3),
                            ease: "easeInOut",
                            delay: i * 0.2
                          }}
                        />
                      ))}
                      
                      <BrainCircuit className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-blue-500" />
                    </div>
                    
                    {/* Random neural connections */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={`line-${i}`}
                        className="absolute h-px bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0"
                        style={{ 
                          width: `${30 + Math.random() * 150}px`,
                          transform: `rotate(${Math.random() * 360}deg)`,
                          left: `${Math.random() * 80}%`,
                          top: `${Math.random() * 80}%`,
                        }}
                        animate={{ 
                          opacity: [0, 0.8, 0],
                          scaleX: [0.3, 1, 0.3],
                        }}
                        transition={{ 
                          repeat: Infinity,
                          duration: 2 + Math.random() * 2,
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
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  {/* Steps */}
                  <div className="space-y-3 mt-4">
                    {generationSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0.5 }}
                        animate={{ 
                          opacity: currentStep >= index ? 1 : 0.5,
                          x: currentStep === index ? 5 : 0
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          currentStep === index 
                            ? 'bg-blue-50 dark:bg-blue-950/20' 
                            : currentStep > index
                            ? 'text-slate-400 dark:text-slate-600' 
                            : ''
                        }`}
                      >
                        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                          {currentStep > index ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
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
                            >
                              <Loader2 className="h-5 w-5 text-blue-500" />
                            </motion.div>
                          ) : (
                            step.icon
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
                <CardFooter className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
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
    </MainLayout>
  );
} 