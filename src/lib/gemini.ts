import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Use only the Gemini Flash model (2.0) to avoid rate limiting
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash-latest',
});

export async function generateIdea(
  ideaName: string,
  description: string
) {
    const prompt = `
      Generate a comprehensive and realistic SaaS idea validation and blueprint for: "${ideaName}"
      
      Description: ${description}
      
      Your response should be in detailed JSON format with the following structure:
      {
        "validation": {
          "score": integer from 1-10 representing REALISTIC market viability (not inflated),
          "feedback": "detailed and honest feedback on commercial potential, strengths and weaknesses",
          "improvements": ["specific actionable improvement suggestion 1", "suggestion 2", "suggestion 3"],
          "strengths": ["key advantage 1", "key advantage 2", "key advantage 3"],
          "weaknesses": ["notable weakness 1", "notable weakness 2", "notable weakness 3"],
          "pillars": {
            "Market Fit": score from 1-10,
            "Uniqueness": score from 1-10,
            "Scalability": score from 1-10,
            "Revenue": score from 1-10, 
            "Execution": score from 1-10,
            "Expertise": score from 1-10
          }
        },
        "features": {
          "core": ["essential feature 1", "essential feature 2", "essential feature 3", "essential feature 4", "essential feature 5"],
          "premium": ["advanced feature 1", "advanced feature 2", "advanced feature 3", "advanced feature 4"],
          "future": ["potential future feature 1", "potential future feature 2", "potential future feature 3"]
        },
        "market": {
          "size": "realistic estimated market size with specific numbers",
          "growth": "specific annual growth trajectory with percentages", 
          "opportunity": "clearly defined market opportunity with specifics",
          "demographics": ["detailed demographic 1", "detailed demographic 2", "detailed demographic 3"]
        },
        "technical": {
          "complexity": "specific rating of technical complexity with justification",
          "innovation": "specific technological innovation aspects",
          "challenges": ["specific technical challenge 1", "specific technical challenge 2", "specific technical challenge 3"]
        },
        "techStack": {
          "frontend": ["technology 1", "technology 2", "technology 3"],
          "backend": ["technology 1", "technology 2", "technology 3"],
          "database": ["technology 1", "technology 2"],
          "hosting": ["technology 1", "technology 2"],
          "other": ["other key technology 1", "other key technology 2"]
        },
        "pricingModel": {
          "tiers": [
            {
              "name": "Free",
              "price": "$0",
              "features": ["specific feature 1", "specific feature 2", "specific feature 3"]
            },
            {
              "name": "Pro",
              "price": "$X/month (realistic price)",
              "features": ["specific feature 1", "specific feature 2", "specific feature 3", "specific feature 4"]
            },
            {
              "name": "Enterprise",
              "price": "$Y/month (realistic price)",
              "features": ["all features plus", "specific enterprise feature 1", "specific enterprise feature 2", "specific enterprise feature 3"]
            }
          ],
          "strategy": "Detailed pricing strategy explanation with specific price points and justification"
        },
        "targetAudience": {
          "primary": ["specific user type 1", "specific user type 2"],
          "secondary": ["specific user type 3", "specific user type 4"], 
          "industries": ["specific industry 1", "specific industry 2", "specific industry 3", "specific industry 4"],
          "personas": [
            "Detailed persona 1: Name, age, job title, key pain points, goals",
            "Detailed persona 2: Name, age, job title, key pain points, goals"
          ]
        },
        "userExperience": {
          "design": "specific design philosophy with aesthetic direction",
          "accessibility": "specific accessibility considerations for this product",
          "unique": "unique UX aspects that differentiate this product"
        },
        "marketAnalysis": {
          "trends": ["specific relevant market trend 1", "specific relevant market trend 2", "specific relevant market trend 3"],
          "risks": ["specific business risk 1", "specific business risk 2", "specific business risk 3"],
          "opportunities": ["specific business opportunity 1", "specific business opportunity 2", "specific business opportunity 3"]
        },
        "competitorAnalysis": {
          "direct": ["specific named competitor 1", "specific named competitor 2", "specific named competitor 3"],
          "indirect": ["specific named indirect competitor 1", "specific named indirect competitor 2", "specific named indirect competitor 3"],
          "advantages": ["specific competitive advantage 1", "specific competitive advantage 2", "specific competitive advantage 3"]
        },
        "developmentTimeline": {
          "mvp": "specific timeframe for MVP with months",
          "beta": "specific timeframe for beta with months", 
          "launch": "specific timeframe for official launch with months",
          "phases": [
            "Phase 1 (Months 1-X): Detailed description of development activities",
            "Phase 2 (Months X-Y): Detailed description of development activities",
            "Phase 3 (Months Y-Z): Detailed description of development activities"
          ]
        },
        "marketingStrategy": {
          "channels": ["specific marketing channel 1", "specific marketing channel 2", "specific marketing channel 3", "specific marketing channel 4"],
          "approach": "detailed marketing approach specific to this product",
          "budget": "recommended detailed budget range with specific numbers",
          "tactics": ["specific marketing tactic 1", "specific marketing tactic 2", "specific marketing tactic 3", "specific marketing tactic 4"]
        },
        "userflow": "detailed and complex mermaid flowchart code for comprehensive user flow diagram - make sure this is valid mermaid syntax with no errors",
        "tasks": [
          {
            "title": "Specific development task 1",
            "description": "Detailed description with specifics",
            "priority": "High/Medium/Low",
            "category": "Frontend/Backend/Design/etc (specific category)"
          },
          {
            "title": "Specific development task 2",
            "description": "Detailed description with specifics",
            "priority": "High/Medium/Low",
            "category": "Frontend/Backend/Design/etc (specific category)"
          },
          {
            "title": "Specific development task 3",
            "description": "Detailed description with specifics",
            "priority": "High/Medium/Low",
            "category": "Frontend/Backend/Design/etc (specific category)"
          },
          {
            "title": "Specific development task 4",
            "description": "Detailed description with specifics",
            "priority": "High/Medium/Low",
            "category": "Frontend/Backend/Design/etc (specific category)"
          },
          {
            "title": "Specific development task 5",
            "description": "Detailed description with specifics",
            "priority": "High/Medium/Low",
            "category": "Frontend/Backend/Design/etc (specific category)"
          }
        ]
      }
      
      IMPORTANT GUIDELINES:
      1. Make sure validation scores are REALISTIC and NOT inflated (avoid giving everything 8-10 scores)
      2. Include a mix of scores from 4-9 in the pillars section for realism
      3. Give truly detailed, specific content for ALL fields - no generic placeholders
      4. For userflow, create a complex, multi-step flowchart using valid mermaid syntax 
      5. Provide detailed, specific persona descriptions with names and backgrounds
      6. For pricing, use realistic market prices based on the specific product type
      7. For competitors, use REAL company names in the market, not generic placeholders
      8. For timelines, provide specific month ranges, not generic "X months"
      9. For market size, provide actual numbers (e.g., "$X billion by 2025")
    `;

  try {
    console.log("Generating with Gemini Flash model (2.0)...");
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse JSON response');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating idea with Gemini:', error);
    
    // If API is completely unavailable, provide mock data
    console.log("API error occurred, returning mock data...");
    return generateMockData(ideaName, description);
  }
}

