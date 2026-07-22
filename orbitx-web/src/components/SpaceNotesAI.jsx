import React, { useState, useEffect, useCallback } from 'react';
import { Search, Brain, Clock, ShieldCheck, Printer, ArrowLeft, ArrowRight, RotateCw, Terminal } from 'lucide-react';

const fallbackDatabase = {
  jupiter: {
    title: 'Jupiter (Jovian System Analysis)',
    stats: [
      { label: 'AI CONFIDENCE', value: '99.8%', icon: 'Brain' },
      { label: 'STUDY TIME', value: '6 Mins', icon: 'Clock' },
      { label: 'FOCUS COUNT', value: '3 Major Areas', icon: 'ShieldCheck' }
    ],
    shortNotes: [
      'Jupiter is the largest planet in our Solar System, containing a mass 318 times greater than Earth.',
      'It is primarily composed of hydrogen (75%) and helium (24%) gases.',
      'The planet features the iconic Great Red Spot—a colossal, persistent anticyclonic storm wider than Earth.',
      'Jupiter has 95 confirmed moons, including the massive Galilean satellites: Io, Europa, Ganymede, and Callisto.',
      'Its liquid metallic hydrogen mantle generates an immense magnetosphere 14 times stronger than Earth\'s.'
    ],
    detailed: 'Jupiter dominates the outer Solar System, acting as a gravitational anchor. Classified as a gas giant, it lacks a solid surface; its atmosphere thickens into liquid layers under extreme pressures. Driven by powerful internal heat currents and rapid rotation, wind speeds in these jet streams routinely exceed 600 kilometers per hour. Clouds of ammonia ice, ammonium hydrosulfide, and water compose the distinct band layers.',
    flashcards: [
      { question: 'What is the atmospheric composition of Jupiter?', answer: 'Approximately 75% hydrogen and 24% helium, with minor traces of methane, ammonia, and water vapor.' },
      { question: 'How big is the Great Red Spot storm?', answer: 'It is an anticyclonic storm approximately 1.3 times the width of Earth.' },
      { question: 'Which Galilean moon is volcanically active?', answer: 'Io. Its volcanic eruptions are powered by tidal heating.' }
    ]
  },
  mars: {
    title: 'Mars (Red Planet Topography)',
    stats: [
      { label: 'AI CONFIDENCE', value: '98.9%', icon: 'Brain' },
      { label: 'STUDY TIME', value: '5 Mins', icon: 'Clock' },
      { label: 'FOCUS COUNT', value: '2 Major Areas', icon: 'ShieldCheck' }
    ],
    shortNotes: [
      'Mars is known as the Red Planet due to iron oxide (rust) covering its surface.',
      'The Martian atmosphere is extremely thin, composed of 95% carbon dioxide.',
      'It features Olympus Mons, the largest volcano in the Solar System, standing three times taller than Mount Everest.',
      'Liquid water cannot exist on the surface of Mars due to low atmospheric pressure.',
      'Mars has two capture-asteroid satellites, Phobos and Deimos.'
    ],
    detailed: 'Mars displays a stark hemispheric dichotomy: smooth, younger volcanic plains in the north contrast with ancient, cratered highlands in the south. The Valles Marineris canyon system cuts across the equator, stretching over 4,000 kilometers long. The Martian atmosphere is thin, with surface pressure averaging only 6 millibars. Lacking a global magnetic field, solar winds slowly strip away the upper atmosphere.',
    flashcards: [
      { question: 'Why is Mars red?', answer: 'The surface is covered in iron oxide, or rust particles.' },
      { question: 'What is the tallest volcano on Mars?', answer: 'Olympus Mons, a shield volcano that stands approximately 22 km high.' }
    ]
  },
  'black hole': {
    title: 'Black Holes & Singularity Physics',
    stats: [
      { label: 'AI CONFIDENCE', value: '99.5%', icon: 'Brain' },
      { label: 'STUDY TIME', value: '8 Mins', icon: 'Clock' },
      { label: 'FOCUS COUNT', value: '4 Major Areas', icon: 'ShieldCheck' }
    ],
    shortNotes: [
      'A black hole is a region of spacetime where gravity is so strong that nothing, not even light, can escape.',
      'The boundary surrounding a black hole from which no escape is possible is called the event horizon.',
      'At the center of a black hole lies a singularity, a point where matter is infinitely compressed.',
      'Stellar-mass black holes form from the gravitational collapse of massive stars.',
      'Supermassive black holes exist at the core of most galaxies, including our own Milky Way.'
    ],
    detailed: 'Black holes are defined by Einstein\'s general theory of relativity. When a massive star runs out of nuclear fuel, its core can collapse under its own gravity. If the core mass exceeds the Tolman-Oppenheimer-Volkoff limit, the gravitational collapse continues indefinitely, warping spacetime. The event horizon represents the threshold of no return. Beyond this point, escape velocity exceeds the speed of light.',
    flashcards: [
      { question: 'What defines the boundary of a black hole?', answer: 'The event horizon, which is the point of no return where the escape velocity exceeds the speed of light.' },
      { question: 'What is the singularity of a black hole?', answer: 'The point at the center of a black hole where all mass is compressed to infinite density.' }
    ]
  },
  galaxy: {
    title: 'Galaxies & Stellar Populations',
    stats: [
      { label: 'AI CONFIDENCE', value: '97.8%', icon: 'Brain' },
      { label: 'STUDY TIME', value: '7 Mins', icon: 'Clock' },
      { label: 'FOCUS COUNT', value: '3 Major Areas', icon: 'ShieldCheck' }
    ],
    shortNotes: [
      'A galaxy is a gravitationally bound system of stars, stellar remnants, interstellar gas, dust, and dark matter.',
      'Galaxies are categorized according to their visual morphology as elliptical, spiral, or irregular.',
      'The Milky Way is a barred spiral galaxy containing an estimated 100 to 400 billion stars.',
      'Most galaxies contain a supermassive black hole at their centers, which influences stellar orbits.',
      'Galaxies are grouped into clusters and superclusters, forming the large-scale structure of the universe.'
    ],
    detailed: 'Galaxies are the building blocks of the cosmic web. They range in size from dwarfs with just a few hundred million stars to giants with a hundred trillion stars. Stellar populations within galaxies evolve over billions of years, synthesizing heavy elements through nuclear fusion and distributing them via supernovae. The study of galactic rotation curves led to the discovery of dark matter.',
    flashcards: [
      { question: 'What are the three main morphological types of galaxies?', answer: 'Elliptical, spiral, and irregular.' },
      { question: 'What galaxy is our Solar System located in?', answer: 'The Milky Way, a barred spiral galaxy.' }
    ]
  },
  sun: {
    title: 'The Sun (Solar System Anchor)',
    stats: [
      { label: 'AI CONFIDENCE', value: '99.1%', icon: 'Brain' },
      { label: 'STUDY TIME', value: '5 Mins', icon: 'Clock' },
      { label: 'FOCUS COUNT', value: '2 Major Areas', icon: 'ShieldCheck' }
    ],
    shortNotes: [
      'The Sun is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions.',
      'It accounts for 99.86% of the total mass of the entire Solar System.',
      'The core of the Sun reaches temperatures of 15 million Kelvin, where hydrogen fuses into helium.',
      'Solar radiation drives Earth\'s climate, weather, ocean currents, and supports photosynthesis.',
      'The Sun has a magnetic cycle of about 11 years, during which sunspot activity rises and falls.'
    ],
    detailed: 'The Sun is a G-type main-sequence star, or yellow dwarf, born approximately 4.6 billion years ago. Its energy output is sustained by the proton-proton chain fusion reaction in its core. This energy radiates outward through the radiative and convective zones before escaping from the photosphere as light. The solar corona, the outer atmosphere, extends millions of kilometers and generates solar wind.',
    flashcards: [
      { question: 'What type of star is the Sun?', answer: 'A G-type main-sequence star, often called a yellow dwarf.' },
      { question: 'What reaction powers the Sun\'s energy output?', answer: 'Nuclear fusion, specifically the proton-proton chain fusing hydrogen into helium.' }
    ]
  },
  nebula: {
    title: 'Orion Nebula (Stellar Nursery)',
    stats: [
      { label: 'AI CONFIDENCE', value: '98.7%', icon: 'Brain' },
      { label: 'STUDY TIME', value: '4 Mins', icon: 'Clock' },
      { label: 'FOCUS COUNT', value: '2 Major Areas', icon: 'ShieldCheck' }
    ],
    shortNotes: [
      'A nebula is an interstellar cloud of dust, hydrogen, helium and other ionized gases.',
      'Nebulae are often stellar nurseries, where gas and dust collapse to form new stars.',
      'The Orion Nebula is the closest region of massive star formation to Earth.',
      'Reflection nebulae shine by scattering light from nearby hot stars.',
      'Planetary nebulae form when dying low-mass stars eject their outer shells.'
    ],
    detailed: 'Nebulae are some of the most visually stunning structures in deep space. They are key sites of star and planet formation, where gravity pulls gas and dust together to form protostars. The colors of nebulae depend on their chemical composition and ionization level: hydrogen glows red, while oxygen glows green. Reflection nebulae reflect the blue light of nearby young stars.',
    flashcards: [
      { question: 'What is a nebula?', answer: 'An interstellar cloud of dust and gas, often acting as a star-forming region.' },
      { question: 'What color does hydrogen typically glow in an emission nebula?', answer: 'Red.' }
    ]
  }
};

