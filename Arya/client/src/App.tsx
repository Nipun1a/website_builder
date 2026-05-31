import {Route, Routes, useLocation} from 'react-router-dom'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Pricing from './pages/Pricing'
import Community from './pages/Community'
import MyProjects from './pages/MyProjects'
import Preview from './pages/Preview'
import View from './pages/View'
import SettingsPage from './pages/Seetings'
import { Toaster } from "@/components/ui/sonner"
import AuthPage from './pages/Auth/AuthPage'
import Navbar from './components/Navbar'
import Loading from './pages/Loading'







const App = () => {

const {pathname} = useLocation()
const hideNavbar = (pathname.startsWith('/projects/') && pathname !== '/projects') || pathname.startsWith('/view/') || pathname.startsWith('/preview/') || pathname.startsWith('/auth/')

  return (
    <div>
    <Toaster />
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/projects" element={<MyProjects />} />
        <Route path="/projects/:projectId" element={<Projects />} />
        <Route path="/community" element={<Community />} />
        <Route path="/my-projects" element={<MyProjects />} />
        <Route path="/preview/:projectId" element={<Preview />} />
        <Route path="/preview/:projectId/:versionId" element={<Preview />} />
        <Route path="/view/:projectId" element={<View />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path="/loading" element={<Loading />} />
        
        
      </Routes>
    </div>
  )
}

export default App