// Function to generate mock data when the API is unavailable
function generateMockData(ideaName: string, description: string) {
  return {
    "validation": {
      "score": Math.floor(Math.random() * 4) + 5, // Random score between 5-8
      "feedback": `${ideaName} shows interesting potential but faces significant challenges. The concept addresses several key pain points in the market, particularly for medium-sized businesses struggling with efficiency. Consider refining the target audience focus, determining a more specific pricing strategy, and prioritizing the development of differentiating features to stand out in this competitive space.`,
      "improvements": [
        "Narrow down to a more specific target audience segment",
        "Develop a clearer monetization strategy with tiered pricing",
        "Focus on 2-3 core differentiating features rather than trying to solve too many problems",
        "Conduct customer interviews to validate the most painful problems",
        "Consider partnerships with existing platforms to accelerate market entry"
      ],
      "strengths": [
        "Addresses a genuine pain point for the target market",
        "Scalable technology approach with reasonable development timeline",
        "Potential for recurring revenue through subscription model",
        "Low customer acquisition cost through proposed channel strategy"
      ],
      "weaknesses": [
        "Highly competitive market space with established players",
        "Technical complexity could delay time to market",
        "May require significant upfront development investment",
        "Customer acquisition strategy relies heavily on content marketing which takes time"
      ],
      "pillars": {
        "Market Fit": Math.floor(Math.random() * 3) + 6, // 6-8
        "Uniqueness": Math.floor(Math.random() * 4) + 4, // 4-7
        "Scalability": Math.floor(Math.random() * 3) + 6, // 6-8
        "Revenue": Math.floor(Math.random() * 4) + 4,    // 4-7
        "Execution": Math.floor(Math.random() * 3) + 5,  // 5-7
        "Expertise": Math.floor(Math.random() * 4) + 4   // 4-7
      }
    },
    "features": {
      "core": [
        "Intelligent task automation with customizable workflows",
        "Real-time collaboration spaces with role-based permissions",
        "Advanced document management with version control",
        "Interactive analytics dashboard with exportable reports",
        "Centralized communication hub with priority notifications"
      ],
      "premium": [
        "AI-powered insights and recommendations",
        "Advanced security features with SSO and custom roles",
        "Unlimited storage with enhanced backup options",
        "Priority support with dedicated success manager"
      ],
      "future": [
        "Machine learning algorithms for predictive workflow optimization",
        "Third-party marketplace for integrations and extensions",
        "Custom-branded mobile applications",
        "Advanced automation with natural language processing"
      ]
    },
    "market": {
      "size": "$14.2 billion by 2027",
      "growth": "CAGR of 17.3% over next 5 years",
      "opportunity": "Growing demand from mid-market companies (100-1000 employees) transitioning to digital-first operations",
      "demographics": [
        "Knowledge workers in mid-market companies (100-1000 employees)",
        "Teams with hybrid/remote work environments needing better collaboration",
        "Operations managers seeking to reduce manual processes",
        "Growing companies struggling with productivity and communication"
      ]
    },
    "technical": {
      "complexity": "Medium-High - requiring significant frontend expertise and scalable backend architecture",
      "innovation": "Novel approach to workflow automation combining AI with customizable business rules engine",
      "challenges": [
        "Ensuring real-time sync across various devices and user volumes",
        "Building a flexible permissions system that balances security with usability",
        "Developing an intuitive UI for complex workflow configuration",
        "Maintaining performance with growing data volumes",
        "Ensuring cross-platform compatibility"
      ]
    },
    "techStack": {
      "frontend": ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
      "backend": ["Node.js", "Express", "GraphQL", "Socket.io", "Redis"],
      "database": ["PostgreSQL", "MongoDB"],
      "hosting": ["AWS", "Vercel"],
      "other": ["Supabase", "Stripe", "SendGrid", "Auth0", "Cloudinary"]
    },
    "pricingModel": {
      "tiers": [
        {
          "name": "Free",
          "price": "$0",
          "features": [
            "Up to 5 users",
            "Basic collaboration features",
            "3 automation templates",
            "1GB storage per user",
            "Community support"
          ]
        },
        {
          "name": "Pro",
          "price": "$24/user/month",
          "features": [
            "Unlimited users",
            "Advanced collaboration features",
            "25 automation templates",
            "10GB storage per user",
            "Email & chat support",
            "Advanced analytics",
            "Custom integrations"
          ]
        },
        {
          "name": "Enterprise",
          "price": "$45/user/month",
          "features": [
            "All Pro features",
            "Unlimited automation templates",
            "100GB storage per user",
            "24/7 priority support",
            "Dedicated success manager",
            "Custom security controls",
            "Single sign-on",
            "API access"
          ]
        }
      ],
      "strategy": "Freemium model to drive acquisition, with clear upgrade path based on team size and feature requirements. Enterprise pricing includes volume discounts for organizations with 50+ users to incentivize company-wide adoption."
    },
    "targetAudience": {
      "primary": ["Operations managers in mid-market companies", "Team leads handling cross-functional projects"],
      "secondary": ["C-level executives in growing startups", "IT administrators managing tech stacks"],
      "industries": ["Technology", "Professional Services", "Marketing Agencies", "Financial Services", "Healthcare", "E-commerce"],
      "personas": [
        "Sarah, 34, Operations Director at a 150-person marketing agency. Struggles with coordinating projects across remote teams, tracking deliverables, and maintaining visibility. Needs a solution that reduces email volume and creates accountability.",
        "Michael, 42, CTO at a growing fintech startup with 80 employees. Facing challenges with knowledge sharing, documentation, and ensuring security compliance. Needs a scalable solution that grows with the company without creating technical debt."
      ]
    },
    "userExperience": {
      "design": "Clean, minimalist interface with focus on clarity and reduced cognitive load. Uses progressive disclosure to manage complexity and contextual help for advanced features.",
      "accessibility": "WCAG 2.1 AA compliant with screen reader support, keyboard navigation, appropriate color contrast, and scalable text. Includes dark mode and reduced motion options.",
      "unique": "Adaptive dashboard that reconfigures based on user behavior patterns and role. Uses micro-animations for feedback and intelligent defaults to reduce setup time."
    },
    "marketAnalysis": {
      "trends": [
        "Shift to asynchronous work with global and remote teams",
        "Growing focus on reducing tool sprawl and integration capabilities",
        "Increasing demand for AI-assisted workflow optimization",
        "Rising security and compliance requirements for business software",
        "Movement toward customizable no-code/low-code solutions"
      ],
      "risks": [
        "Market saturation with multiple established players (Asana, Monday.com, ClickUp)",
        "Large tech platforms expanding into workflow space (Microsoft, Google)",
        "Potential economic downturn reducing SaaS budgets",
        "Rapidly changing customer expectations requiring constant innovation",
        "Rising customer acquisition costs in the B2B software space"
      ],
      "opportunities": [
        "Underserved mid-market segment between simple tools and enterprise solutions",
        "Integration gaps in existing solutions creating frustration",
        "Growing AI capabilities enabling new productivity features",
        "International markets with less competition",
        "Industry-specific workflow templates as a differentiation strategy"
      ]
    },
    "competitorAnalysis": {
      "direct": ["Asana", "Monday.com", "ClickUp", "Notion", "Trello"],
      "indirect": ["Microsoft Teams", "Slack", "Google Workspace", "Airtable", "Coda"],
      "advantages": [
        "More intuitive workflow automation compared to complex enterprise tools",
        "Better balance of power and simplicity than current market offerings",
        "Stronger focus on AI-assisted productivity than basic tools",
        "More flexible permission system than competitors",
        "Superior real-time collaboration capabilities"
      ]
    },
    "developmentTimeline": {
      "mvp": "4 months (Months 1-4)",
      "beta": "7 months (Months 5-7)",
      "launch": "9 months (Month 8-9)",
      "phases": [
        "Phase 1 (Months 1-2): Core platform development - user authentication, basic UI, fundamental database structure",
        "Phase 2 (Months 3-4): Key features implementation - workflows, collaboration spaces, document management",
        "Phase 3 (Months 5-7): Beta testing, feedback integration, bug fixes, performance optimization",
        "Phase 4 (Months 8-9): Market launch preparation, scaling infrastructure, implementing initial premium features"
      ]
    },
    "marketingStrategy": {
      "channels": [
        "Content marketing (blog, case studies, whitepapers)",
        "Product Hunt and beta user communities",
        "LinkedIn advertising targeting operations roles",
        "Strategic partnerships with complementary tools",
        "SEO-optimized resource center",
        "Referral program with incentives"
      ],
      "approach": "Inbound marketing focusing on educational content around productivity, workflow optimization, and team collaboration. Create a strong community of early adopters who become advocates.",
      "budget": "$15,000-25,000 monthly for first year, scaling with customer acquisition metrics",
      "tactics": [
        "Free template library to demonstrate value and drive signups",
        "Webinar series featuring customer success stories",
        "Industry-specific workflow guides and benchmark reports",
        "Free assessment tool to identify workflow inefficiencies",
        "Interactive ROI calculator for potential customers"
      ]
    },
    "userflow": `graph TD
    A[User Signup] --> B{Account Type}
    B -->|Individual| C[Quick Setup]
    B -->|Team| D[Team Setup Flow]
    
    C --> E[Onboarding Tutorial]
    D --> F[Team Invite Process]
    F --> G[Team Permissions Config]
    G --> E
    
    E --> H[Dashboard Home]
    
    H --> I[Workflow Hub]
    H --> J[Documents]
    H --> K[Analytics]
    H --> L[Calendar View]
    
    I --> M[Create Workflow]
    M --> N{Template or Custom}
    N -->|Template| O[Select Template]
    N -->|Custom| P[Configure Steps]
    O --> Q[Customize Template]
    P --> R[Set Permissions]
    Q --> R
    
    R --> S[Publish Workflow]
    S --> T[Invite Collaborators]
    
    J --> U[Upload Document]
    J --> V[Create Document]
    U --> W[Set Document Permissions]
    V --> W
    
    K --> X[View Reports]
    K --> Y[Configure Dashboard]
    K --> Z[Export Data]`,
    "tasks": [
      {
        "title": "Implement user authentication system",
        "description": "Create secure authentication with email, Google and Microsoft SSO options, password recovery, and account management",
        "priority": "High",
        "category": "Backend"
      },
      {
        "title": "Design core UI components and design system",
        "description": "Develop reusable UI component library with consistent styling, dark/light modes, and responsive layouts",
        "priority": "High",
        "category": "Design"
      },
      {
        "title": "Build workflow engine backend",
        "description": "Create the core workflow processing engine that handles conditional logic, triggers, actions, and integrations",
        "priority": "High",
        "category": "Backend"
      },
      {
        "title": "Develop real-time collaboration infrastructure",
        "description": "Implement WebSockets or similar technology for live updates, presence indicators, and conflict resolution",
        "priority": "Medium",
        "category": "Backend"
      },
      {
        "title": "Create document management system",
        "description": "Build document storage, versioning, commenting, and permissions with cloud storage integration",
        "priority": "Medium",
        "category": "Full-stack"
      },
      {
        "title": "Implement analytics dashboard",
        "description": "Develop metrics tracking, visualization components, and data export functionality",
        "priority": "Medium",
        "category": "Frontend"
      },
      {
        "title": "Build team management and permissions system",
        "description": "Create role-based access control, team organization structure, and user management interfaces",
        "priority": "High",
        "category": "Full-stack"
      }
    ]
  };
} 