/**
 * Generate meaningful contextual explanations for strengths
 */
export const getStrengthContext = (strength: string, index: number) => {
  const contexts = [
    "This differentiator can position your product favorably against competitors and create strong market appeal.",
    "Leveraging this strength could significantly enhance user adoption and retention rates.",
    "This advantage could be central to your unique value proposition and messaging strategy.",
    "This strength aligns with current market trends and could accelerate early adoption.",
    "This feature addresses a critical pain point and could become a key selling point.",
    "This capability provides a competitive edge in the current market landscape.",
    "This could be a major factor in user retention and satisfaction.",
    "This strength could substantially reduce customer acquisition costs and increase lifetime value.",
    "This aspect could create powerful network effects as your user base grows.",
    "This strength addresses a significant gap in the current market offerings."
  ];
  
  // Use the index if within range, otherwise randomize
  return contexts[index < contexts.length ? index : Math.floor(Math.random() * contexts.length)];
};

/**
 * Generate meaningful contextual explanations for weaknesses
 */
export const getWeaknessContext = (weakness: string, index: number) => {
  const contexts = [
    "Addressing this challenge early in development could prevent significant roadblocks later.",
    "Consider prioritizing this concern in your MVP roadmap to validate potential solutions.",
    "This potential barrier could affect user acquisition if not properly managed.",
    "Developing a clear strategy around this challenge will strengthen your go-to-market approach.",
    "Research how competitors handle this issue to develop a more competitive solution.",
    "This challenge might require additional resources or expertise to properly address.",
    "User testing could help you identify the most effective approaches to solve this issue.",
    "This concern might impact your pricing strategy and overall business model.",
    "A phased approach to addressing this challenge could maintain momentum while mitigating risks.",
    "This limitation could affect scalability if not addressed strategically."
  ];
  
  // Use the index if within range, otherwise randomize
  return contexts[index < contexts.length ? index : Math.floor(Math.random() * contexts.length)];
};

/**
 * Get recommended priority level for a weakness
 */
export const getWeaknessPriority = (index: number) => {
  if (index === 0) return "Critical";
  if (index === 1 || index === 2) return "High";
  if (index === 3 || index === 4) return "Medium";
  return "Low";
};

/**
 * Get color class for a score
 */
export const getScoreColorClass = (score: number) => {
  if (score >= 8) return "text-green-500";
  if (score >= 6) return "text-blue-500";
  if (score >= 4) return "text-amber-500";
  return "text-red-500";
};

/**
 * Get progress bar color class for a score
 */
export const getProgressColorClass = (score: number) => {
  if (score >= 8) return "bg-green-500";
  if (score >= 6) return "bg-blue-500";
  if (score >= 4) return "bg-amber-500";
  return "bg-red-500";
};
