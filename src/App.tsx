import { useEffect } from "react";
import { CreatorPage } from '@/pages/Creator'
import { HomePage } from '@/pages/Home'
import { applySiteMeta } from '@/lib/site'

function App() {
  useEffect(() => {
    applySiteMeta();
  }, []);

  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/creator')) {
    return <CreatorPage />
  }

  return <HomePage />
}

export default App
