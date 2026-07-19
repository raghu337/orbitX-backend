import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Terminal, User } from 'lucide-react';

const presetQAs = [
  {
    q: 'How do I calculate Keplerian orbits?',
    a: 'Keplerian orbits are calculated using Kepler\'s three laws of planetary motion: \n1. Planets move in elliptical orbits with the Sun at one focus.\n2. A line segment joining a planet and the Sun sweeps out equal areas during equal intervals of time.\n3. The square of the orbital period of a planet is directly proportional to the cube of the semi-major axis of its orbit: T² ∝ a³.'
  },
  {
    q: 'What is the magnetic field intensity of Jupiter?',
    a: 'Jupiter\'s magnetic field is the strongest of any planet in the Solar System. At its surface, the field intensity ranges from 4 to 14 Gauss (0.4 to 1.4 mT), which is roughly 14 times stronger than Earth\'s magnetic field. This field traps severe radiation belts and stretches a magnetotail past Saturn\'s orbit.'
  },
  {
    q: 'What is the escape velocity of Mars?',
    a: 'The escape velocity of Mars is approximately 5.03 km/s (11,250 mph). This is significantly lower than Earth\'s escape velocity of 11.19 km/s due to Mars\' smaller mass and radius (about 10% of Earth\'s mass and 53% of Earth\'s radius).'
  },
  {
    q: 'Explain Hawking Radiation.',
    a: 'Hawking Radiation is electromagnetic radiation predicted to be emitted by black holes due to quantum effects near the event horizon. According to quantum field theory, virtual particle-antiparticle pairs constantly fluctuate in space. Near the event horizon, one particle can fall into the black hole while the other escapes, carrying away mass-energy. This causes black holes to slowly evaporate over cosmic time.'
  }
];

export default function SpaceChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Greetings, Commander! I am the OrbitX Cognitive Intelligence Assistant. Ask me anything about planetary parameters, orbital telemetry, or astrophysical concepts.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // Simulate AI response delay and progressive streaming
    setTimeout(() => {
      let matchedResponse = '';
      const queryLower = textToSend.toLowerCase();

      const matchedQA = presetQAs.find(qa => queryLower.includes(qa.q.toLowerCase()) || qa.q.toLowerCase().includes(queryLower));
      
      if (matchedQA) {
        matchedResponse = matchedQA.a;
      } else if (queryLower.includes('jupiter') || queryLower.includes('jovian')) {
        matchedResponse = 'Jupiter has a mass 318 times greater than Earth and features the Great Red Spot. Its massive gravity shields the inner planets from cosmic debris.';
      } else if (queryLower.includes('mars') || queryLower.includes('martian')) {
        matchedResponse = 'Mars has an atmosphere containing 95% carbon dioxide and surface pressure averaging only 6 millibars. Olympus Mons stands three times taller than Mt. Everest.';
      } else if (queryLower.includes('black hole') || queryLower.includes('singularity')) {
        matchedResponse = 'Black holes warp spacetime so severely that light cannot escape. At the center lies a gravitational singularity of infinite density.';
      } else {
        matchedResponse = `Command received. Querying galactic logs for: "${textToSend}". Orbital diagnostics show nominal conditions. I can confirm this astrophysical target is cataloged under OrbitX Class-A parameters.`;
      }

      setIsTyping(false);
      
      const newAiMsg = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: '', // Start empty for streaming
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, newAiMsg]);

      // Stream text character by character
      let currentLength = 0;
      const interval = setInterval(() => {
        if (currentLength <= matchedResponse.length) {
          setMessages((prevList) => {
            return prevList.map((m) => {
              if (m.id === newAiMsg.id) {
                return { ...m, text: matchedResponse.slice(0, currentLength) };
              }
              return m;
            });
          });
          currentLength += 3; // stream 3 characters at a time for speed
        } else {
          clearInterval(interval);
        }
      }, 20);

    }, 1200);
  };

  return (
    <div className="flex-1 p-6 flex flex-col h-screen max-w-4xl mx-auto space-y-4">
      {/* Title block */}
      <div className="no-print shrink-0">
        <h2 className="text-2xl font-black text-white tracking-wider uppercase font-sans">
          Space Chat AI
        </h2>
        <p className="text-xs text-cyber-cyan font-bold tracking-widest uppercase mt-0.5">
          Q&A Telemetry Engine
        </p>
      </div>

      {/* Suggested prompts (Only show if very few messages) */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0 no-print">
          {presetQAs.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.q)}
              className="glass-panel p-3.5 rounded-xl border border-border-cyan/15 hover:border-cyber-cyan/35 text-left text-xs font-semibold text-slate-300 hover:text-slate-100 hover:bg-white/[0.03] transition-all cursor-pointer flex flex-col gap-1.5 group"
            >
              <div className="flex items-center gap-1.5 text-cyber-cyan">
                <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span className="font-bold tracking-wider uppercase text-[9px]">Suggested Prompt</span>
              </div>
              <span className="leading-snug">{item.q}</span>
            </button>
          ))}
        </div>
      )}

      {/* Chat logs box */}
      <div className="flex-1 glass-panel rounded-2xl border border-border-cyan/20 p-5 overflow-y-auto space-y-4 min-h-0 relative">
        <div className="absolute inset-0 bg-[#02040a]/40 pointer-events-none rounded-2xl" />
        
        <div className="space-y-4 z-10 relative">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div key={m.id} className={`flex gap-3 max-w-[85%] ${isAi ? '' : 'ml-auto flex-row-reverse'}`}>
                {/* Avatar Icon */}
                <div className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center shrink-0 shadow-sm ${
                  isAi
                    ? 'bg-cyber-cyan/15 border-cyber-cyan/30 text-cyber-cyan'
                    : 'bg-gradient-to-br from-cyber-cyan/10 to-blue-600/10 border-blue-500/30 text-blue-400'
                }`}>
                  {isAi ? <Terminal className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Box */}
                <div>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                    isAi
                      ? 'bg-white/[0.02] border-white/[0.04] text-slate-200'
                      : 'bg-cyber-cyan/10 border-cyber-cyan/20 text-white shadow-[0_0_12px_rgba(0,229,255,0.04)]'
                  }`}>
                    {/* Render newlines */}
                    {m.text.split('\n').map((line, lIdx) => (
                      <p key={lIdx} className={lIdx > 0 ? 'mt-1.5' : ''}>{line}</p>
                    ))}
                  </div>
                  {/* Timestamp */}
                  <span className={`text-[8px] font-bold text-slate-500 tracking-widest mt-1 block uppercase ${
                    isAi ? '' : 'text-right'
                  }`}>
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8.5 h-8.5 rounded-xl bg-cyber-cyan/15 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan animate-pulse">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] text-slate-400 flex items-center gap-1.5 text-xs font-semibold">
                <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input box form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputVal);
        }}
        className="flex gap-3 items-center shrink-0 no-print"
      >
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Ask OrbitX AI a scientific question..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isTyping}
            className="w-full bg-[#070b16] border border-white/[0.06] focus:border-cyber-cyan/40 rounded-xl py-3.5 pl-4 pr-12 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-300 font-semibold disabled:opacity-40"
          />
        </div>
        <button
          type="submit"
          disabled={!inputVal.trim() || isTyping}
          className="w-12 h-12 rounded-xl bg-cyber-cyan hover:bg-[#00cce6] disabled:bg-slate-800 disabled:opacity-40 text-black flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-[0_0_15px_rgba(0,229,255,0.25)] shrink-0"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
