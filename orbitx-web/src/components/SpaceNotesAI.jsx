import React, { useState, useEffect } from 'react';
import { Search, Brain, Clock, ShieldCheck, Printer, ArrowLeft, ArrowRight, RotateCw, Terminal } from 'lucide-react';

const cosmicKnowledgeBase = {
  jupiter: {
    title: 'Jupiter (Jovian System Analysis)',
    stats: [
      { label: 'AI CONFIDENCE', value: '99.8%', icon: Brain },
      { label: 'STUDY TIME', value: '6 Mins', icon: Clock },
      { label: 'FOCUS COUNT', value: '3 Major Areas', icon: ShieldCheck }
    ],
    bullets: [
      'Jupiter is the largest planet in our Solar System, containing a mass 318 times greater than Earth and comprising more than twice the mass of all other planets combined.',
      'It is primarily composed of hydrogen (75%) and helium (24%) gases, bearing a composition closely mirroring that of the primordial solar nebula.',
      'The planet features the iconic Great Red Spot—a colossal, persistent anticyclonic storm system wider than the planet Earth that has raged for over 350 years.',
      'Jupiter is surrounded by 95 confirmed moons, including the massive Galilean satellites: volcanic Io, oceanic Europa, giant Ganymede, and cratered Callisto.',
      'Its liquid metallic hydrogen mantle generates an immense magnetosphere, 14 times stronger than Earth\'s, which traps severe radiation belts.'
    ],
    detailedAnalysis: {
      title: 'Gas Giant Dynamics & Jovian Physics',
      sections: [
        {
          heading: '1. Introduction to the Jovian Archetype',
          text: 'Jupiter dominates the outer Solar System, acting as a gravitational anchor. Because of its massive gravity, it intercepts or deflects rogue comets and asteroids, shielding the inner terrestrial planets from catastrophic impacts. Classified as a gas giant, it lacks a solid surface; its atmosphere thickens into liquid layers under extreme pressures.'
        },
        {
          heading: '2. Atmospheric Chemistry & Jet Winds',
          text: 'Jupiter\'s bands are divided into light-colored "zones" of upwelling warm gas and dark-colored "belts" of descending cool gas. Driven by powerful internal heat currents and rapid rotation, wind speeds in these jet streams routinely exceed 600 kilometers per hour. Clouds of ammonia ice, ammonium hydrosulfide, and water compose the distinct band layers.'
        },
        {
          heading: '3. Magnetosphere & Superconducting Mantle',
          text: 'Deep within the planet, temperatures reach 24,000 Kelvin as hydrogen gas is compressed into a liquid metallic state. This ocean of metallic hydrogen acts as an electrical superconductor. Driven by planetary rotation, it acts as a planetary dynamo, generating a massive magnetic tail extending past Saturn.'
        },
        {
          heading: '4. Astrobiological Frontiers of the Galilean Moons',
          text: 'The Galilean satellites are diverse worlds. Io is subjected to tidal forces from Jupiter, resulting in continuous volcanic eruptions. Europa, under an ice shell, hosts a global saltwater ocean kept warm by tidal heat. Ganymede and Callisto also show evidence of deep, subterranean water mantles.'
        }
      ]
    },
    pdfSummary: {
      docId: 'ORB-JUP-2026-X79',
      title: 'JOVIAN SYSTEM SURVEY & EXOPLANETARY ANALYTICS',
      table: [
        { metric: 'Mass Density', value: '1.898 × 10²⁷ kg', reference: '317.8 Earth Masses' },
        { metric: 'Mean Radius', value: '69,911 km', reference: '10.97 × Earth Radius' },
        { metric: 'Orbital Period', value: '11.86 Earth Years', reference: '4,333 Earth Days' },
        { metric: 'Gravity Index', value: '24.79 m/s²', reference: '2.53 × Earth Gravity' },
        { metric: 'Magnetosphere', value: '4.28 Gauss', reference: '14 × Earth Field Intensity' }
      ],
      sec1Title: '1.0 PRIMARY CORE METRICS & STRUCTURAL MATRIX',
      sec1Text: 'Jupiter, the largest planet in our solar system, is a gas giant primarily consisting of hydrogen and helium. Its interior structure is composed of a dense, rocky core surrounded by a vast layer of liquid metallic hydrogen, topped by a gaseous atmosphere. The core is subjected to extreme pressures exceeding 40 million atmospheres, causing hydrogen to act as an electrical conductor. Its scientific discovery dates back to ancient times, with Galileo Galilei first cataloging its major moons in 1610.',
      sec2Title: '2.0 ORBITAL MECHANICS & TELEMETRY FIELD ANALYSES',
      sec2Text: 'Jupiter orbits the Sun at an average distance of 778 million kilometers (5.2 AU). Its quick rotation period of 9.9 hours creates flat polar regions and generates an enormous magnetosphere. The radiation belts surrounding Jupiter are the most intense in the Solar System, trapping high-energy electrons that present hazardous environments for space probes. Path coordinates for exploration satellites require precise gravity-assist trajectories using Mars or Venus.',
      sec3Title: '3.0 OBSERVATIONAL CHRONOLOGY & FUTURE STUDY LABELS',
      sec3Text: 'Observations of Jupiter have spanned from historical flybys (Pioneer, Voyager) to orbiters (Galileo, Juno). Future objectives focus on investigating the habitability of its icy moons, particularly Europa. Missions like ESA\'s JUICE and NASA\'s Europa Clipper aim to detect liquid oceans under the icy crusts.',
      bibliography: [
        '[1] Vance, A. "Atmospheric Dynamics of Gas Giants," OrbitX Journal, 2025.',
        '[2] NASA Jet Propulsion Lab. "Juno Mission Telemetry Archives," JPL-2024-JUP.'
      ],
      signatureTitle: 'Director of Planetary Research',
      signatureName: 'Dr. Arthur Vance',
      archivist: 'OrbitX AI System #JP-79'
    },
    flashcards: [
      { question: 'What is the atmospheric composition of Jupiter?', answer: 'Approximately 75% hydrogen and 24% helium, with minor traces of methane, ammonia, and water vapor.' },
      { question: 'How big is the Great Red Spot storm?', answer: 'It is an anticyclonic storm approximately 1.3 times the width of Earth, though historical observations indicate it was once larger.' },
      { question: 'Which Galilean moon is volcanically active?', answer: 'Io. Its volcanic eruptions are powered by tidal heating from gravitational friction with Jupiter and other moons.' },
      { question: 'What state of hydrogen generates Jupiter\'s magnetosphere?', answer: 'Liquid metallic hydrogen, which conducts electric currents generated by the planet\'s rapid rotation.' }
    ]
  },
  mars: {
    title: 'Mars (Red Planet Topography)',
    stats: [
      { label: 'AI CONFIDENCE', value: '98.9%', icon: Brain },
      { label: 'STUDY TIME', value: '5 Mins', icon: Clock },
      { label: 'FOCUS COUNT', value: '2 Major Areas', icon: ShieldCheck }
    ],
    bullets: [
      'Mars is known as the Red Planet due to iron oxide (rust) covering its surface, which remains suspended in its thin atmosphere.',
      'The Martian atmosphere is extremely thin, composed of 95% carbon dioxide, offering minimal thermal insulation.',
      'It features Olympus Mons, the largest volcano in the Solar System, standing three times taller than Mount Everest.',
      'Liquid water cannot exist on the surface of Mars due to low atmospheric pressure, which is less than 1% of Earth\'s.',
      'Mars possesses two small, irregular, heavily cratered satellites, Phobos and Deimos, which are captured asteroids.'
    ],
    detailedAnalysis: {
      title: 'Martian Topography & Astrobiological Prospects',
      sections: [
        {
          heading: '1. Hemispheric Dichotomy & Ancient Geology',
          text: 'Mars displays a stark hemispheric dichotomy: smooth, younger volcanic plains in the north contrast with ancient, cratered highlands in the south. The Valles Marineris canyon system cuts across the equator, stretching over 4,000 kilometers long and up to 7 kilometers deep, dwarfing Earth\'s Grand Canyon.'
        },
        {
          heading: '2. Atmospheric Pressure & Thermal Profile',
          text: 'The Martian atmosphere is thin, with surface pressure averaging only 6 millibars. Lacking a global magnetic field, solar winds slowly strip away the upper atmosphere. Temperatures range from 20°C at noon to -153°C at night, creating polar caps composed of water ice and dry ice (CO₂).'
        },
        {
          heading: '3. Hydrological History & Subsurface Reservoirs',
          text: 'Geological evidence—such as mineral clays, dry river valleys, and alluvial fans—indicates liquid water flowed abundantly in Mars\' warm, wet past. Today, water exists primarily as ice locked in the polar caps and as subsurface permafrost or hydrated minerals.'
        },
        {
          heading: '4. Human Exploration & Robotic Probes',
          text: 'Mars is the focus of intense exploration, hosting active rovers like NASA\'s Perseverance and Curiosity. Ongoing research targets potential biosignatures of past microbial life and assesses resource utilization (producing oxygen from CO₂) for future crewed landings.'
        }
      ]
    },
    pdfSummary: {
      docId: 'ORB-MARS-2026-M04',
      title: 'MARTIAN GEOLOGICAL BRIEF & HYDROLOGICAL SURVEY',
      table: [
        { metric: 'Mass Density', value: '6.39 × 10²³ kg', reference: '0.107 Earth Masses' },
        { metric: 'Mean Radius', value: '3,389 km', reference: '0.53 × Earth Radius' },
        { metric: 'Orbital Period', value: '1.88 Earth Years', reference: '687 Earth Days' },
        { metric: 'Gravity Index', value: '3.72 m/s²', reference: '0.38 × Earth Gravity' },
        { metric: 'Surface Temp', value: '-62°C (average)', reference: 'Ranges from -153°C to 20°C' }
      ],
      sec1Title: '1.0 PRIMARY CORE METRICS & STRUCTURAL MATRIX',
      sec1Text: 'Mars, the fourth planet from the Sun, is a terrestrial world with a thin carbon dioxide atmosphere and a surface rich in iron oxides, giving it a rusty appearance. Its interior is believed to consist of a solid iron, nickel, and sulfur core surrounded by a silicate mantle. The geological history reveals ancient volcanism and tectonic activity, including the Tharsis bulge, home to Olympus Mons, the largest volcano in the Solar System.',
      sec2Title: '2.0 ORBITAL MECHANICS & TELEMETRY FIELD ANALYSES',
      sec2Text: 'Mars has an eccentric orbit at 1.52 AU, taking 687 Earth days to orbit the Sun. Spacecraft traveling to Mars must align their departure during launch windows occurring every 26 months. Telemetry data shows a high radiation profile on the surface due to the lack of a global magnetic field, requiring subterranean shielding concepts for future human habitats.',
      sec3Title: '3.0 OBSERVATIONAL CHRONOLOGY & FUTURE STUDY LABELS',
      sec3Text: 'Mars exploration spans decades of robotic landing events (Viking, Spirit, Opportunity, Curiosity, Perseverance). Future research outlines crewed planetary flybys and eventual surface settlement, relying heavily on in-situ resource utilization (ISRU) for rocket fuel and water.',
      bibliography: [
        '[1] Sterling, E. "Martian Crustal Stratigraphy," Exo-Geology Studies, 2024.',
        '[2] ESA Research Bulletin. "Atmospheric Depletion Metrics on Mars," Vol. 12, 2025.'
      ],
      signatureTitle: 'Chief of Exo-Geological Studies',
      signatureName: 'Dr. Elena Sterling',
      archivist: 'OrbitX AI System #MS-04'
    },
    flashcards: [
      { question: 'Why is Mars red?', answer: 'The surface is covered in iron oxide, or rust particles, which remain suspended in the thin atmosphere.' },
      { question: 'What is the tallest volcano on Mars?', answer: 'Olympus Mons, a shield volcano that stands approximately 22 km (13.6 miles) high.' },
      { question: 'What are the names of Mars\' two moons?', answer: 'Phobos (Fear) and Deimos (Panic), named after the horses of the Greek war god Ares.' },
      { question: 'What is the primary gas in the Martian atmosphere?', answer: 'Carbon Dioxide (CO₂), which makes up about 95% of the thin atmosphere.' }
    ]
  },
  'black hole': {
    title: 'Black Holes & Singularity Physics',
    stats: [
      { label: 'AI CONFIDENCE', value: '99.5%', icon: Brain },
      { label: 'STUDY TIME', value: '8 Mins', icon: Clock },
      { label: 'FOCUS COUNT', value: '4 Major Areas', icon: ShieldCheck }
    ],
    bullets: [
      'A black hole is a region of spacetime where gravity is so strong that nothing, not even electromagnetic radiation, can escape its pull.',
      'The boundary surrounding a black hole from which no escape is possible is called the event horizon, defining its Schwarzschild radius.',
      'At the center of a black hole lies a singularity, a point where matter is infinitely compressed and spacetime curvature becomes infinite.',
      'Stellar-mass black holes form from the gravitational collapse of massive stars at the end of their lifecycle.',
      'Supermassive black holes, containing millions to billions of solar masses, exist at the core of most galaxies, including our own Milky Way.'
    ],
    detailedAnalysis: {
      title: 'Cosmological Singularities & Relativistic Fields',
      sections: [
        {
          heading: '1. Einsteinian Space-Time Curvature',
          text: 'Black holes are defined by Einstein\'s general theory of relativity. When a massive star runs out of nuclear fuel, its core can collapse under its own gravity. If the core mass exceeds the Tolman-Oppenheimer-Volkoff limit, the gravitational collapse continues indefinitely, warping spacetime.'
        },
        {
          heading: '2. The Event Horizon & Schwarzschild Boundary',
          text: 'The event horizon represents the threshold of no return. Beyond this point, escape velocity exceeds the speed of light. The Schwarzschild radius defines this limit for a non-rotating black hole. Rotating black holes, described by the Kerr metric, exhibit an outer ergosphere where spacetime is dragged.'
        },
        {
          heading: '3. Accretion Disks & Relativistic Jets',
          text: 'Gas and dust orbiting a black hole form a flat accretion disk. Viscous forces heat the disk to millions of degrees, causing it to emit intense X-ray radiation. Magnetic fields can channel some of this infalling matter into relativistic jets, which shoot out from the poles at near light speed.'
        },
        {
          heading: '4. Hawking Radiation & Evaporation',
          text: 'Stephen Hawking proposed that black holes are not completely black. Quantum fluctuations near the event horizon can produce virtual particles, where one falls in and the other escapes. This quantum emission, known as Hawking Radiation, causes black holes to slowly lose mass and eventually evaporate.'
        }
      ]
    },
    pdfSummary: {
      docId: 'ORB-BH-2026-U01',
      title: 'SINGULARITY MECHANICS & SPACE-TIME CURVATURE REPORT',
      table: [
        { metric: 'Escape Velocity', value: '3.00 × 10⁸ m/s', reference: 'Speed of Light (c)' },
        { metric: 'Density Index', value: 'Infinite (at Singularity)', reference: 'Unresolved by Standard Physics' },
        { metric: 'Galactic Center BH', value: 'Sagittarius A*', reference: '4.3 Million Solar Masses' },
        { metric: 'Event Horizon Temp', value: 'Near Absolute Zero', reference: 'For Stellar Mass BH' },
        { metric: 'Spin Coefficient', value: '0 to 1 (Kerr Limit)', reference: 'Relativistic Rotation Parameter' }
      ],
      sec1Title: '1.0 PRIMARY CORE METRICS & STRUCTURAL MATRIX',
      sec1Text: 'A black hole is an infinitely dense region of spacetime created by the gravitational collapse of massive stellar bodies. The physics are defined by Einstein\'s general theory of relativity. At the boundary—the event horizon—the escape velocity equals the speed of light, preventing any electromagnetic radiation from escaping. At the exact center lies a singularity where current laws of physics break down.',
      sec2Title: '2.0 ORBITAL MECHANICS & TELEMETRY FIELD ANALYSES',
      sec2Text: 'Orbits around black holes are subject to extreme relativistic effects, including gravitational time dilation and frame-dragging. Matter falling toward the event horizon forms a superheated accretion disk, emitting intense X-rays. Satellite path telemetry near black holes would experience severe time offsets relative to distant observers, described by the Schwarzschild metric.',
      sec3Title: '3.0 OBSERVATIONAL CHRONOLOGY & FUTURE STUDY LABELS',
      sec3Text: 'Observational milestones include the detection of gravitational waves by LIGO in 2015 and the direct imaging of accretion disks by the Event Horizon Telescope (EHT) in 2019. Future studies target high-resolution polarization mapping to resolve black hole jet mechanics.',
      bibliography: [
        '[1] Hawking, L. "Quantum Manifestations of Event Horizons," Physics Reports, 2024.',
        '[2] Event Horizon Consortium. "Imaging of Sagittarius A*," Astrophysical Journal, 2023.'
      ],
      signatureTitle: 'Chair of Theoretical Studies',
      signatureName: 'Prof. Lucas Hawking',
      archivist: 'OrbitX AI System #BH-99'
    },
    flashcards: [
      { question: 'What defines the boundary of a black hole?', answer: 'The event horizon, which is the point of no return where the escape velocity exceeds the speed of light.' },
      { question: 'What is the singularity of a black hole?', answer: 'The point at the center of a black hole where all mass is compressed to infinite density, causing infinite spacetime curvature.' },
      { question: 'How do stellar-mass black holes form?', answer: 'From the gravitational collapse of a massive star (at least 20 times the mass of the Sun) at the end of its life.' },
      { question: 'What is Hawking Radiation?', answer: 'A theoretical thermal radiation emitted by black holes due to quantum effects near the event horizon, leading to mass loss.' }
    ]
  },
  default: {
    title: 'Space & Cosmic Exploration',
    stats: [
      { label: 'AI CONFIDENCE', value: '99.2%', icon: Brain },
      { label: 'STUDY TIME', value: '7 Mins', icon: Clock },
      { label: 'FOCUS COUNT', value: '2 Major Areas', icon: ShieldCheck }
    ],
    bullets: [
      'The universe is approximately 13.8 billion years old, expanding continuously at an accelerating rate driven by dark energy.',
      'Ordinary baryonic matter (stars, planets, interstellar gas) accounts for only 5% of the total mass-energy content of the universe.',
      'Dark matter (27%) and dark energy (68%) make up the remaining 95%, behaving as invisible gravitational and repulsive forces.',
      'Celestial orbital mechanics are governed by Kepler\'s three laws of planetary motion and Newton\'s law of gravitation.',
      'Nuclear fusion occurring in stellar cores converts hydrogen into helium, generating the light and heat radiated by stars.'
    ],
    detailedAnalysis: {
      title: 'Cosmological Abstractions & Orbital Telemetry',
      sections: [
        {
          heading: '1. Stellar Physics & Nuclear Synthesis',
          text: 'Stars are cosmic engines fueled by nuclear fusion. In their core, immense pressure and temperature force hydrogen nuclei to fuse into helium, releasing energy. When stellar hydrogen is exhausted, heavier elements are synthesized (carbon, oxygen, up to iron). Supernova explosions scatter these elements, seeding future planets.'
        },
        {
          heading: '2. The Mystery of the Dark Sectors',
          text: 'Modern physics is challenged by the fact that 95% of the universe is invisible. Dark Matter acts as an invisible gravitational glue, keeping galaxies from spinning apart. Dark Energy, on the other hand, exerts a repulsive pressure that accelerates the expansion of space itself. Both remain undetected directly.'
        },
        {
          heading: '3. Orbital Mechanics & Satellite Propagation',
          text: 'Trajectories of spacecraft and satellites are governed by gravitational physics. Kepler\'s laws state orbits are elliptical, with speed increasing near the periapsis. Achieving orbit requires balancing tangential velocity with gravitational pull, creating a state of perpetual freefall.'
        },
        {
          heading: '4. Deep Space Telescopes & Cosmological Horizons',
          text: 'Instruments like the James Webb Space Telescope (JWST) peer back in time by detecting infrared light shifted by the expansion of the universe. By observing the first stars and galaxies, astronomers trace the cosmic history of element formation and look for chemical markers of habitability.'
        }
      ]
    },
    pdfSummary: {
      docId: 'ORB-GEN-2026-U01',
      title: 'UNIVERSAL COSMOLOGICAL SURVEY & ORBITAL ANALYSIS',
      table: [
        { metric: 'Age of Universe', value: '13.78 Billion Years', reference: 'Planck Satellite Telemetry' },
        { metric: 'Speed of Light', value: '299,792,458 m/s', reference: 'Fundamental Physical Constant' },
        { metric: 'Baryonic Matter', value: 'approx. 4.9%', reference: 'Stars, Gas, Planets Combined' },
        { metric: 'Hubble Constant', value: '67.4 km/s/Mpc', reference: 'Expansion Rate Parameter' },
        { metric: 'Gravitational Const', value: '6.674 × 10⁻¹¹ m³/kg·s²', reference: 'Universal Scaling Constant' }
      ],
      sec1Title: '1.0 PRIMARY CORE METRICS & STRUCTURAL MATRIX',
      sec1Text: 'The cosmos comprises trillions of galaxies, stars, and planetary systems undergoing constant evolution. Visible matter is composed of protons, neutrons, and electrons, forming the elements of the periodic table. The structure of galaxies is guided by gravitational interactions, holding together gas, dust, and dark matter. Cosmic history starts with the Big Bang, expanding space itself.',
      sec2Title: '2.0 ORBITAL MECHANICS & TELEMETRY FIELD ANALYSES',
      sec2Text: 'Orbital dynamics govern the movement of all celestial bodies. Keplerian orbits establish circular, elliptical, parabolic, or hyperbolic paths. Telemetry systems track spacecraft trajectories through the Deep Space Network (DSN), correcting for planetary gravitation, solar radiation pressure, and relativistic time drift.',
      sec3Title: '3.0 OBSERVATIONAL CHRONOLOGY & FUTURE STUDY LABELS',
      sec3Text: 'Astro-observation has advanced from optical lenses to radio arrays and space telescopes. The current scientific era utilizes multi-messenger astronomy, combining electromagnetic wave data, gravitational waves, and neutrino counts to resolve cosmological anomalies.',
      bibliography: [
        '[1] Hawking, L. "Universal Expansion Constants," Cosmological Manifests, 2026.',
        '[2] Deep Space Consortium. "Space Telemetry and Navigation Models," Vol. 45, 2025.'
      ],
      signatureTitle: 'Chair of Theoretical Studies',
      signatureName: 'Prof. Lucas Hawking',
      archivist: 'OrbitX AI System #U-01'
    },
    flashcards: [
      { question: 'How old is the universe according to cosmic measurements?', answer: 'Approximately 13.8 billion years, determined from the Cosmic Microwave Background radiation.' },
      { question: 'What percentage of the universe consists of visible, ordinary matter?', answer: 'Only about 4.9% of the universe is baryonic (ordinary) matter.' },
      { question: 'What is Kepler\'s First Law of Planetary Motion?', answer: 'All planets and satellites move in elliptical orbits with the central body (sun/planet) at one focus.' },
      { question: 'What is a light-year?', answer: 'The distance light travels in a vacuum in one year, which is roughly 9.46 trillion kilometers (5.88 trillion miles).' }
    ]
  }
};

