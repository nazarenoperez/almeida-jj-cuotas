import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Alumnos from './pages/alumnos'
import Pagos from './pages/pagos'
import Login from './pages/login'
import logoNavbar from './assets/logo-navbar.png'

function Navbar({ pagina, setPagina, onCerrarSesion, darkMode, setDarkMode }) {
  return (
    <nav className="bg-black border-b border-gray-800 px-4">
      <div className="max-w-4xl mx-auto flex items-center gap-6 h-12">
        <img src={logoNavbar} alt="Almeida Jiu Jitsu" className="h-8 object-contain" />
        <button
          onClick={() => setPagina('alumnos')}
          className={`text-sm pb-0.5 border-b-2 transition-colors ${pagina === 'alumnos' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          Alumnos
        </button>
        <button
          onClick={() => setPagina('pagos')}
          className={`text-sm pb-0.5 border-b-2 transition-colors ${pagina === 'pagos' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
        >
          Pagos
        </button>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-gray-400 hover:text-gray-200 text-lg"
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button
            onClick={onCerrarSesion}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  )
}

function App() {
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [pagina, setPagina] = useState('alumnos')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const guardado = localStorage.getItem('darkMode')
    if (guardado === 'true') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      setCargando(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (cargando) return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando...</p>
    </div>
  )

  if (!sesion) return <Login />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <Navbar
        pagina={pagina}
        setPagina={setPagina}
        onCerrarSesion={() => supabase.auth.signOut()}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      {pagina === 'alumnos' && <Alumnos />}
      {pagina === 'pagos' && <Pagos />}
    </div>
  )
}

export default App