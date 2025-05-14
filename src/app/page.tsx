"use client";

import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeatureCard } from "@/components/landing/feature-card";
import { HowItWorksCard } from "@/components/landing/how-it-works-card";
import { PillarCard } from "@/components/landing/pillar-card";
import { PricingSection } from "@/components/landing/pricing-section";
import { Footer } from "@/components/layout/footer";
import { 
  Zap, 
  LineChart, 
  Users, 
  Layers, 
  Code, 
  FileCheck,
  BrainCircuit,
  Target,
  ArrowUpRight,
  PieChart,
  Lightbulb,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const features = [
    {
      title: "Instant Idea Analysis",
      description: "Get comprehensive validation of your SaaS idea within minutes, not weeks or months of market research.",
      icon: Zap
    },
    {
      title: "Six-Pillar Validation",
      description: "Analyze your idea through six core dimensions: Market, Problem, Solution, Business Model, Tech, and Team.",
      icon: LineChart
    },
    {
      title: "AI-Generated Blueprints",
      description: "Receive a complete business plan, tech stack, user flow diagrams, and implementation roadmap.",
      icon: BrainCircuit
    },
    {
      title: "Target Customer Insights",
      description: "Understand your ideal customers and how to create a compelling value proposition.",
      icon: Target
    },
    {
      title: "Tech Stack Recommendations",
      description: "Get tailored technology recommendations based on your specific requirements and constraints.",
      icon: Code
    },
    {
      title: "Actionable Project Plan",
      description: "Transform ideas into execution with a Kanban board of prioritized tasks to make progress fast.",
      icon: FileCheck
    }
  ];
  
  const howItWorks = [
    {
      step: 1,
      title: "Describe Your Idea",
      description: "Simply enter your SaaS idea in plain language. Our AI will understand the concept and its context."
    },
    {
      step: 2,
      title: "AI Analysis",
      description: "Our algorithm runs your idea through the six-pillar validation framework to identify strengths and weaknesses."
    },
    {
      step: 3,
      title: "Review Validation",
      description: "Explore a detailed validation report with scores and actionable insights for each business dimension."
    },
    {
      step: 4,
      title: "Generate Blueprint",
      description: "With one click, create a comprehensive blueprint including tech stack, user flows, and implementation plan."
    }
  ];
  
  const pillars = [
    {
      title: "Market Opportunity",
      description: "Evaluate market size, growth trends, and competitive landscape to determine if your idea has sufficient potential.",
      icon: PieChart
    },
    {
      title: "Problem Validation",
      description: "Verify that your idea solves a real, painful, and frequent problem that customers are willing to pay for.",
      icon: Lightbulb
    },
    {
      title: "Solution Fit",
      description: "Assess whether your proposed solution effectively addresses the problem in a unique and valuable way.",
      icon: Target
    },
    {
      title: "Business Model",
      description: "Analyze pricing strategy, revenue streams, and cost structure to ensure sustainable growth and profitability.",
      icon: LineChart
    },
    {
      title: "Technical Feasibility",
      description: "Evaluate the technical requirements, complexity, and resources needed to build and scale your solution.",
      icon: Code
    },
    {
      title: "Team Capability",
      description: "Identify the skills and experience needed to execute your vision successfully and reach product-market fit.",
      icon: ShieldCheck
    }
  ];
  
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNavbar />
      
      <main className="flex-1">
        <HeroSection />
        
        {/* Features section */}
        <section id="features" className="py-20 relative">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute left-0 bottom-0 w-72 h-72 rounded-full bg-blue-200 blur-3xl dark:bg-blue-900/40" />
          </div>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Everything you need to validate your SaaS idea and create a comprehensive implementation blueprint.
                </p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <FeatureCard 
                  key={i}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* How it works section */}
        <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900/50 relative">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-purple-200 blur-3xl dark:bg-purple-900/40" />
          </div>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Four simple steps to transform your idea into a validated blueprint.
                </p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step, i) => (
                <HowItWorksCard 
                  key={i}
                  step={step.step}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Six Pillars Section */}
        <section id="validation-pillars" className="py-20 relative">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute left-0 bottom-0 w-72 h-72 rounded-full bg-green-200 blur-3xl dark:bg-green-900/40" />
            <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-blue-200 blur-3xl dark:bg-blue-900/40" />
          </div>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Six Validation Pillars</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Our comprehensive framework analyzes your idea across these critical dimensions.
                </p>
              </motion.div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map((pillar, i) => (
                <PillarCard 
                  key={i}
                  title={pillar.title}
                  description={pillar.description}
                  icon={pillar.icon}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <PricingSection />
      </main>
      
      <Footer />
    </div>
  );
}
