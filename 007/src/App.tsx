import { useEffect, useState } from 'react'
import "./index.css"
import Landing from './app/fanpage/landing'
import Dashboard from './app/application/dashboard'
import DraggableOlive from './app/components/draggableOlive'
import DraggableBottle from './app/components/draggableBottle'

type Route = "home" | "control";

function resolveRoute(): Route {
  const hash = (typeof window !== 'undefined' ? window.location.hash : "").replace(/^#/, "");
  if (hash.startsWith("/control")) return "control";
  return "home";
}

function App() {
  const [route, setRoute] = useState<Route>(resolveRoute());
  const [martiniSolved, setMartiniSolved] = useState<boolean>(() => {
    try { 
      return localStorage.getItem('glass-filled') === 'true' 
    } catch { 
      return false 
    }
  });

  useEffect(() => {
    const onHashChange = () => setRoute(resolveRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const onGlassFilled = () => setMartiniSolved(true);
    const onGlassEmptied = () => setMartiniSolved(false);
    
    window.addEventListener('glass:filled', onGlassFilled);
    window.addEventListener('glass:emptied', onGlassEmptied);
    
    return () => {
      window.removeEventListener('glass:filled', onGlassFilled);
      window.removeEventListener('glass:emptied', onGlassEmptied);
    };
  }, []);

  // Bloquer l'accès au dashboard si l'énigme n'est pas résolue
  const shouldShowDashboard = route === 'control' && martiniSolved;
  const shouldRedirectToHome = route === 'control' && !martiniSolved;

  useEffect(() => {
    if (shouldRedirectToHome) {
      window.location.hash = '#home';
    }
  }, [shouldRedirectToHome]);

  return (
    <>
      {shouldShowDashboard ? <Dashboard /> : <Landing />}
      <DraggableOlive />
      <DraggableBottle />
    </>
  )
}

export default App
