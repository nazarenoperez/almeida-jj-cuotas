import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo.png'

const FAIXAS_ADULTO = ['Preta', 'Marrom', 'Roxa', 'Azul', 'Branca']
const FAIXAS_INFANTIL = ['Verde', 'Laranja', 'Amarela', 'Cinza', 'Branca']
const FAIXAS_TODAS = ['Preta', 'Marrom', 'Roxa', 'Azul', 'Verde', 'Laranja', 'Amarela', 'Cinza', 'Branca']

export default function Alumnos() {
  const [alumnos, setAlumnos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', faixa: 'Branca', categoria: 'Adulto' })
  const [editandoId, setEditandoId] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroFaixa, setFiltroFaixa] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  useEffect(() => { cargarAlumnos() }, [])

  async function cargarAlumnos() {
    setLoading(true)
    const { data } = await supabase
      .from('alumnos')
      .select('*')
      .eq('activo', true)
      .order('nombre')
    setAlumnos(data || [])
    setLoading(false)
  }

  function abrirNuevo() {
    setForm({ nombre: '', telefono: '', email: '', faixa: 'Branca', categoria: 'Adulto' })
    setEditandoId(null)
    setModalAbierto(true)
  }

  function abrirEdicion(alumno) {
    setForm({
      nombre: alumno.nombre,
      telefono: alumno.telefono || '',
      email: alumno.email || '',
      faixa: alumno.faixa,
      categoria: alumno.categoria || 'Adulto'
    })
    setEditandoId(alumno.id)
    setModalAbierto(true)
  }

  async function guardar() {
    if (!form.nombre.trim()) return
    if (editandoId) {
      await supabase.from('alumnos').update(form).eq('id', editandoId)
    } else {
      await supabase.from('alumnos').insert(form)
    }
    setModalAbierto(false)
    cargarAlumnos()
  }

  async function eliminar(id) {
    if (!confirm('¿Dar de baja este alumno?')) return
    await supabase.from('alumnos').update({ activo: false }).eq('id', id)
    cargarAlumnos()
  }

  const colorFaixa = {
    'Branca':  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    'Azul':    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
    'Roxa':    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
    'Marrom':  'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
    'Preta':   'bg-gray-800 text-white dark:bg-gray-600 dark:text-white',
    'Cinza':   'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-200',
    'Amarela': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
    'Laranja': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200',
    'Verde':   'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  }

  const ordenFaixas = filtroCategoria === 'Adulto' ? FAIXAS_ADULTO
    : filtroCategoria === 'Infantil' ? FAIXAS_INFANTIL
    : FAIXAS_TODAS

  const faixasDisponibles = filtroCategoria === 'Adulto' ? FAIXAS_ADULTO
    : filtroCategoria === 'Infantil' ? FAIXAS_INFANTIL
    : FAIXAS_TODAS

  const alumnosFiltrados = alumnos.filter(a => {
    const coincideBusqueda = a.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideFaixa = filtroFaixa ? a.faixa === filtroFaixa : true
    const coincideCategoria = filtroCategoria ? a.categoria === filtroCategoria : true
    return coincideBusqueda && coincideFaixa && coincideCategoria
  }).sort((a, b) => {
    if (!filtroCategoria) {
      if (a.categoria !== b.categoria) return a.categoria === 'Adulto' ? -1 : 1
      const orden = a.categoria === 'Adulto' ? FAIXAS_ADULTO : FAIXAS_INFANTIL
      return orden.indexOf(a.faixa) - orden.indexOf(b.faixa)
    }
    return ordenFaixas.indexOf(a.faixa) - ordenFaixas.indexOf(b.faixa)
  })

  const inputClass = "mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white dark:bg-black text-gray-900 dark:text-white"
  const selectClass = "border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-black text-gray-900 dark:text-white"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Almeida Jiu Jitsu" className="h-12 w-10" />
            <div>
              <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Almeida Jiu Jitsu</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestión de alumnos</p>
            </div>
          </div>
          <button
            onClick={abrirNuevo}
            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
          >
            + Nuevo alumno
          </button>
        </div>

        <div className="flex gap-3 mb-4 items-stretch">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className={`w-full ${inputClass}`}
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <select className={selectClass} value={filtroFaixa} onChange={e => setFiltroFaixa(e.target.value)}>
            <option value="">Todas las faixas</option>
            {faixasDisponibles.map(f => <option key={f}>{f}</option>)}
          </select>
          <select className={selectClass} value={filtroCategoria} onChange={e => { setFiltroCategoria(e.target.value); setFiltroFaixa('') }}>
            <option value="">Todos</option>
            <option value="Adulto">Adulto</option>
            <option value="Infantil">Infantil</option>
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : alumnosFiltrados.length === 0 ? (
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <p className="text-gray-400">No se encontraron alumnos.</p>
            {alumnos.length === 0 && (
              <button onClick={abrirNuevo} className="mt-4 text-sm text-gray-600 dark:text-gray-400 underline">Agregar el primero</button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Nombre</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Contacto</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Faixa</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Categoría</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {alumnosFiltrados.map((a, i) => (
                  <tr key={a.id} className={i % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-black'}>
                    <td className="px-5 py-3 font-medium text-gray-800 dark:text-white">{a.nombre}</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{a.telefono || a.email || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorFaixa[a.faixa] || 'bg-gray-100 text-gray-700'}`}>
                        {a.faixa}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.categoria === 'Infantil' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200' : 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200'}`}>
                        {a.categoria}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-3">
                      <button onClick={() => abrirEdicion(a)} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs">Editar</button>
                      <button onClick={() => eliminar(a.id)} className="text-red-300 hover:text-red-500 text-xs">Baja</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-5">
              {editandoId ? 'Editar alumno' : 'Nuevo alumno'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Nombre *</label>
                <input className={inputClass} value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Teléfono</label>
                <input className={inputClass} value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+54 9 ..." />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</label>
                <input className={inputClass} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Faixa</label>
                <select className={inputClass} value={form.faixa} onChange={e => setForm({ ...form, faixa: e.target.value })}>
                  {(form.categoria === 'Infantil' ? FAIXAS_INFANTIL : FAIXAS_ADULTO).map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Categoría</label>
                <select className={inputClass} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  <option value="Adulto">Adulto</option>
                  <option value="Infantil">Infantil</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalAbierto(false)} className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
                Cancelar
              </button>
              <button onClick={guardar} className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg py-2 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}