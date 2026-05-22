export const QUIZ_CATEGORIES = [
  {
    id: '1',
    title: 'Planetary Science',
    icon: 'earth',
    questions: 10,
    difficulty: 'EASY',
    color: '#00E5FF',
    xp: 500,
    missionType: 'Exploration',
    requiredRank: 'Recruit'
  },
  {
    id: '2',
    title: 'Satellite Tech',
    icon: 'satellite-variant',
    questions: 15,
    difficulty: 'MEDIUM',
    color: '#FF00E5',
    xp: 750,
    missionType: 'Maintenance',
    requiredRank: 'Recruit'
  },
  {
    id: '3',
    title: 'Deep Space',
    icon: 'flare',
    questions: 20,
    difficulty: 'HARD',
    color: '#FFB800',
    xp: 1000,
    missionType: 'Discovery',
    requiredRank: 'Navigator'
  },
  {
    id: '4',
    title: 'Astrophysics',
    icon: 'atom',
    questions: 12,
    difficulty: 'EXPERT',
    color: '#00FF9D',
    xp: 1200,
    missionType: 'Research',
    requiredRank: 'Commander'
  }
];

export const MOCK_QUESTIONS = [
  {
    id: '1',
    question: 'Which planet is known as the "Red Planet"?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
    explanation: 'Mars is known as the Red Planet due to the iron oxide on its surface which gives it a reddish appearance.'
  },
  {
    id: '2',
    question: 'What is the largest moon of Saturn?',
    options: ['Titan', 'Europa', 'Ganymede', 'Phobos'],
    correctAnswer: 'Titan',
    explanation: 'Titan is the largest moon of Saturn and the second-largest natural satellite in the Solar System.'
  },
  {
    id: '3',
    question: 'Which satellite was the first to be launched into space?',
    options: ['Sputnik 1', 'Explorer 1', 'Vanguard 1', 'Telstar 1'],
    correctAnswer: 'Sputnik 1',
    explanation: 'Sputnik 1 was the first artificial Earth satellite, launched by the Soviet Union on October 4, 1957.'
  },
  {
    id: '4',
    question: 'What is the closest star to Earth besides the Sun?',
    options: ['Sirius', 'Proxima Centauri', 'Alpha Centauri A', 'Betelgeuse'],
    correctAnswer: 'Proxima Centauri',
    explanation: 'Proxima Centauri is a small, low-mass star located about 4.24 light-years from the Sun.'
  },
  {
    id: '5',
    question: 'How many minutes does it take for sunlight to reach Earth?',
    options: ['5 minutes', '8 minutes', '12 minutes', '15 minutes'],
    correctAnswer: '8 minutes',
    explanation: 'On average, it takes 8 minutes and 20 seconds for light to travel from the Sun to the Earth.'
  }
];

export const GALAXY_RANKS = [
  { name: 'Recruit', minXp: 0, icon: 'account' },
  { name: 'Navigator', minXp: 1000, icon: 'compass-outline' },
  { name: 'Commander', minXp: 2500, icon: 'star-outline' },
  { name: 'Nova Prime', minXp: 5000, icon: 'flare' },
  { name: 'Galactic Legend', minXp: 10000, icon: 'crown-outline' }
];

export const LEADERBOARD_DATA = [
  { id: '1', name: 'Commander Nova', score: 12500, avatar: 'account', rank: 1 },
  { id: '2', name: 'Star Voyager', score: 11200, avatar: 'account', rank: 2 },
  { id: '3', name: 'Astro Lex', score: 10800, avatar: 'account', rank: 3 },
  { id: '4', name: 'Orbit Master', score: 9500, avatar: 'account', rank: 4 },
  { id: '5', name: 'Galaxy Guide', score: 8700, avatar: 'account', rank: 5 }
];
