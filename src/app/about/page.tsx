import { MainLayout } from "@/components/layout/main-layout";
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container py-16 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Genarki</h1>
        
        <div className="prose dark:prose-invert max-w-none mb-12">
          <p className="text-lg leading-relaxed mb-6">
            Genarki is an AI-powered SaaS validation and blueprint generation platform designed to help entrepreneurs
            validate their business ideas and create comprehensive implementation plans in minutes.
          </p>
          <p className="mb-6">
            Our mission is to empower entrepreneurs by eliminating the guesswork from SaaS development,
            allowing them to focus on building products that solve real problems and have a higher likelihood
            of success in the market.
          </p>
          <p>
            With Genarki, you can:
          </p>
          <ul className="my-4">
            <li>Validate your SaaS idea through a rigorous six-pillar analysis</li>
            <li>Generate detailed tech stack recommendations</li>
            <li>Create user flow diagrams that help visualize the user experience</li>
            <li>Develop a project roadmap with tasks organized in a Kanban board</li>
            <li>Get market validation insights to refine your concept</li>
            <li>Build a business model canvas that outlines your value proposition and revenue streams</li>
          </ul>
        </div>
        
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold mb-6">Meet the Creator</h2>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-40 h-40 rounded-xl overflow-hidden relative mb-4 md:mb-0 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400 opacity-20"></div>
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-4xl font-bold text-gray-400">
                WH
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">Wali Ahed Hussain</h3>
              <p className="text-muted-foreground mb-4">Founder & Developer</p>
              
              <p className="mb-4">
                Wali is a passionate developer and entrepreneur focused on creating tools that empower others
                to build successful businesses. With expertise in AI, web development, and SaaS platforms,
                he created Genarki to solve the challenges he faced when validating his own startup ideas.
              </p>
              
              <div className="flex space-x-4 mb-6">
                <a 
                  href="https://github.com/Wali05" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-blue-600 transition-colors"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/wali-ahed-hussain-41b549252/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
              
              <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300">
                <Link href="/contact">Contact Wali</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-12 mt-12">
          <h2 className="text-2xl font-bold mb-6">Our Vision</h2>
          <p className="text-lg">
            We believe that great ideas deserve a chance to succeed. By providing entrepreneurs with
            data-driven insights and a comprehensive roadmap, we aim to increase the success rate of
            SaaS startups and foster a new generation of sustainable, impactful businesses.
          </p>
        </div>
        
        <div className="border-t pt-12 mt-12">
          <h2 className="text-2xl font-bold mb-6">Get Started Today</h2>
          <p className="mb-6">
            Genarki is currently in beta, with full access available for free. Join us today and transform 
            your SaaS idea into a validated blueprint for success.
          </p>
          
          <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300">
            <Link href="/sign-up">Create Your Free Account</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
} 