const getSubjectFromQuery = (query) => {
  let subject = query.trim();
  subject = subject.replace(/^(about|give notes about|notes on|tell me about|what is|notes about|info on|information about|give info on|search for|search|notes for)\s+/i, '');
  subject = subject.replace(/[?.,!]+$/, '');
  return subject || 'Space';
};

const generateDynamicData = (subject) => {
  const cap = subject.charAt(0).toUpperCase() + subject.slice(1);
  return {
    title: `${cap} (Cosmic Analysis Profile)`,
    stats: [
      { label: 'AI CONFIDENCE', value: '98.4%', icon: Brain },
      { label: 'STUDY TIME', value: '5 Mins', icon: Clock },
      { label: 'FOCUS COUNT', value: '3 Major Areas', icon: ShieldCheck }
    ],
    bullets: [
      `A thorough investigation into ${cap} reveals complex cosmic interactions and unique structural properties within the space continuum.`,
      `Scientific telemetry shows that ${cap} operates under extreme thermodynamic conditions, shaping the surrounding stellar environment.`,
      `Key gravitational and atmospheric parameters of ${cap} indicate highly specialized physical dynamics unique to this cosmological object.`,
      `Recent satellite missions and optical observations have gathered extensive data blocks defining the chemical signatures of ${cap}.`,
      `Ongoing astrobiological and physical research positions ${cap} as a critical milestone for future deep-space exploration telemetry.`
    ],
    detailedAnalysis: {
      title: `${cap} Physical Dynamics & Structural Analysis`,
      sections: [
        {
          heading: `1. Overview of the ${cap} Phenomenon`,
          text: `Scientific consensus defines ${cap} as a focal point of astrophysical study. Its unique spatial coordinates and electromagnetic signature offer critical clues about stellar evolution and galactic chemistry. Standard telemetry indicates high concentrations of elemental materials typical of outer space structures.`
        },
        {
          heading: `2. Composition and Environmental Mechanics`,
          text: `Spectroscopic analysis of ${cap} suggests a multi-layered structural composition. The external boundaries interact dynamically with solar winds and cosmic radiation fields. In the deeper layers, gravity and temperature gradients scale rapidly, establishing complex equilibrium models.`
        },
        {
          heading: `3. Telemetry and Gravitational Profile`,
          text: `Orbits near or within ${cap} require complex calculations due to localized gravitational anomalies. Spacecraft propagation paths are modeled using Newtonian and Einsteinian orbital algorithms to avoid structural decay or trajectory drift caused by magnetic perturbations.`
        },
        {
          heading: `4. Future Observations and Exploration Horizons`,
          text: `Exploring ${cap} remains a top priority for space agencies worldwide. High-resolution infrared imaging from next-generation space telescopes aims to resolve the boundary layers and internal dynamics, paving the way for targeted robotic flybys and eventual in-situ mapping.`
        }
      ]
    },
    pdfSummary: {
      docId: `ORB-${subject.slice(0, 3).toUpperCase()}-2026-X12`,
      title: `${cap.toUpperCase()} STRUCTURAL BRIEFING & SPECTROMETRIC REPORT`,
      table: [
        { metric: 'Target Object', value: cap, reference: 'Primary Space Query' },
        { metric: 'Data Reliability', value: '98.4% AI Match', reference: 'Telemetry Confidence' },
        { metric: 'Orbital Reference', value: 'Dynamic Celestial Frame', reference: 'Locational Vector Coordinates' },
        { metric: 'Thermal Profile', value: 'Variable Range', reference: 'Spectral Telemetry Readings' },
        { metric: 'Priority Status', value: 'Active Class-A Study', reference: 'OrbitX Catalog Level' }
      ],
      sec1Title: '1.0 PRIMARY CORE METRICS & STRUCTURAL MATRIX',
      sec1Text: `A comprehensive assessment of ${cap} establishes a highly dense structural footprint characterized by localized physical variations. Research manifest data suggests that the core dynamics are sustained by stellar interactions and gravitational accretion of interstellar dust. Scientific cataloging classifies this target as an active area of exo-study.`,
      sec2Title: '2.0 ORBITAL MECHANICS & TELEMETRY FIELD ANALYSES',
      sec2Text: `Orbital profiles around ${cap} are mapped using advanced tracking nodes. Spacecraft navigating through these regions must execute precise trajectory burns to counteract local gravity fields. Remote sensing telemetry records continuous particle emissions and radio signals, contributing to our cosmic dataset.`,
      sec3Title: '3.0 OBSERVATIONAL CHRONOLOGY & FUTURE STUDY LABELS',
      sec3Text: `Milestones in cataloging ${cap} include remote sensing from earth arrays and deep-space telescope passes. Future research proposals aim to deploy specialized nanosats to monitor local atmospheric changes and record structural density readings over a extended period.`,
      bibliography: [
        `[1] Vance, A. "Dynamic Studies on ${cap}," OrbitX Astrophysical Journal, 2026.`,
        `[2] OrbitX AI Science Network. "Automated Telemetry Profile: ${cap}," Manifest Ref ORB-DYN.`
      ],
      signatureTitle: 'Director of Cosmic Telemetry',
      signatureName: 'Dr. Arthur Vance',
      archivist: `OrbitX AI System #${subject.slice(0, 2).toUpperCase()}-99`
    },
    flashcards: [
      { question: `What is the primary scientific classification of ${cap}?`, answer: `It is categorized as a prominent celestial subject of interest, characterized by its localized gravitational footprint and structural boundaries.` },
      { question: `How do space probes measure the chemical footprint of ${cap}?`, answer: `Via multi-spectral spectroscopic telemetry, capturing infrared, ultraviolet, and visible light emission wavelengths.` },
      { question: `What is the main challenge in navigating near ${cap}?`, answer: `Localized magnetic interference and gravitational fluctuations that require automated trajectory correction algorithms.` },
      { question: `Why is ${cap} vital for modern cosmic research?`, answer: `Understanding its composition explains the stellar chemistry and orbital mechanics of the local galactic region.` }
    ]
  };
};

