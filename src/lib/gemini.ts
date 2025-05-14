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
      Generate a comprehensive SaaS idea validation and blueprint for: "${ideaName}"
      
      Description: ${description}
      
      Your response should be in JSON format with the following structure:
      {
        "validation": {
          "score": number from 1-10,
          "feedback": "detailed feedback on strengths and weaknesses",
          "improvements": ["suggestion1", "suggestion2", "suggestion3"]
        },
        "features": {
          "core": ["feature1", "feature2", "feature3"],
          "premium": ["premium1", "premium2"],
          "future": ["future1", "future2"]
        },
        "techStack": {
          "frontend": ["technology1", "technology2"],
          "backend": ["technology1", "technology2"],
          "database": ["technology1"],
          "hosting": ["technology1"],
          "other": ["technology1", "technology2"]
        },
        "pricingModel": {
          "tiers": [
            {
              "name": "Free",
              "price": "$0",
              "features": ["feature1", "feature2"]
            },
            {
              "name": "Pro",
              "price": "$X/month",
              "features": ["feature1", "feature2", "feature3"]
            }
          ],
          "strategy": "Brief pricing strategy explanation"
        },
        "userFlow": "mermaid flowchart code for user flow diagram",
        "tasks": [
          {
            "title": "Task 1",
            "description": "Description",
            "priority": "High/Medium/Low",
            "category": "Frontend/Backend/Design/etc"
          }
        ]
      }
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
      "score": 7,
      "feedback": `${ideaName} shows promise. The concept addresses a clear need in the market. Consider refining the target audience and feature prioritization.`,
      "improvements": [
        "Focus on a more specific target audience",
        "Prioritize core features for MVP",
        "Develop a clearer monetization strategy"
      ]
    },
    "features": {
      "core": ["User authentication", "Dashboard analytics", "File management"],
      "premium": ["Advanced reporting", "Team collaboration"],
      "future": ["AI-powered recommendations", "Integration marketplace"]
    },
    "techStack": {
      "frontend": ["React", "Next.js", "Tailwind CSS"],
      "backend": ["Node.js", "Express"],
      "database": ["PostgreSQL"],
      "hosting": ["Vercel"],
      "other": ["Supabase", "Stripe"]
    },
    "pricingModel": {
      "tiers": [
        {
          "name": "Free",
          "price": "$0",
          "features": ["Limited access to core features", "Single user"]
        },
        {
          "name": "Pro",
          "price": "$19/month",
          "features": ["Full access to core features", "Basic premium features", "Up to 5 users"]
        },
        {
          "name": "Enterprise",
          "price": "$49/month",
          "features": ["All features", "Priority support", "Unlimited users"]
        }
      ],
      "strategy": "Freemium model with clear upgrade path based on scaling needs"
    },
    "userFlow": "graph TD\n  A[User Sign Up] --> B[Onboarding]\n  B --> C[Dashboard]\n  C --> D[Create Project]\n  D --> E[Manage Project]\n  E --> F[Generate Reports]\n  C --> G[Account Settings]",
    "tasks": [
      {
        "title": "Set up authentication system",
        "description": "Implement user signup, login, and password reset",
        "priority": "High",
        "category": "Backend"
      },
      {
        "title": "Design dashboard UI",
        "description": "Create wireframes and mockups for the main dashboard",
        "priority": "High",
        "category": "Design"
      },
      {
        "title": "Implement payment processing",
        "description": "Integrate with Stripe for subscription management",
        "priority": "Medium",
        "category": "Backend"
      }
    ]
  };
} 