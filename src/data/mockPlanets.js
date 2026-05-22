export const MOCK_PLANETS = [
  {
    id: '1',
    name: 'Mercury',
    category: 'Terrestrial',
    distance: '57.9M km',
    diameter: '4,879 km',
    gravity: '3.7 m/s²',
    temperature: '-173°C to 427°C',
    moons: '0',
    color: '#A5A5A5',
    icon: 'circle-slice-8',
    description: 'The smallest planet in our solar system and closest to the Sun—is only slightly larger than Earth\'s Moon.',
    facts: [
      'Mercury is the fastest planet, zipping around the Sun every 88 Earth days.',
      'Despite being closest to the Sun, it is not the hottest planet.'
    ]
  },
  {
    id: '2',
    name: 'Venus',
    category: 'Terrestrial',
    distance: '108.2M km',
    diameter: '12,104 km',
    gravity: '8.87 m/s²',
    temperature: '462°C',
    moons: '0',
    color: '#E3BB76',
    icon: 'circle-slice-8',
    description: 'Venus is our closest planetary neighbor. It is the hottest planet in our solar system.',
    facts: [
      'Venus rotates backwards compared to most other planets.',
      'One day on Venus is longer than a year on Venus.'
    ]
  },
  {
    id: '3',
    name: 'Earth',
    category: 'Terrestrial',
    distance: '149.6M km',
    diameter: '12,742 km',
    gravity: '9.8 m/s²',
    temperature: '-88°C to 58°C',
    moons: '1',
    color: '#00E5FF',
    icon: 'earth',
    description: 'Our home planet is the only place we know of so far that\'s inhabited by living things.',
    facts: [
      'Earth is the only planet in our solar system with liquid water on the surface.',
      'The atmosphere protects us from incoming meteoroids.'
    ]
  },
  {
    id: '4',
    name: 'Mars',
    category: 'Terrestrial',
    distance: '227.9M km',
    diameter: '6,779 km',
    gravity: '3.71 m/s²',
    temperature: '-153°C to 20°C',
    moons: '2',
    color: '#FF4B4B',
    icon: 'circle-slice-8',
    description: 'Mars is a dusty, cold, desert world with a very thin atmosphere.',
    facts: [
      'Mars is known as the Red Planet because of iron minerals in the soil.',
      'It has the largest volcano in the solar system, Olympus Mons.'
    ]
  },
  {
    id: '5',
    name: 'Jupiter',
    category: 'Gas Giant',
    distance: '778.6M km',
    diameter: '139,820 km',
    gravity: '24.79 m/s²',
    temperature: '-110°C',
    moons: '95',
    color: '#FFA726',
    icon: 'circle-slice-8',
    description: 'Jupiter is more than twice as massive than the other planets of our solar system combined.',
    facts: [
      'Jupiter has a Great Red Spot, a centuries-old storm bigger than Earth.',
      'It has a very strong magnetic field.'
    ]
  },
  {
    id: '6',
    name: 'Saturn',
    category: 'Gas Giant',
    distance: '1.4B km',
    diameter: '116,460 km',
    gravity: '10.44 m/s²',
    temperature: '-140°C',
    moons: '146',
    color: '#F4D03F',
    icon: 'circle-slice-8',
    description: 'Adorned with a dazzling, complex system of icy rings, Saturn is unique in our solar system.',
    facts: [
      'Saturn could float in water because it is mostly made of gas.',
      'Its rings are made of chunks of ice and rock.'
    ]
  }
];

export const PLANET_CATEGORIES = ['All', 'Terrestrial', 'Gas Giant', 'Ice Giant'];
