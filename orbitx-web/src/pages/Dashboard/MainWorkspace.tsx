import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import SpaceNotesAI from '../../components/SpaceNotesAI';
import LiveTracker from '../../components/LiveTracker';
import SolarSystem from '../../components/SolarSystem';
import SpaceChat from '../../components/SpaceChat';
import LaunchHub from '../../components/LaunchHub';
import SettingsComponent from '../../components/Settings';

export const MainWorkspace: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<string>('SpaceNotes');
  const [prefilledTopic, setPrefilledTopic] = useState<string | null>(null);

  useEffect(() => {
    const handleNavigationMessage = (event: MessageEvent) => {
      if (!event.data) return;

      // Handle NAVIGATE_TO navigation message
      if (event.data.type === 'NAVIGATE_TO') {
        const screen = event.data.screenName;
        const validScreens = [
          'SpaceNotes',
          'LiveTracking',
          'SolarSystem3D',
          'SpaceChat',
          'LaunchTracker',
          'Settings',
        ];
        if (validScreens.includes(screen)) {
          setActiveScreen(screen);
          if (screen === 'SpaceNotes' && event.data.topic) {
            setPrefilledTopic(event.data.topic);
          }
        }
      }
      // Handle deep-link payload directly (e.g. { topic: 'Jupiter' })
      else if (event.data.topic) {
        setActiveScreen('SpaceNotes');
        setPrefilledTopic(event.data.topic);
      }
    };

    window.addEventListener('message', handleNavigationMessage);
    return () => {
      window.removeEventListener('message', handleNavigationMessage);
    };
  }, []);

  const renderContent = () => {
    switch (activeScreen) {
      case 'SpaceNotes':
        return (
          <SpaceNotesAI
            prefilledTopic={prefilledTopic}
            onTopicProcessed={() => setPrefilledTopic(null)}
          />
        );
      case 'LiveTracking':
        return <LiveTracker />;
      case 'SolarSystem3D':
        return <SolarSystem />;
      case 'SpaceChat':
        return <SpaceChat />;
      case 'LaunchTracker':
        return <LaunchHub />;
      case 'Settings':
        return <SettingsComponent />;
      default:
        return (
          <SpaceNotesAI
            prefilledTopic={prefilledTopic}
            onTopicProcessed={() => setPrefilledTopic(null)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#02050c] text-slate-100 select-none relative font-sans">
      {/* Dynamic Cosmic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#ff2d55]/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar activeScreen={activeScreen} setActiveScreen={setActiveScreen} />

      {/* Main Content Workspace */}
      <main className="flex-1 h-screen overflow-hidden relative z-10 bg-gradient-to-br from-transparent to-[#03060f]/60 flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
};

export default MainWorkspace;
