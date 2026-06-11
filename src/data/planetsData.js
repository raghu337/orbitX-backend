/**
 * Comprehensive Planet Data
 * Complete information for all 8 planets in the solar system
 * NASA-sourced information
 */

export const PLANETS_DATA = [
  {
    id: '1',
    name: 'Mercury',
    type: 'Terrestrial',
    color: '#8C7853',
    glowColor: '#A5A5A5',
    description: 'The smallest planet and closest to the Sun',
    shortDescription: 'Swift messenger of the gods',
    distanceFromSun: '57.9 million km',
    diameter: '4,879 km',
    moons: 0,
    dayLength: '59 Earth days',
    yearLength: '88 Earth days',
    gravity: '3.7 m/s²',
    temperature: {
      min: -173,
      max: 427,
      unit: '°C'
    },
    atmosphere: 'Virtually none (oxygen, sodium, hydrogen, helium traces)',
    type_description: 'A small, rocky world with extreme temperatures',
    funFacts: [
      'Mercury is the fastest planet, orbiting the Sun every 88 Earth days.',
      'Despite being closest to the Sun, it is not the hottest planet—Venus is.',
      'A day on Mercury (59 Earth days) is longer than its year (88 Earth days).',
      'Mercury has extreme temperature swings due to its thin atmosphere.',
      'It has a large iron core relative to its size.',
      'Named after the Roman messenger god because of its swift movement across the sky.'
    ],
    imageUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    facts: {
      composition: 'Iron, nickel, silicate rock',
      rotationPeriod: '59 Earth days',
      revolutionPeriod: '88 Earth days',
      mass: '3.3 × 10²³ kg',
      volume: '6.1 × 10¹⁰ km³',
      density: '5.43 g/cm³',
      surface: 'Cratered, similar to the Moon',
      ringsCount: 0
    }
  },
  {
    id: '2',
    name: 'Venus',
    type: 'Terrestrial',
    color: '#FFC649',
    glowColor: '#E3BB76',
    description: 'The hottest planet in our solar system',
    shortDescription: 'The morning and evening star',
    distanceFromSun: '108.2 million km',
    diameter: '12,104 km',
    moons: 0,
    dayLength: '243 Earth days',
    yearLength: '225 Earth days',
    gravity: '8.87 m/s²',
    temperature: {
      min: 460,
      max: 470,
      unit: '°C'
    },
    atmosphere: 'Carbon dioxide (96%), nitrogen (3%), traces of other gases',
    type_description: 'A terrestrial planet with extreme greenhouse effect',
    funFacts: [
      'Venus rotates backwards (retrograde rotation) compared to most planets.',
      'One day on Venus (243 Earth days) is longer than its year (225 Earth days).',
      'Venus is the hottest planet, with surface temperatures hot enough to melt lead.',
      'It has a thick atmosphere that creates a runaway greenhouse effect.',
      'Venus is nearly the same size as Earth but in very different conditions.',
      'Named after the Roman goddess of love and beauty.'
    ],
    imageUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    facts: {
      composition: 'Silicate rock, iron, nickel',
      rotationPeriod: '243 Earth days',
      revolutionPeriod: '225 Earth days',
      mass: '4.9 × 10²⁴ kg',
      volume: '9.3 × 10¹¹ km³',
      density: '5.24 g/cm³',
      surface: 'Volcanic, with vast lava plains',
      ringsCount: 0
    }
  },
  {
    id: '3',
    name: 'Earth',
    type: 'Terrestrial',
    color: '#4DA6FF',
    glowColor: '#00E5FF',
    description: 'Our home—the only known planet with life',
    shortDescription: 'The blue marble of life',
    distanceFromSun: '149.6 million km',
    diameter: '12,742 km',
    moons: 1,
    dayLength: '24 hours',
    yearLength: '365.25 days',
    gravity: '9.81 m/s²',
    temperature: {
      min: -88,
      max: 58,
      unit: '°C'
    },
    atmosphere: 'Nitrogen (78%), oxygen (21%), argon (0.9%), trace gases',
    type_description: 'The only planet known to harbor life',
    funFacts: [
      'Earth is the only planet known to have life.',
      'About 71% of Earth\'s surface is covered by water.',
      'Earth\'s atmosphere protects us from harmful solar radiation.',
      'Our planet formed about 4.54 billion years ago.',
      'Earth is currently the only home for millions of species.',
      'Named after the Germanic and Old English words for "ground" or "soil".'
    ],
    imageUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    facts: {
      composition: 'Silicate rock, iron, nickel',
      rotationPeriod: '24 hours',
      revolutionPeriod: '365.25 days',
      mass: '6.0 × 10²⁴ kg',
      volume: '1.1 × 10¹² km³',
      density: '5.52 g/cm³',
      surface: 'Continents and oceans',
      ringsCount: 0
    }
  },
  {
    id: '4',
    name: 'Mars',
    type: 'Terrestrial',
    color: '#CD5C5C',
    glowColor: '#C1440E',
    description: 'The red planet with signs of past water',
    shortDescription: 'The red warrior planet',
    distanceFromSun: '227.9 million km',
    diameter: '6,779 km',
    moons: 2,
    dayLength: '24.6 hours',
    yearLength: '687 Earth days',
    gravity: '3.71 m/s²',
    temperature: {
      min: -125,
      max: 20,
      unit: '°C'
    },
    atmosphere: 'Carbon dioxide (95%), nitrogen (2.7%), argon (2.1%), trace gases',
    type_description: 'A rocky planet showing evidence of a watery past',
    funFacts: [
      'Mars is known as the Red Planet due to iron oxide (rust) on its surface.',
      'Evidence suggests Mars once had liquid water flowing on its surface.',
      'A day on Mars (sol) is only 39 minutes longer than an Earth day.',
      'Mars has the largest volcano in the solar system—Olympus Mons.',
      'It has a massive canyon system called Valles Marineris.',
      'Named after the Roman god of war.'
    ],
    imageUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    facts: {
      composition: 'Silicate rock, iron oxide',
      rotationPeriod: '24.6 hours',
      revolutionPeriod: '687 Earth days',
      mass: '6.4 × 10²³ kg',
      volume: '1.6 × 10¹¹ km³',
      density: '3.93 g/cm³',
      surface: 'Cratered, volcanic, with canyons',
      ringsCount: 0
    }
  },
  {
    id: '5',
    name: 'Jupiter',
    type: 'Gas Giant',
    color: '#C88B3A',
    glowColor: '#D9A066',
    description: 'The largest planet with powerful storms',
    shortDescription: 'The gas giant king',
    distanceFromSun: '778.5 million km',
    diameter: '139,820 km',
    moons: 95,
    dayLength: '10 hours',
    yearLength: '12 Earth years',
    gravity: '24.79 m/s²',
    temperature: {
      min: -110,
      max: -108,
      unit: '°C'
    },
    atmosphere: 'Hydrogen (89%), helium (10%), trace gases',
    type_description: 'A massive gas giant with a strong magnetic field',
    funFacts: [
      'Jupiter is the largest planet in our solar system.',
      'Jupiter completes a rotation in just 10 hours.',
      'The Great Red Spot is a storm larger than Earth, raging for over 300 years.',
      'Jupiter has 95 known moons, including Ganymede, the largest moon in the solar system.',
      'Jupiter\'s magnetic field is 20,000 times stronger than Earth\'s.',
      'Named after the king of the Roman gods.'
    ],
    imageUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    facts: {
      composition: 'Hydrogen, helium, ammonia ice, water ice',
      rotationPeriod: '10 hours',
      revolutionPeriod: '12 Earth years',
      mass: '1.9 × 10²⁷ kg',
      volume: '1.4 × 10¹⁵ km³',
      density: '1.33 g/cm³',
      surface: 'No solid surface; gas clouds',
      ringsCount: 4
    }
  },
  {
    id: '6',
    name: 'Saturn',
    type: 'Gas Giant',
    color: '#F4D47F',
    glowColor: '#E8D090',
    description: 'The ringed planet of wonder',
    shortDescription: 'The jewel of the solar system',
    distanceFromSun: '1.427 billion km',
    diameter: '116,460 km',
    moons: 146,
    dayLength: '10.7 hours',
    yearLength: '29 Earth years',
    gravity: '10.44 m/s²',
    temperature: {
      min: -140,
      max: -108,
      unit: '°C'
    },
    atmosphere: 'Hydrogen (96%), helium (3%), trace gases',
    type_description: 'A gas giant famous for its spectacular ring system',
    funFacts: [
      'Saturn is famous for its prominent ring system made of ice and rock.',
      'Saturn is the second-largest planet in our solar system.',
      'Saturn is the least dense planet and would float in water.',
      'Saturn has 146 known moons, including Titan with a thick atmosphere.',
      'The rings of Saturn span a distance of 282,000 km but are only 30 meters thick.',
      'Named after the Roman god of agriculture and wealth.'
    ],
    imageUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    facts: {
      composition: 'Hydrogen, helium, ammonia ice, water ice',
      rotationPeriod: '10.7 hours',
      revolutionPeriod: '29 Earth years',
      mass: '5.7 × 10²⁶ kg',
      volume: '8.3 × 10¹⁴ km³',
      density: '0.687 g/cm³',
      surface: 'No solid surface; gas clouds',
      ringsCount: 7
    }
  },
  {
    id: '7',
    name: 'Uranus',
    type: 'Ice Giant',
    color: '#4FD0E7',
    glowColor: '#7AD7F0',
    description: 'The tilted ice giant with extreme winds',
    shortDescription: 'The sideways ice giant',
    distanceFromSun: '2.871 billion km',
    diameter: '50,724 km',
    moons: 28,
    dayLength: '17 hours',
    yearLength: '84 Earth years',
    gravity: '8.69 m/s²',
    temperature: {
      min: -224,
      max: -220,
      unit: '°C'
    },
    atmosphere: 'Hydrogen (83%), helium (15%), methane (2%), trace gases',
    type_description: 'An ice giant unique for rotating on its side',
    funFacts: [
      'Uranus rotates on its side, likely due to a collision early in solar system history.',
      'Uranus is an ice giant composed primarily of water, methane, and ammonia ices.',
      'It appears as a featureless blue-green sphere due to methane in its atmosphere.',
      'Uranus has 28 known moons and faint rings.',
      'Wind speeds on Uranus can reach 900 km/h.',
      'Named after the Greek god of the sky.'
    ],
    imageUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    facts: {
      composition: 'Water ice, methane ice, ammonia ice',
      rotationPeriod: '17 hours',
      revolutionPeriod: '84 Earth years',
      mass: '8.7 × 10²⁵ kg',
      volume: '6.8 × 10¹³ km³',
      density: '1.27 g/cm³',
      surface: 'No solid surface; ice and gas clouds',
      ringsCount: 13
    }
  },
  {
    id: '8',
    name: 'Neptune',
    type: 'Ice Giant',
    color: '#4166F5',
    glowColor: '#4062FF',
    description: 'The windy ice giant at the solar system edge',
    shortDescription: 'The deep blue windy planet',
    distanceFromSun: '4.495 billion km',
    diameter: '49,244 km',
    moons: 16,
    dayLength: '16 hours',
    yearLength: '165 Earth years',
    gravity: '11.15 m/s²',
    temperature: {
      min: -220,
      max: -200,
      unit: '°C'
    },
    atmosphere: 'Hydrogen (80%), helium (19%), methane (1%), trace gases',
    type_description: 'The windiest ice giant in the solar system',
    funFacts: [
      'Neptune is the windiest planet in the solar system with winds up to 2,100 km/h.',
      'Neptune appears a vivid, deep blue due to methane in its atmosphere.',
      'It was the first planet located through mathematical prediction rather than observation.',
      'Neptune has 16 known moons, including Triton with nitrogen geysers.',
      'A year on Neptune is 165 Earth years.',
      'Named after the Roman god of the sea.'
    ],
    imageUrl: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
    facts: {
      composition: 'Water ice, methane ice, ammonia ice',
      rotationPeriod: '16 hours',
      revolutionPeriod: '165 Earth years',
      mass: '1.0 × 10²⁶ kg',
      volume: '6.3 × 10¹³ km³',
      density: '1.64 g/cm³',
      surface: 'No solid surface; ice and gas clouds',
      ringsCount: 5
    }
  }
];

export const getPlanetById = (id) => {
  return PLANETS_DATA.find(planet => planet.id === id);
};

export const searchPlanets = (query) => {
  const lowerQuery = query.toLowerCase();
  return PLANETS_DATA.filter(planet =>
    planet.name.toLowerCase().includes(lowerQuery) ||
    planet.description.toLowerCase().includes(lowerQuery) ||
    planet.type.toLowerCase().includes(lowerQuery)
  );
};

export const filterPlanetsByType = (type) => {
  if (type === 'All') return PLANETS_DATA;
  return PLANETS_DATA.filter(planet => planet.type === type);
};

export const PLANET_TYPES = ['All', 'Terrestrial', 'Gas Giant', 'Ice Giant'];
