import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useISSData } from './hooks/useISSData';
import { ISSMap } from './components/ISSMap';
import { ISSStats } from './components/ISSStats';
import { NewsDashboard } from './components/NewsDashboard';
import { DataCharts } from './components/DataCharts';
import { Chatbot } from './components/Chatbot';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const issData = useISSData();
  const [newsArticles, setNewsArticles] = useState([]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Context for the Chatbot
  const chatbotContext = {
    speed: Math.round(issData.currentSpeed || 0),
    location: issData.locationName,
    astronautsCount: issData.astronauts?.number || 0,
    newsArticles: newsArticles.slice(0, 5) // Send top 5 for context
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="satellite">🛰️</span>
            <span className="font-bold text-xl tracking-tight hidden sm:inline-block">ISS & News Hub</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-muted-foreground hidden md:inline-block">
              {issData.loading ? 'Connecting to satellite...' : 'Live Data Feed Active'}
            </span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-6">
          <section>
            <ISSStats 
              position={issData.position}
              speed={issData.currentSpeed}
              locationName={issData.locationName}
              astronauts={issData.astronauts}
              loading={issData.loading}
              onRefresh={issData.refetch}
            />
            
            <div className="bg-card text-card-foreground rounded-xl shadow-sm border p-4 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">Live Trajectory</h2>
              <div className="h-[300px] sm:h-[400px]">
                <ISSMap 
                  position={issData.position}
                  path={issData.path}
                  loading={issData.loading}
                />
              </div>
            </div>
          </section>

          <section className="bg-card text-card-foreground rounded-xl shadow-sm border p-4 sm:p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <div className="h-auto min-h-[250px]">
              <DataCharts 
                speedHistory={issData.speedHistory} 
                newsArticles={newsArticles} 
              />
            </div>
          </section>
        </div>

        <div className="xl:col-span-4 h-full">
          <section className="bg-card text-card-foreground rounded-xl shadow-sm border p-4 sm:p-6 h-[600px] xl:h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Global News</h2>
            <div className="flex-1 overflow-hidden">
              <NewsDashboard onNewsUpdate={setNewsArticles} />
            </div>
          </section>
        </div>
      </main>
      
      <Chatbot contextData={chatbotContext} />
    </div>
  );
}

export default App;
