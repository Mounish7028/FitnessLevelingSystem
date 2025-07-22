import React, { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import Quests from "@/pages/Quests";
import Achievements from "@/pages/Achievements";
import Store from "@/pages/Store";
import Leaderboard from "@/pages/Leaderboard";
import WelcomeNotification from "@/components/welcome-notification";

function App() {
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    // Show welcome notification after a brief delay
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-black/90 text-foreground font-rajdhani">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/quests" component={Quests} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/store" component={Store} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route component={NotFound} />
      </Switch>
      
      {showWelcome && (
        <WelcomeNotification 
          username="Hunter"
          onClose={() => setShowWelcome(false)}
        />
      )}
    </div>
  );
}

export default App;