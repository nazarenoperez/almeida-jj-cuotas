import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modo, setModo] = useState('login')
  const [exito, setExito] = useState(false)

  async function iniciarSesion() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o contraseña incorrectos')
    setLoading(false)
  }

  async function registrarse() {
    setError('')
    if (!email || !password) return setError('Completá todos los campos')
    if (password !== confirmar) return setError('Las contraseñas no coinciden')
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError('Error al crear la cuenta: ' + error.message)
    } else {
      setExito(true)
    }
    setLoading(false)
  }

  if (exito) return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-8 text-center">
        <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-2">¡Cuenta creada!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Revisá tu email para confirmar tu cuenta y luego iniciá sesión.</p>
        <button onClick={() => { setModo('login'); setExito(false) }} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200">
          Ir al login
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
      <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-8">
        <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Almeida Jiu Jitsu</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {modo === 'login' ? 'Iniciá sesión para continuar' : 'Creá tu cuenta'}
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white dark:bg-black text-gray-900 dark:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white dark:bg-black text-gray-900 dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && (modo === 'login' ? iniciarSesion() : registrarse())}
            />
          </div>
          {modo === 'registro' && (
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Confirmar contraseña</label>
              <input
                type="password"
                className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white dark:bg-black text-gray-900 dark:text-white"
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && registrarse()}
              />
            </div>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={modo === 'login' ? iniciarSesion : registrarse}
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
          <button
            onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError('') }}
            className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {modo === 'login' ? '¿No tenés cuenta? Registrarse' : '¿Ya tenés cuenta? Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
