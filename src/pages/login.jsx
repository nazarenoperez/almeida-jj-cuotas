import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function iniciarSesion() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email o contraseña incorrectos')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4 p-8">
        <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Almeida Jiu Jitsu</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Iniciá sesión para continuar</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Contraseña</label>
            <input
              type="password"
              className="mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && iniciarSesion()}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            onClick={iniciarSesion}
            disabled={loading}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  )
}