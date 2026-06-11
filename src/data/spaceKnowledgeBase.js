/**
 * Space AI Knowledge Base
 * Quick reference data for space-related queries
 * Integrated with AI responses for enriched information
 */

export const SPACE_KNOWLEDGE_BASE = {
  planets: {
    Mercury: { diameter: '4,879 km', moons: 0, type: 'Terrestrial' },
    Venus: { diameter: '12,104 km', moons: 0, type: 'Terrestrial' },
    Earth: { diameter: '12,742 km', moons: 1, type: 'Terrestrial' },
    Mars: { diameter: '6,779 km', moons: 2, type: 'Terrestrial' },
    Jupiter: { diameter: '139,820 km', moons: 95, type: 'Gas Giant' },
    Saturn: { diameter: '116,460 km', moons: 146, type: 'Gas Giant' },
    Uranus: { diameter: '50,724 km', moons: 28, type: 'Ice Giant' },
    Neptune: { diameter: '49,244 km', moons: 16, type: 'Ice Giant' },
  },
  spaceMissions: {
    Apollo11: 'First moon landing (1969)',
    Voyager1: 'Interstellar probe launched 1977',
    ISS: 'International Space Station orbiting Earth',
    Hubble: 'Space telescope launched 1990',
    JamesWebb: 'Next-generation space telescope (launched 2021)',
    Mars2020: 'Perseverance rover on Mars',
    NewHorizons: 'Pluto and Kuiper Belt explorer',
  },
  celestialObjects: {
    BlackHole: 'Regions of extreme gravity from collapsed massive stars',
    NeutronStar: 'Collapsed core of massive star, incredibly dense',
    PulsarStar: 'Rapidly rotating neutron star emitting radiation',
    Supernova: 'Massive star explosion at end of life',
    WhiteDwarf: 'Dense remnant of a dead star',
    Asteroid: 'Rocky object orbiting the sun',
    Comet: 'Icy object with tail when near sun',
    Meteoroid: 'Small rocky object in space',
    Meteor: 'Meteoroid burning in atmosphere (shooting star)',
    Meteorite: 'Meteoroid that reached Earths surface',
  },
  galaxies: {
    MilkyWay: 'Our galaxy containing 100-400 billion stars',
    AndromedaGalaxy: 'Nearest major galaxy to Milky Way',
    TriangelumGalaxy: 'Third largest galaxy in Local Group',
    WhirlpoolGalaxy: 'Beautiful spiral galaxy',
    SombreroGalaxy: 'Galaxy with distinctive dust lane',
  },
  ISS: {
    name: 'International Space Station',
    crew: '7 astronauts usually on board',
    orbit: 'Orbits Earth every 90 minutes',
    altitude: 'Approximately 408 km above Earth',
    purpose: 'Scientific research and international cooperation',
  },
};

export const SUGGESTED_SPACE_QUESTIONS = [
  '🪐 Tell me about Jupiter',
  '🌙 How many moons does Saturn have?',
  '🌟 What is a black hole?',
  '🔭 What did the Hubble telescope discover?',
  '👨‍🚀 Is there life on Mars?',
  '⭐ How big is the universe?',
  '🛰️ What is the ISS?',
  '🚀 When will we go to Mars?',
  '🌌 What are galaxies?',
  '☄️ What caused the dinosaur extinction?',
  '💫 What are shooting stars?',
  '🪐 How did the solar system form?',
];

export const SPACE_TOPICS = {
  PLANETS: 'planets',
  MOONS: 'moons',
  STARS: 'stars',
  GALAXIES: 'galaxies',
  BLACK_HOLES: 'black holes',
  ISS: 'ISS',
  NASA_MISSIONS: 'NASA missions',
  SPACE_EXPLORATION: 'space exploration',
};

export const detectSpaceTopic = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('mercury') || lowerText.includes('venus') || 
      lowerText.includes('earth') || lowerText.includes('mars') ||
      lowerText.includes('jupiter') || lowerText.includes('saturn') ||
      lowerText.includes('uranus') || lowerText.includes('neptune') ||
      lowerText.includes('planet')) {
    return SPACE_TOPICS.PLANETS;
  }
  
  if (lowerText.includes('moon') || lowerText.includes('satellite')) {
    return SPACE_TOPICS.MOONS;
  }
  
  if (lowerText.includes('black hole') || lowerText.includes('event horizon')) {
    return SPACE_TOPICS.BLACK_HOLES;
  }
  
  if (lowerText.includes('star') || lowerText.includes('supernova') || 
      lowerText.includes('pulsar') || lowerText.includes('neutron')) {
    return SPACE_TOPICS.STARS;
  }
  
  if (lowerText.includes('galaxy') || lowerText.includes('milky way') ||
      lowerText.includes('andromeda')) {
    return SPACE_TOPICS.GALAXIES;
  }
  
  if (lowerText.includes('iss') || lowerText.includes('space station')) {
    return SPACE_TOPICS.ISS;
  }
  
  if (lowerText.includes('apollo') || lowerText.includes('nasa') ||
      lowerText.includes('mission') || lowerText.includes('voyager') ||
      lowerText.includes('hubble') || lowerText.includes('webb')) {
    return SPACE_TOPICS.NASA_MISSIONS;
  }
  
  return null;
};

export const extractPlanetName = (text) => {
  const planets = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];
  const lowerText = text.toLowerCase();
  
  for (const planet of planets) {
    if (lowerText.includes(planet.toLowerCase())) {
      return planet;
    }
  }
  
  return null;
};