const iconMapping = {
  Brain: Brain,
  Clock: Clock,
  ShieldCheck: ShieldCheck
};

// Maps raw local database content to nested component structure
const mapFallbackToComponentData = (fallbackItem) => {
  if (!fallbackItem) return fallbackDatabase.galaxy;
  
  return {
    title: fallbackItem.title,
    stats: (fallbackItem.stats || []).map(s => ({
      label: s.label,
      value: s.value,
      icon: iconMapping[s.icon] || Brain
    })),
    bullets: fallbackItem.shortNotes || [],
    detailedAnalysis: {
      title: `${fallbackItem.title} - Detailed Analysis`,
      sections: [
        {
          heading: '1. Core Overview & Systems Topology',
          text: fallbackItem.detailed
        }
      ]
    },
    pdfSummary: {
      docId: `ORB-${fallbackItem.title.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `${fallbackItem.title.toUpperCase()} RESEARCH SUMMARY`,
      table: [
        { metric: 'Target Object', value: fallbackItem.title, reference: 'Primary Space Query' },
        { metric: 'Data Reliability', value: 'Local Fallback Map', reference: 'Offline Database' }
      ],
      sec1Title: '1.0 METRIC SUMMARY & COMPOSITIONS',
      sec1Text: fallbackItem.detailed,
      sec2Title: '2.0 ADDITIONAL CORE ATTRIBUTES',
      sec2Text: 'Derived from planetary registry backups.',
      sec3Title: '3.0 CONCLUSION',
      sec3Text: 'Compiled from local fallback database.',
      bibliography: ['[1] Local Space Archives, OrbitX Corp.'],
      signatureTitle: 'Director of Cosmic Telemetry',
      signatureName: 'Dr. Arthur Vance',
      archivist: 'OrbitX Local DB'
    },
    flashcards: fallbackItem.flashcards || []
  };
};

export default function SpaceNotesAI({ prefilledTopic, onTopicProcessed }) {
  const [searchInput, setSearchInput] = useState('');
  
  // Custom State Mapping supporting both 'short' and 'Short Notes' etc.
  const [activeTab, _setActiveTab] = useState('Short Notes');
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState(() => mapFallbackToComponentData(fallbackDatabase.jupiter));

  const setActiveTab = (tab) => {
    if (tab === 'short') {
      _setActiveTab('Short Notes');
    } else if (tab === 'detailed') {
      _setActiveTab('Detailed Analysis');
    } else if (tab === 'pdf') {
      _setActiveTab('PDF Summary');
    } else if (tab === 'flashcards') {
      _setActiveTab('Study Flashcards');
    } else {
      _setActiveTab(tab);
    }
  };

  // Terminal state properties
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Health check to verify FastAPI backend connection
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const resp = await fetch('http://localhost:8000/health');
        if (resp.ok) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch {
        setIsOnline(false);
      }
    };
    checkServerHealth();
    const timer = setInterval(checkServerHealth, 10000);
    return () => clearInterval(timer);
  }, []);

  // Smart-Search Fetcher prioritizing AI API
  const generateNotes = async (query) => {
    try {
      // Prioritize the AI API
      const response = await fetch(`http://localhost:8000/api/v1/notes?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('API server unreachable');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      // Catch triggers an immediate search of the fallbackDatabase
      console.warn("[SYSTEM WARNING] AI Telemetry Offline: Loading Local Deep-Space Fallback Data...", error);
      
      const queryKey = query.toLowerCase();
      
      // Keyword matchers
      if (queryKey.includes('nebula')) {
        return fallbackDatabase['nebula'];
      }
      if (queryKey.includes('jupiter') || queryKey.includes('jovian')) {
        return fallbackDatabase['jupiter'];
      }
      if (queryKey.includes('mars') || queryKey.includes('martian')) {
        return fallbackDatabase['mars'];
      }
      if (queryKey.includes('black hole') || queryKey.includes('singularity') || queryKey.includes('event horizon')) {
        return fallbackDatabase['black hole'];
      }
      if (queryKey.includes('galaxy') || queryKey.includes('milky way') || queryKey.includes('andromeda')) {
        return fallbackDatabase['galaxy'];
      }
      if (queryKey.includes('sun') || queryKey.includes('solar') || queryKey.includes('star')) {
        return fallbackDatabase['sun'];
      }

      // Default fallback
      return fallbackDatabase['galaxy'];
    }
  };

  // Main search pipeline
  const runSearch = useCallback(async (query) => {
    setLoading(true);
    setProgressPercent(0);
    setTerminalLogs([]);

    const logsList = [
      { prg: 5, msg: 'Initializing OrbitX AI Deep-Space Synthesis Engine...' },
      { prg: 15, msg: 'Connecting to planetary telemetry registry...' },
      { prg: 32, msg: `Querying orbital data archives for: "${query}"...` },
      { prg: 48, msg: 'Parsing multi-spectral data blocks & chemical logs...' },
      { prg: 65, msg: 'Formatting structured study summaries & concept briefs...' }
    ];

    let currentLogIndex = 0;
    const interval = setInterval(async () => {
      if (currentLogIndex < logsList.length) {
        const nextLog = logsList[currentLogIndex];
        setTerminalLogs((prev) => [...prev, nextLog.msg]);
        setProgressPercent(nextLog.prg);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setTerminalLogs(prev => [...prev, 'Sending synthesis payload to telemetry server...']);
        setProgressPercent(80);

        // Fetch notes using the try-catch smart fetcher
        try {
          const response = await fetch(`http://localhost:8000/api/v1/notes?query=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error('Unreachable');
          
          const rawData = await response.json();
          setTerminalLogs(prev => [
            ...prev,
            'Received AI telemetry payload successfully!',
            'Synthesis complete. Initializing study console!'
          ]);
          setProgressPercent(100);

          setTimeout(() => {
            setCurrentData(rawData);
            setActiveTab('short');
            setLoading(false);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            if (onTopicProcessed && query === prefilledTopic) {
              onTopicProcessed();
            }
          }, 400);

        } catch {
          // Unreachable logic -> prints warning and searches local fallback
          setTerminalLogs(prev => [
            ...prev,
            "[SYSTEM WARNING] AI Telemetry Offline: Loading Local Deep-Space Fallback Data...",
            "Extracting local backup dictionary...",
            "Synthesis complete. Initializing study console!"
          ]);
          setProgressPercent(100);

          setTimeout(async () => {
            const fallbackResult = await generateNotes(query);
            setCurrentData(mapFallbackToComponentData(fallbackResult));
            setActiveTab('short');
            setLoading(false);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            if (onTopicProcessed && query === prefilledTopic) {
              onTopicProcessed();
            }
          }, 500);
        }
      }
    }, 200);
  }, [onTopicProcessed, prefilledTopic]);

  // Deep-Link Auto-Search trigger
  useEffect(() => {
    if (prefilledTopic) {
      setSearchInput(prefilledTopic);
      runSearch(prefilledTopic);
    }
  }, [prefilledTopic, runSearch]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;
    runSearch(searchInput);
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
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
          isOnline
            ? 'bg-cyber-cyan/10 border-cyber-cyan/40 text-cyber-cyan shadow-[0_0_12px_rgba(0,229,255,0.2)] animate-pulse'
            : 'bg-[#101726]/80 border-border-cyan/50 text-cyber-cyan/80'
        }`}>
          <Terminal className="w-3.5 h-3.5" />
          {isOnline ? 'AI Telemetry Online (Connected)' : 'Offline AI Node Active'}
        </div>
      </div>

      {/* Search Console */}
      <form onSubmit={handleSearchSubmit} className="no-print">
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
            disabled={loading}
            className="bg-cyber-cyan hover:bg-[#00cce6] text-black font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.25)] flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-black border-t-transparent" />
                Synthesizing...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </form>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06] pb-1 no-print">
        {['Short Notes', 'Detailed Analysis', 'PDF Summary', 'Study Flashcards'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
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
          {activeTab === 'PDF Summary' && (
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
        {activeTab === 'Short Notes' && (
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

        {activeTab === 'Detailed Analysis' && (
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

        {activeTab === 'PDF Summary' && (
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

        {activeTab === 'Study Flashcards' && (
          <div className="flex flex-col items-center py-6 space-y-6 no-print">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              CARD {currentCardIndex + 1} OF {currentData.flashcards.length || 1}
            </span>

            {/* 3D Flashcard Container */}
            {currentData.flashcards && currentData.flashcards.length > 0 ? (
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
            ) : (
              <div className="w-full max-w-lg h-64 glass-panel border border-border-cyan/20 rounded-3xl flex items-center justify-center text-slate-400">
                No flashcards compiled for this query.
              </div>
            )}

            {/* Navigation buttons */}
            {currentData.flashcards && currentData.flashcards.length > 1 && (
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
            )}
          </div>
        )}
      </div>

      {/* Simulated AI Progress Overlay Terminal */}
      {loading && (
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
                  <span className={`font-mono ${log.startsWith('[SYSTEM WARNING]') ? 'text-cyber-magenta' : 'text-slate-200'}`}>
                    {log}
                  </span>
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