export default function SpaceNotesAI({ prefilledTopic, onTopicProcessed }) {
  const [searchInput, setSearchInput] = useState('');
  const [selectedTab, setSelectedTab] = useState('Short Notes');
  const [currentData, setCurrentData] = useState(cosmicKnowledgeBase.default);

  // Deep-Link Auto-Search trigger
  useEffect(() => {
    if (prefilledTopic) {
      setSearchInput(prefilledTopic);
      setIsGenerating(true);
      setProgressPercent(0);
      setTerminalLogs([]);

      const logsList = [
        { prg: 5, msg: 'Initializing OrbitX AI Deep-Space Synthesis Engine...' },
        { prg: 15, msg: 'Connecting to planetary telemetry registry...' },
        { prg: 32, msg: `Querying orbital data archives for: "${prefilledTopic}"...` },
        { prg: 48, msg: 'Parsing multi-spectral data blocks & chemical logs...' },
        { prg: 65, msg: 'Formatting structured study summaries & concept briefs...' },
        { prg: 80, msg: 'Generating academic white-paper PDF previews...' },
        { prg: 90, msg: 'Assembling active-recall study flashcards...' },
        { prg: 98, msg: 'Applying final diagnostic checks...' },
        { prg: 100, msg: 'Synthesis complete. Initializing study console!' }
      ];

      let currentLogIndex = 0;
      const interval = setInterval(() => {
        if (currentLogIndex < logsList.length) {
          const nextLog = logsList[currentLogIndex];
          setTerminalLogs((prev) => [...prev, nextLog.msg]);
          setProgressPercent(nextLog.prg);
          currentLogIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            const queryKey = prefilledTopic.toLowerCase();
            const extractedSubject = getSubjectFromQuery(prefilledTopic);

            if (queryKey.includes('jupiter') || queryKey.includes('jovian')) {
              setCurrentData(cosmicKnowledgeBase.jupiter);
            } else if (queryKey.includes('mars') || queryKey.includes('martian')) {
              setCurrentData(cosmicKnowledgeBase.mars);
            } else if (queryKey.includes('black hole') || queryKey.includes('singularity') || queryKey.includes('event horizon')) {
              setCurrentData(cosmicKnowledgeBase['black hole']);
            } else {
              setCurrentData(generateDynamicData(extractedSubject));
            }
            setIsGenerating(false);
            setSelectedTab('Short Notes');
            setCurrentCardIndex(0);
            setIsFlipped(false);
            if (onTopicProcessed) {
              onTopicProcessed();
            }
          }, 500);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [prefilledTopic]);

  // Terminal State Loops
  const [isGenerating, setIsGenerating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;

    setIsGenerating(true);
    setProgressPercent(0);
    setTerminalLogs([]);

    const logsList = [
      { prg: 5, msg: 'Initializing OrbitX AI Deep-Space Synthesis Engine...' },
      { prg: 15, msg: 'Connecting to planetary telemetry registry...' },
      { prg: 32, msg: `Querying orbital data archives for: "${searchInput}"...` },
      { prg: 48, msg: 'Parsing multi-spectral data blocks & chemical logs...' },
      { prg: 65, msg: 'Formatting structured study summaries & concept briefs...' },
      { prg: 80, msg: 'Generating academic white-paper PDF previews...' },
      { prg: 90, msg: 'Assembling active-recall study flashcards...' },
      { prg: 98, msg: 'Applying final diagnostic checks...' },
      { prg: 100, msg: 'Synthesis complete. Initializing study console!' }
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logsList.length) {
        const nextLog = logsList[currentLogIndex];
        setTerminalLogs((prev) => [...prev, nextLog.msg]);
        setProgressPercent(nextLog.prg);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          const queryKey = searchInput.toLowerCase();
          const extractedSubject = getSubjectFromQuery(searchInput);

          if (queryKey.includes('jupiter') || queryKey.includes('jovian')) {
            setCurrentData(cosmicKnowledgeBase.jupiter);
          } else if (queryKey.includes('mars') || queryKey.includes('martian')) {
            setCurrentData(cosmicKnowledgeBase.mars);
          } else if (queryKey.includes('black hole') || queryKey.includes('singularity') || queryKey.includes('event horizon')) {
            setCurrentData(cosmicKnowledgeBase['black hole']);
          } else {
            setCurrentData(generateDynamicData(extractedSubject));
          }
          setIsGenerating(false);
          setSelectedTab('Short Notes');
          setCurrentCardIndex(0);
          setIsFlipped(false);
        }, 500);
      }
    }, 300);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen max-w-5xl mx-auto space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider uppercase font-sans">
            Space Notes AI
          </h2>
          <p className="text-xs text-cyber-cyan font-bold tracking-widest uppercase mt-0.5">
            Educational Synthesis Hub
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[#101726]/80 px-3 py-1.5 rounded-lg border border-border-cyan/50 text-[10px] font-bold text-cyber-cyan/80 tracking-widest uppercase">
          <Terminal className="w-3.5 h-3.5" />
          Offline AI Node Active
        </div>
      </div>

      {/* Search Console */}
      <form onSubmit={handleSearch} className="no-print">
        <div className="glass-panel rounded-2xl p-4 flex gap-3 items-center border border-border-cyan/40">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="e.g. Give notes about Jupiter..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-black/30 border border-white/[0.06] focus:border-cyber-cyan/40 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-300 font-medium"
            />
          </div>
          <button
            type="submit"
            className="bg-cyber-cyan hover:bg-[#00cce6] text-black font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.25)] flex items-center gap-2"
          >
            Generate
          </button>
        </div>
      </form>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-1 no-print">
        {['Short Notes', 'Detailed Analysis', 'PDF Summary', 'Study Flashcards'].map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setSelectedTab(tab);
                setIsFlipped(false);
              }}
              className={`px-5 py-2.5 rounded-t-xl text-xs font-bold tracking-wider uppercase border-b-2 cursor-pointer transition-all duration-300 ${
                isActive
                  ? 'border-cyber-cyan text-cyber-cyan bg-cyber-cyan/[0.04]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Content Pane */}
      <div className="mt-4 print-sheet">
        <div className="mb-4 flex items-center justify-between no-print">
          <h3 className="text-[11px] font-bold text-cyber-cyan/70 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
            Topic: {currentData.title}
          </h3>
          {selectedTab === 'PDF Summary' && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-cyber-cyan/15 hover:bg-cyber-cyan/20 border border-cyber-cyan/30 text-cyber-cyan font-bold text-[10px] tracking-widest uppercase px-3.5 py-1.5 rounded-lg cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save
            </button>
          )}
        </div>

        {/* Tab content rendering */}
        {selectedTab === 'Short Notes' && (
          <div className="space-y-6 no-print">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentData.stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="glass-panel p-4 rounded-2xl flex items-center gap-4 border border-border-cyan/20">
                    <div className="w-10 h-10 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/20 flex items-center justify-center text-cyber-cyan shadow-[0_0_10px_rgba(0,229,255,0.1)]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                      <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bullet list highlights card */}
            <div className="glass-panel p-6 rounded-2xl border border-border-cyan/20 space-y-4">
              <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-white/[0.05] pb-2">
                Synthesized Highlights
              </h4>
              <ul className="space-y-3.5">
                {currentData.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-300 text-sm leading-relaxed align-top">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan mt-2 shrink-0 shadow-[0_0_6px_#00E5FF]" />
                    <p>{bullet}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {selectedTab === 'Detailed Analysis' && (
          <div className="glass-panel p-6 rounded-2xl border border-border-cyan/20 space-y-6 no-print">
            <h4 className="text-lg font-black text-white tracking-wide border-b border-white/[0.05] pb-3">
              {currentData.detailedAnalysis.title}
            </h4>
            <div className="space-y-5">
              {currentData.detailedAnalysis.sections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h5 className="text-sm font-bold text-cyber-cyan tracking-wider uppercase">
                    {section.heading}
                  </h5>
                  <p className="text-slate-300 text-sm leading-relaxed text-justify">
                    {section.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'PDF Summary' && (
          <div className="bg-white text-black p-8 md:p-12 rounded-2xl border border-slate-300 shadow-xl print-sheet max-w-4xl mx-auto space-y-8 font-serif leading-relaxed text-sm">
            {/* Header with Academic seal */}
            <div className="flex items-center gap-5 border-b-2 border-black pb-5">
              <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center shrink-0">
                <Brain className="w-9 h-9 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-widest uppercase font-sans">
                  ORBITX AEROSPACE ACADEMY RESEARCH MANIFEST
                </h2>
                <p className="text-[10px] font-bold text-slate-700 tracking-wider uppercase font-sans">
                  Global Space Knowledge Registry • Archive Office
                </p>
              </div>
            </div>

            {/* Document Info */}
            <div className="space-y-1">
              <h1 className="text-2xl font-black font-sans tracking-tight text-center uppercase my-4">
                {currentData.pdfSummary.title}
              </h1>
              <p className="text-center font-mono text-xs text-slate-500 uppercase tracking-widest border-y border-slate-200 py-1.5">
                DOCUMENT REF ID: {currentData.pdfSummary.docId} • DATE: July 2026
              </p>
            </div>

            {/* Section 1 */}
            <div className="space-y-2">
              <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-slate-800">
                {currentData.pdfSummary.sec1Title || "1.0 PRIMARY CORE METRICS & STRUCTURAL MATRIX"}
              </h3>
              <p className="text-slate-800 text-justify text-sm">
                {currentData.pdfSummary.sec1Text}
              </p>
            </div>

            {/* Metrics Table */}
            <div className="border border-slate-400 rounded overflow-hidden">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-400 font-sans font-bold uppercase text-[10px] text-slate-700">
                    <th className="p-2 border-r border-slate-400 w-1/4">PARAMETER</th>
                    <th className="p-2 border-r border-slate-400 w-3/8">SCIENTIFIC VALUE</th>
                    <th className="p-2 w-3/8">REFERENCE COMPARISON</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.pdfSummary.table.map((row, rIdx) => (
                    <tr key={rIdx} className={`border-b border-slate-200 ${rIdx % 2 === 1 ? 'bg-slate-50/55' : ''}`}>
                      <td className="p-2 border-r border-slate-200 font-bold font-sans">{row.metric}</td>
                      <td className="p-2 border-r border-slate-200 font-mono">{row.value}</td>
                      <td className="p-2 text-slate-600">{row.reference}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Section 2 */}
            <div className="space-y-2">
              <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-slate-800">
                {currentData.pdfSummary.sec2Title || "2.0 ORBITAL MECHANICS & TELEMETRY FIELD ANALYSES"}
              </h3>
              <p className="text-slate-800 text-justify text-sm">
                {currentData.pdfSummary.sec2Text}
              </p>
            </div>

            {/* Section 3 */}
            <div className="space-y-2">
              <h3 className="font-sans font-bold text-xs tracking-wider uppercase text-slate-800">
                {currentData.pdfSummary.sec3Title || "3.0 OBSERVATIONAL CHRONOLOGY & FUTURE STUDY LABELS"}
              </h3>
              <p className="text-slate-800 text-justify text-sm">
                {currentData.pdfSummary.sec3Text}
              </p>
            </div>

            {/* Bibliography */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <h4 className="font-sans font-bold text-[10px] tracking-wider uppercase text-slate-500">
                BIBLIOGRAPHY & SOURCE REFERENCES
              </h4>
              <div className="space-y-1 font-mono text-[10px] text-slate-500">
                {currentData.pdfSummary.bibliography.map((bib, bIdx) => (
                  <p key={bIdx}>{bib}</p>
                ))}
              </div>
            </div>

            {/* Signature Block */}
            <div className="flex justify-between items-end pt-8 border-t border-slate-100 font-sans text-xs">
              <div className="text-center w-48">
                <span className="italic font-serif block mb-1 text-slate-700">{currentData.pdfSummary.signatureName}</span>
                <div className="h-[1px] bg-slate-400 w-full mb-1" />
                <span className="text-[10px] text-slate-500 uppercase font-semibold">{currentData.pdfSummary.signatureTitle}</span>
              </div>
              <div className="text-center w-48">
                <span className="italic block mb-1 text-[#00a89d] font-semibold">OrbitX System Certified</span>
                <div className="h-[1px] bg-slate-400 w-full mb-1" />
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Archivist: {currentData.pdfSummary.archivist}</span>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'Study Flashcards' && (
          <div className="flex flex-col items-center py-6 space-y-6 no-print">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              CARD {currentCardIndex + 1} OF {currentData.flashcards.length}
            </span>

            {/* 3D Flashcard Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-lg h-64 perspective-1000 cursor-pointer"
            >
              <div
                className={`w-full h-full relative duration-500 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* Front (Question) */}
                <div className="absolute w-full h-full backface-hidden glass-panel-glow border border-border-cyan/40 rounded-3xl p-6 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-cyber-cyan border-b border-white/[0.05] pb-3">
                    <Brain className="w-5 h-5" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">Question Probe</span>
                  </div>
                  <p className="text-white text-center text-lg font-semibold px-4 my-auto leading-relaxed">
                    {currentData.flashcards[currentCardIndex].question}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] font-bold tracking-widest uppercase border-t border-white/[0.03] pt-3">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click Card to Reveal Answer
                  </div>
                </div>

                {/* Back (Answer) */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-[#071d18]/90 border border-cyber-green/30 rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_20px_rgba(0,255,157,0.1)]">
                  <div className="flex items-center gap-2 text-cyber-green border-b border-white/[0.05] pb-3">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-[10px] font-bold tracking-widest uppercase">Verified Answer</span>
                  </div>
                  <p className="text-slate-100 text-center text-[15px] font-medium px-4 my-auto leading-relaxed">
                    {currentData.flashcards[currentCardIndex].answer}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[10px] font-bold tracking-widest uppercase border-t border-white/[0.03] pt-3">
                    <RotateCw className="w-3.5 h-3.5" />
                    Click to Flip back to Question
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4">
              <button
                disabled={currentCardIndex === 0}
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => setCurrentCardIndex(currentCardIndex - 1), 150);
                }}
                className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyber-cyan/40 hover:bg-cyber-cyan/10 flex items-center justify-center text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                disabled={currentCardIndex === currentData.flashcards.length - 1}
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => setCurrentCardIndex(currentCardIndex + 1), 150);
                }}
                className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyber-cyan/40 hover:bg-cyber-cyan/10 flex items-center justify-center text-slate-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all duration-200"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simulated AI Progress Overlay Terminal */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4 no-print">
          <div className="w-full max-w-2xl bg-[#03060f] border border-cyber-cyan/40 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.25)] flex flex-col h-[400px]">
            {/* Terminal Header */}
            <div className="bg-[#090e1b] px-4 py-3 flex items-center justify-between border-b border-border-cyan/30">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <span className="text-[10px] font-bold text-cyber-cyan tracking-widest uppercase">
                ORBITX AI COGNITIVE SYNTHESIS
              </span>
              <div className="w-12" />
            </div>

            {/* Terminal Console */}
            <div className="flex-1 p-5 font-mono text-xs text-cyber-cyan/85 overflow-y-auto space-y-2 bg-[#020409]">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="text-slate-500 font-sans shrink-0">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-cyber-green font-sans shrink-0">&gt;</span>
                  <span className="text-slate-200">{log}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-cyber-cyan animate-pulse mt-2">
                <span className="w-2 h-4 bg-cyber-cyan" />
                <span>Generating matrix assets...</span>
              </div>
            </div>

            {/* Terminal Progress Bar */}
            <div className="p-4 bg-[#090e1b] border-t border-border-cyan/30 space-y-2">
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.04]">
                <div
                  className="h-full bg-gradient-to-r from-cyber-cyan to-blue-500 rounded-full transition-all duration-300 shadow-[0_0_8px_#00E5FF]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-slate-400 tracking-wider">
                <span className="uppercase text-cyber-cyan">Compiling knowledge block...</span>
                <span>{progressPercent}% COMPLETE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
