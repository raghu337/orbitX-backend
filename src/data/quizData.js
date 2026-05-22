import { PLANETARY_QUESTIONS } from './questions/planetary';
import { SATELLITE_QUESTIONS } from './questions/satellite';
import { DEEP_SPACE_QUESTIONS } from './questions/deepspace';
import { ASTROPHYSICS_QUESTIONS } from './questions/astrophysics';

/**
 * All datasets mapped by category title.
 * IMPORTANT: Ensure titles match exactly with those in mockQuiz.js
 */
export const ALL_QUESTIONS = {
  'Planetary Science': PLANETARY_QUESTIONS,
  'Satellite Tech': SATELLITE_QUESTIONS,
  'Deep Space': DEEP_SPACE_QUESTIONS,
  'Astrophysics': ASTROPHYSICS_QUESTIONS,
};

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 */
export const shuffleArray = (array) => {
  if (!array || !Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Prepares a question set for a category:
 * 1. Loads the correct dataset
 * 2. Shuffles questions
 * 3. Shuffles options for each question
 */
export const prepareQuiz = (categoryTitle) => {
  console.log(`[QUIZ_LOG] Preparing quiz for category: "${categoryTitle}"`);
  
  const baseQuestions = ALL_QUESTIONS[categoryTitle];
  
  if (!baseQuestions) {
    console.error(`[QUIZ_ERROR] Dataset not found for category: "${categoryTitle}"`);
    console.log(`[QUIZ_LOG] Available keys:`, Object.keys(ALL_QUESTIONS));
    return [];
  }

  console.log(`[QUIZ_LOG] Loaded dataset size: ${baseQuestions.length} unique questions.`);

  // 1. Shuffle all questions from the dataset
  const shuffledQuestions = shuffleArray(baseQuestions);
  
  // 2. Shuffle options for every question to ensure zero repetition in experience
  const finalQuestions = shuffledQuestions.map(q => ({
    ...q,
    options: shuffleArray(q.options)
  }));

  console.log(`[QUIZ_LOG] First question in mission: "${finalQuestions[0]?.question.substring(0, 30)}..."`);
  
  return finalQuestions;
};
