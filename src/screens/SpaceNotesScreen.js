import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import BackgroundGradient from '../components/BackgroundGradient';
import GlassCard from '../components/GlassCard';
import { COLORS, FONTS, SPACING } from '../theme/theme';

// Advanced Cosmic Intelligence Dictionary
const cosmicKnowledgeBase = {
  jupiter: {
    title: 'Jupiter (Jovian System Analysis)',
    stats: [
      { label: 'AI CONFIDENCE', value: '99.8%', icon: 'brain' },
      { label: 'STUDY TIME', value: '6 Mins', icon: 'clock-outline' },
      { label: 'FOCUS COUNT', value: '3 Major Areas', icon: 'target' }
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
          heading: '3. Metallic Hydrogen Ocean & Magnetosphere',
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
      { label: 'AI CONFIDENCE', value: '98.9%', icon: 'brain' },
      { label: 'STUDY TIME', value: '5 Mins', icon: 'clock-outline' },
      { label: 'FOCUS COUNT', value: '2 Major Areas', icon: 'target' }
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
          text: 'The Martian atmosphere is thin, with surface pressure averaging only 6 millibars. Lacking a global magnetic field, solar winds slowly strip away the upper atmosphere. Temperatures range from 20°C at noon to -153°C at night, creating polar ice caps composed of water ice and dry ice (CO₂).'
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
      { label: 'AI CONFIDENCE', value: '99.5%', icon: 'brain' },
      { label: 'STUDY TIME', value: '8 Mins', icon: 'clock-outline' },
      { label: 'FOCUS COUNT', value: '4 Major Areas', icon: 'target' }
    ],
    bullets: [
      'A black hole is a region of spacetime where gravity is so strong that nothing, not even electromagnetic radiation, can escape its pull.',
      'The boundary surrounding a black hole from which no escape is possible is called the event horizon, defining its Schwarzschild radius.',
      'At the center of a black hole lies a singularity, a point where matter is infinitely compressed and spacetime curvature becomes infinite.',
      'Stellar-mass black holes form from the gravitational collapse of massive stars at the end of their stellar lifecycle.',
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
      { label: 'AI CONFIDENCE', value: '99.2%', icon: 'brain' },
      { label: 'STUDY TIME', value: '7 Mins', icon: 'clock-outline' },
      { label: 'FOCUS COUNT', value: '2 Major Areas', icon: 'target' }
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

// Prefix sanitizer to isolate user subject
const getSubjectFromQuery = (query) => {
  let subject = query.trim();
  // Strip typical inquiry and research prefix phrases
  subject = subject.replace(/^(about|give notes about|notes on|tell me about|what is|notes about|info on|information about|give info on|search for|search|notes for)\s+/i, '');
  // Clean off trailing punctuation marks
  subject = subject.replace(/[?.,!]+$/, '');
  return subject || 'Space';
};

// Dynamic Generator to construct specialized content for custom entries
const generateDynamicData = (subject) => {
  const cap = subject.charAt(0).toUpperCase() + subject.slice(1);
  return {
    title: `${cap} (Cosmic Analysis Profile)`,
    stats: [
      { label: 'AI CONFIDENCE', value: '98.4%', icon: 'brain' },
      { label: 'STUDY TIME', value: '5 Mins', icon: 'clock-outline' },
      { label: 'FOCUS COUNT', value: '3 Major Areas', icon: 'target' }
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

const SpaceNotesScreen = ({ navigation }) => {
  if (navigation && !navigation.openDrawer) {
    const { openDrawer } = require('../navigation/RootNavigation');
    navigation.openDrawer = openDrawer;
  }

  const [searchInput, setSearchInput] = useState('');
  const [selectedTab, setSelectedTab] = useState('Short Notes');
  const [currentData, setCurrentData] = useState(cosmicKnowledgeBase.default);
  
  // Terminal Progress States
  const [isGenerating, setIsGenerating] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const rotateY = useSharedValue(0);

  // Listen to flip state and animate rotation
  useEffect(() => {
    rotateY.value = withSpring(isFlipped ? 180 : 0, {
      damping: 15,
      stiffness: 100
    });
  }, [isFlipped, rotateY]);

  const handleSearch = () => {
    if (!searchInput.trim()) return;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsGenerating(true);
    setProgressPercent(0);
    setTerminalLogs([]);

    const logsList = [
      { prg: 5, msg: 'Initializing OrbitX AI Deep-Space Synthesis Engine...' },
      { prg: 15, msg: 'Connecting to planetary telemetry registry...' },
      { prg: 30, msg: `Querying orbital data archives for: "${searchInput}"...` },
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
          // Normalize search key and extract subject
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
        }, 600);
      }
    }, 450);
  };

  const handleNextCard = () => {
    if (currentCardIndex < currentData.flashcards.length - 1) {
      Haptics.selectionAsync();
      setIsFlipped(false);
      // Brief delay to allow flip to reset
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex + 1);
      }, 150);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      Haptics.selectionAsync();
      setIsFlipped(false);
      // Brief delay to allow flip to reset
      setTimeout(() => {
        setCurrentCardIndex(currentCardIndex - 1);
      }, 150);
    }
  };

  // Card Flip Interpolated Styles
  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(rotateY.value, [0, 180], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotation}deg` }
      ],
      opacity: rotateY.value > 90 ? 0 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(rotateY.value, [0, 180], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotation}deg` }
      ],
      opacity: rotateY.value > 90 ? 1 : 0,
    };
  });

  return (
    <BackgroundGradient style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: '#070a13', paddingTop: 45 }}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.burgerButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="menu" size={26} color="#00E5FF" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.title}>SPACE NOTES AI</Text>
            <Text style={styles.subtitle}>Educational Synthesis Hub</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Search Console */}
        <GlassCard style={styles.searchConsole}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g. Give notes about Jupiter..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSearch}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#0b0f19" />
              <View style={{ width: 4 }} />
              <Text style={styles.searchBtnText}>GENERATE</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Tab Selection */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {['Short Notes', 'Detailed Analysis', 'PDF Summary', 'Study Flashcards'].map((tab) => {
              const isActive = selectedTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedTab(tab);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Content Workspace */}
        <View style={styles.workspace}>
          <Text style={styles.topicHeader}>📝 Topic: {currentData.title}</Text>
          
          {selectedTab === 'Short Notes' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
              {/* Stats Grid */}
              <View style={styles.statsGrid}>
                {currentData.stats.map((stat, i) => (
                  <View key={i} style={styles.statCard}>
                    <MaterialCommunityIcons 
                      name={stat.icon === 'brain-glow' ? 'brain' : stat.icon} 
                      size={20} 
                      color="#00E5FF" 
                    />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {/* Bullet Summary Card */}
              <GlassCard style={styles.bulletCard}>
                <Text style={styles.sectionTitle}>SYNTHESIZED HIGHLIGHTS</Text>
                {currentData.bullets.map((bullet, index) => (
                  <View key={index} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </GlassCard>
            </ScrollView>
          )}

          {selectedTab === 'Detailed Analysis' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
              <GlassCard style={styles.analysisCard}>
                <Text style={styles.analysisTitle}>{currentData.detailedAnalysis.title}</Text>
                {currentData.detailedAnalysis.sections.map((section, idx) => (
                  <View key={idx} style={styles.analysisSection}>
                    <Text style={styles.sectionHeading}>{section.heading}</Text>
                    <Text style={styles.sectionBody}>{section.text}</Text>
                  </View>
                ))}
              </GlassCard>
            </ScrollView>
          )}

          {selectedTab === 'PDF Summary' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
              <View style={styles.pdfPaper}>
                {/* Academic Seal Header */}
                <View style={styles.pdfHeader}>
                  <View style={styles.pdfSeal}>
                    <MaterialCommunityIcons name="school" size={24} color="#0f1424" />
                  </View>
                  <View style={styles.pdfHeaderText}>
                    <Text style={styles.pdfUniv}>ORBITX AEROSPACE ACADEMY RESEARCH MANIFEST</Text>
                    <Text style={styles.pdfSubUniv}>Global Space Knowledge Registry • Archive Office</Text>
                  </View>
                </View>
                
                <View style={styles.pdfDivider} />
                
                <Text style={styles.pdfTitle}>{currentData.pdfSummary.title}</Text>
                <Text style={styles.pdfDocId}>DOCUMENT REF ID: {currentData.pdfSummary.docId} • DATE: July 2026</Text>
                
                {/* Document Section 1 */}
                <View style={styles.pdfSectionContainer}>
                  <Text style={styles.pdfSectionHeading}>{currentData.pdfSummary.sec1Title || "1.0 PRIMARY CORE METRICS & STRUCTURAL MATRIX"}</Text>
                  <Text style={styles.pdfSectionBodyText}>{currentData.pdfSummary.sec1Text}</Text>
                </View>

                {/* Structured Table */}
                <View style={styles.pdfTable}>
                  <View style={styles.pdfTableHeader}>
                    <Text style={[styles.pdfCellText, styles.pdfHeaderCell, { flex: 2 }]}>PARAMETER</Text>
                    <Text style={[styles.pdfCellText, styles.pdfHeaderCell, { flex: 3 }]}>SCIENTIFIC VALUE</Text>
                    <Text style={[styles.pdfCellText, styles.pdfHeaderCell, { flex: 3 }]}>REFERENCE COMPARISON</Text>
                  </View>
                  {currentData.pdfSummary.table.map((row, rIdx) => (
                    <View key={rIdx} style={[styles.pdfTableRow, rIdx % 2 === 1 && styles.pdfTableRowAlt]}>
                      <Text style={[styles.pdfCellText, styles.pdfBodyCell, { flex: 2, fontWeight: 'bold' }]}>{row.metric}</Text>
                      <Text style={[styles.pdfCellText, styles.pdfBodyCell, { flex: 3 }]}>{row.value}</Text>
                      <Text style={[styles.pdfCellText, styles.pdfBodyCell, { flex: 3 }]}>{row.reference}</Text>
                    </View>
                  ))}
                </View>

                {/* Document Section 2 */}
                <View style={styles.pdfSectionContainer}>
                  <Text style={styles.pdfSectionHeading}>{currentData.pdfSummary.sec2Title || "2.0 ORBITAL MECHANICS & TELEMETRY FIELD ANALYSES"}</Text>
                  <Text style={styles.pdfSectionBodyText}>{currentData.pdfSummary.sec2Text}</Text>
                </View>

                {/* Document Section 3 */}
                <View style={styles.pdfSectionContainer}>
                  <Text style={styles.pdfSectionHeading}>{currentData.pdfSummary.sec3Title || "3.0 OBSERVATIONAL CHRONOLOGY & FUTURE STUDY LABELS"}</Text>
                  <Text style={styles.pdfSectionBodyText}>{currentData.pdfSummary.sec3Text}</Text>
                </View>

                {/* Bibliography */}
                <View style={styles.pdfBibliographyContainer}>
                  <Text style={styles.pdfBibTitle}>BIBLIOGRAPHY & SOURCE REFERENCES</Text>
                  {currentData.pdfSummary.bibliography.map((bib, bIdx) => (
                    <Text key={bIdx} style={styles.pdfBibText}>{bib}</Text>
                  ))}
                </View>

                {/* Digital Signatures */}
                <View style={styles.pdfSignatures}>
                  <View style={styles.signatureBlock}>
                    <Text style={styles.sigWriting}>{currentData.pdfSummary.signatureName}</Text>
                    <View style={styles.sigLine} />
                    <Text style={styles.sigRole}>{currentData.pdfSummary.signatureTitle}</Text>
                  </View>
                  <View style={styles.signatureBlock}>
                    <Text style={[styles.sigWriting, styles.sigAI]}>OrbitX System Certified</Text>
                    <View style={styles.sigLine} />
                    <Text style={styles.sigRole}>Archivist: {currentData.pdfSummary.archivist}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}

          {selectedTab === 'Study Flashcards' && (
            <View style={styles.flashcardContainer}>
              <Text style={styles.flashcardProgress}>
                CARD {currentCardIndex + 1} OF {currentData.flashcards.length}
              </Text>
              
              {/* Flippable Card Wrapper */}
              <TouchableOpacity
                onPress={() => setIsFlipped(!isFlipped)}
                style={styles.cardInteractiveArea}
                activeOpacity={0.9}
              >
                {/* Front Side */}
                <Animated.View style={[styles.flashCard, styles.flashCardFront, frontAnimatedStyle]}>
                  <View style={styles.cardHeaderIndicator}>
                    <MaterialCommunityIcons name="help-circle-outline" size={24} color="#00E5FF" />
                    <Text style={styles.cardIndicatorText}>QUESTION</Text>
                  </View>
                  <Text style={styles.cardContentText}>
                    {currentData.flashcards[currentCardIndex].question}
                  </Text>
                  <View style={styles.tapToFlipRow}>
                    <MaterialCommunityIcons name="gesture-tap" size={16} color="rgba(255, 255, 255, 0.4)" />
                    <Text style={styles.tapToFlipText}>Tap Card to Reveal Answer</Text>
                  </View>
                </Animated.View>

                {/* Back Side */}
                <Animated.View style={[styles.flashCard, styles.flashCardBack, backAnimatedStyle]}>
                  <View style={styles.cardHeaderIndicator}>
                    <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={24} color="#00FF9D" />
                    <Text style={[styles.cardIndicatorText, { color: '#00FF9D' }]}>VERIFIED ANSWER</Text>
                  </View>
                  <Text style={[styles.cardContentText, styles.cardContentTextBack]}>
                    {currentData.flashcards[currentCardIndex].answer}
                  </Text>
                  <View style={styles.tapToFlipRow}>
                    <MaterialCommunityIcons name="gesture-tap" size={16} color="rgba(255, 255, 255, 0.4)" />
                    <Text style={styles.tapToFlipText}>Tap to Flip back to Question</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>

              {/* Navigation Controls */}
              <View style={styles.cardNavRow}>
                <TouchableOpacity
                  style={[styles.cardNavBtn, currentCardIndex === 0 && styles.cardNavBtnDisabled]}
                  onPress={handlePrevCard}
                  disabled={currentCardIndex === 0}
                >
                  <MaterialCommunityIcons 
                    name="arrow-left-bold-outline" 
                    size={22} 
                    color={currentCardIndex === 0 ? 'rgba(255,255,255,0.1)' : '#00E5FF'} 
                  />
                  <Text style={[styles.cardNavText, currentCardIndex === 0 && styles.cardNavTextDisabled]}>PREV</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cardNavBtn, currentCardIndex === currentData.flashcards.length - 1 && styles.cardNavBtnDisabled]}
                  onPress={handleNextCard}
                  disabled={currentCardIndex === currentData.flashcards.length - 1}
                >
                  <Text style={[styles.cardNavText, currentCardIndex === currentData.flashcards.length - 1 && styles.cardNavTextDisabled]}>NEXT</Text>
                  <MaterialCommunityIcons 
                    name="arrow-right-bold-outline" 
                    size={22} 
                    color={currentCardIndex === currentData.flashcards.length - 1 ? 'rgba(255,255,255,0.1)' : '#00E5FF'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Simulated AI Synthesis Terminal Overlay */}
        {isGenerating && (
          <View style={styles.terminalOverlay}>
            <View style={styles.terminalContainer}>
              <View style={styles.terminalHeader}>
                <View style={styles.terminalIndicatorRow}>
                  <View style={[styles.terminalDot, { backgroundColor: '#FF5F56' }]} />
                  <View style={[styles.terminalDot, { backgroundColor: '#FFBD2E' }]} />
                  <View style={[styles.terminalDot, { backgroundColor: '#27C93F' }]} />
                </View>
                <Text style={styles.terminalTitle}>ORBITX AI COGNITIVE SYNTHESIS</Text>
              </View>

              <ScrollView 
                style={styles.terminalConsole}
                contentContainerStyle={styles.terminalConsoleContent}
                ref={(ref) => ref?.scrollToEnd({ animated: true })}
              >
                {terminalLogs.map((log, idx) => (
                  <View key={idx} style={styles.logRow}>
                    <Text style={styles.logTime}>[{new Date().toLocaleTimeString()}]</Text>
                    <Text style={styles.logText}> {log}</Text>
                  </View>
                ))}
                <ActivityIndicator size="small" color="#00E5FF" style={{ alignSelf: 'flex-start', marginTop: 10 }} />
              </ScrollView>

              <View style={styles.terminalProgressSection}>
                <View style={styles.progressBarWrapper}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
                <View style={styles.progressTextRow}>
                  <Text style={styles.progressStatus}>COMPILING KNOWLEDGE BASE...</Text>
                  <Text style={styles.progressPercentage}>{progressPercent}%</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </BackgroundGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  burgerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    letterSpacing: 2,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 1,
  },
  searchConsole: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(15, 20, 36, 0.7)',
    borderRadius: 16,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: FONTS.medium,
    fontSize: 13,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchBtn: {
    flexDirection: 'row',
    backgroundColor: '#00E5FF',
    height: 40,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#0b0f19',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  tabContainer: {
    height: 50,
    marginTop: SPACING.sm,
  },
  tabScroll: {
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  tabButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  tabButtonText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: '#00E5FF',
    fontFamily: FONTS.bold,
  },
  workspace: {
    flex: 1,
    marginTop: SPACING.sm,
  },
  topicHeader: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: 14,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  scrollPadding: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0f1424',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  statValue: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginTop: 6,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 8,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  bulletCard: {
    backgroundColor: 'rgba(15, 20, 36, 0.65)',
    borderRadius: 20,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#00E5FF',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E5FF',
    marginTop: 6,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  analysisCard: {
    backgroundColor: 'rgba(15, 20, 36, 0.65)',
    borderRadius: 20,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    padding: SPACING.lg,
  },
  analysisTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#00E5FF',
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
  },
  analysisSection: {
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  sectionBody: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },
  pdfPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  pdfHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pdfSeal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F4F8',
    borderWidth: 2,
    borderColor: '#0f1424',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pdfHeaderText: {
    flex: 1,
  },
  pdfUniv: {
    fontFamily: 'serif',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111111',
  },
  pdfSubUniv: {
    fontFamily: 'serif',
    fontSize: 8,
    color: '#555555',
    marginTop: 1,
  },
  pdfDivider: {
    height: 2,
    backgroundColor: '#0f1424',
    marginVertical: SPACING.sm,
  },
  pdfTitle: {
    fontFamily: 'serif',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginVertical: SPACING.sm,
    letterSpacing: 0.5,
  },
  pdfDocId: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  pdfSectionContainer: {
    marginBottom: SPACING.md,
  },
  pdfSectionHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111111',
    fontFamily: 'serif',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pdfSectionBodyText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#333333',
    fontFamily: 'serif',
    textAlign: 'justify',
  },
  pdfTable: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginVertical: SPACING.md,
  },
  pdfTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#EAEAEA',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  pdfTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
  },
  pdfTableRowAlt: {
    backgroundColor: '#F9F9F9',
  },
  pdfCellText: {
    fontSize: 9,
    padding: 6,
    color: '#222222',
  },
  pdfHeaderCell: {
    fontWeight: 'bold',
    textAlign: 'left',
  },
  pdfBodyCell: {
    fontFamily: 'serif',
  },
  pdfBibliographyContainer: {
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#DDDDDD',
    paddingTop: SPACING.sm,
  },
  pdfBibTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111111',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  pdfBibText: {
    fontSize: 8,
    color: '#555555',
    fontFamily: 'serif',
    marginBottom: 2,
  },
  pdfSignatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  signatureBlock: {
    alignItems: 'center',
    width: '45%',
  },
  sigWriting: {
    fontStyle: 'italic',
    fontFamily: 'serif',
    fontSize: 12,
    color: '#333333',
    marginBottom: 4,
  },
  sigAI: {
    fontFamily: 'monospace',
    fontStyle: 'normal',
    color: '#006699',
    fontSize: 10,
  },
  sigLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#888888',
    marginBottom: 4,
  },
  sigRole: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
  flashcardContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  flashcardProgress: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#00E5FF',
    letterSpacing: 1.5,
    marginBottom: SPACING.md,
  },
  cardInteractiveArea: {
    width: '100%',
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f1424',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: SPACING.lg,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  flashCardFront: {
    borderColor: 'rgba(0, 229, 255, 0.4)',
  },
  flashCardBack: {
    borderColor: '#00FF9D',
  },
  cardHeaderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIndicatorText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#00E5FF',
    marginLeft: 6,
    letterSpacing: 1,
  },
  cardContentText: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginVertical: 10,
  },
  cardContentTextBack: {
    color: '#E0E0E0',
    fontFamily: FONTS.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  tapToFlipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapToFlipText: {
    fontSize: 9,
    fontFamily: FONTS.regular,
    color: 'rgba(255, 255, 255, 0.4)',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  cardNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SPACING.lg,
  },
  cardNavBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 20, 36, 0.8)',
    borderColor: 'rgba(0, 229, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardNavBtnDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(15, 20, 36, 0.4)',
  },
  cardNavText: {
    color: '#00E5FF',
    fontFamily: FONTS.bold,
    fontSize: 11,
    marginHorizontal: 6,
    letterSpacing: 0.5,
  },
  cardNavTextDisabled: {
    color: 'rgba(255, 255, 255, 0.2)',
  },
  terminalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 7, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    zIndex: 9999,
  },
  terminalContainer: {
    width: '100%',
    height: '60%',
    backgroundColor: '#05070f',
    borderColor: '#00E5FF',
    borderWidth: 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  terminalHeader: {
    height: 40,
    backgroundColor: '#0f1424',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 229, 255, 0.2)',
  },
  terminalIndicatorRow: {
    flexDirection: 'row',
    marginRight: 16,
  },
  terminalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  terminalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#00E5FF',
    letterSpacing: 1.5,
  },
  terminalConsole: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: '#05070f',
  },
  terminalConsoleContent: {
    paddingBottom: 20,
  },
  logRow: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  logTime: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#A0AAB2',
  },
  logText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#00FF9D',
    flex: 1,
  },
  terminalProgressSection: {
    padding: SPACING.md,
    backgroundColor: '#0f1424',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 229, 255, 0.1)',
  },
  progressBarWrapper: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 3,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStatus: {
    fontFamily: FONTS.bold,
    fontSize: 9,
    color: '#A0AAB2',
    letterSpacing: 1,
  },
  progressPercentage: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#00E5FF',
    fontWeight: 'bold',
  },
});

export default SpaceNotesScreen;
