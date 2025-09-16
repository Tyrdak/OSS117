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

  useEffect(() => {
    const onHashChange = () => setRoute(resolveRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <>
      {route === 'control' ? <Dashboard /> : <Landing />}
      <DraggableOlive />
      <DraggableBottle />
    </>
  )
}

export default App
