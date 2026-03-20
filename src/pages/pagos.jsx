import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import logo from '../assets/logo.png'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const FAIXAS_ADULTO = ['Preta', 'Marrom', 'Roxa', 'Azul', 'Branca']
const FAIXAS_INFANTIL = ['Verde', 'Laranja', 'Amarela', 'Cinza', 'Branca']

export default function Pagos() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [año, setAño] = useState(hoy.getFullYear())
  const [alumnos, setAlumnos] = useState([])
  const [pagos, setPagos] = useState({})
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ monto: '', fecha_pago: '', estado: 'pagado' })
  const [filtroCategoria, setFiltroCategoria] = useState('')

  useEffect(() => { cargar() }, [mes, año])

  async function cargar() {
    setLoading(true)
    const { data: dataAlumnos } = await supabase
      .from('alumnos')
      .select('id, nombre, faixa, monto, categoria')
      .eq('activo', true)
      .order('nombre')

    const { data: dataPagos } = await supabase
      .from('pagos')
      .select('*')
      .eq('mes', mes)
      .eq('año', año)

    const mapaP = {}
    for (const p of dataPagos || []) mapaP[p.alumno_id] = p
    setAlumnos(dataAlumnos || [])
    setPagos(mapaP)
    setLoading(false)
  }

  function abrirModal(alumno) {
    const pago = pagos[alumno.id]
    setForm({
      monto: pago ? pago.monto : alumno.monto || '',
      fecha_pago: pago ? pago.fecha_pago : hoy.toISOString().slice(0, 10),
      estado: pago ? pago.estado : 'pagado'
    })
    setModal(alumno)
  }

  async function guardar() {
    const pago = pagos[modal.id]
    const datos = {
      alumno_id: modal.id,
      mes,
      año,
      monto: parseFloat(form.monto) || 0,
      fecha_pago: form.fecha_pago || null,
      estado: form.estado
    }
    if (pago) {
      await supabase.from('pagos').update(datos).eq('id', pago.id)
    } else {
      await supabase.from('pagos').insert(datos)
    }
    setModal(null)
    cargar()
  }

  async function marcarPagado(alumno) {
    const pago = pagos[alumno.id]
    const datos = {
      alumno_id: alumno.id,
      mes,
      año,
      monto: alumno.monto || 0,
      fecha_pago: hoy.toISOString().slice(0, 10),
      estado: 'pagado'
    }
    if (pago) {
      await supabase.from('pagos').update(datos).eq('id', pago.id)
    } else {
      await supabase.from('pagos').insert(datos)
    }
    cargar()
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
  const estadoStyle = {
    pagado:    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
    pendiente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200',
    vencido:   'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
  }

  const ordenFaixas = filtroCategoria === 'Adulto' ? FAIXAS_ADULTO : FAIXAS_INFANTIL

  const alumnosFiltrados = alumnos.filter(a =>
    filtroCategoria ? a.categoria === filtroCategoria : true
  ).sort((a, b) => {
    if (!filtroCategoria) {
      if (a.categoria !== b.categoria) return a.categoria === 'Adulto' ? -1 : 1
      const orden = a.categoria === 'Adulto' ? FAIXAS_ADULTO : FAIXAS_INFANTIL
      return orden.indexOf(a.faixa) - orden.indexOf(b.faixa)
    }
    return ordenFaixas.indexOf(a.faixa) - ordenFaixas.indexOf(b.faixa)
  })

  const totalCobrado = alumnosFiltrados.reduce((acc, a) => {
    const p = pagos[a.id]
    return acc + (p && p.estado === 'pagado' ? parseFloat(p.monto) : 0)
  }, 0)

  const totalPendiente = alumnosFiltrados.filter(a => !pagos[a.id] || pagos[a.id].estado !== 'pagado').length

  const selectClass = "border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-black text-gray-900 dark:text-white"
  const inputClass = "mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white dark:bg-black text-gray-900 dark:text-white"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Almeida Jiu Jitsu" className="h-12 w-10" />
            <div>
              <h1 className="text-2xl font-medium text-gray-900 dark:text-white">Almeida Jiu Jitsu</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestión de pagos</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select className={selectClass} value={mes} onChange={e => setMes(parseInt(e.target.value))}>
              {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select className={selectClass} value={año} onChange={e => setAño(parseInt(e.target.value))}>
              {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <select className={selectClass} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
            <option value="">Todos</option>
            <option value="Adulto">Adulto</option>
            <option value="Infantil">Infantil</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Cobrado este mes</p>
            <p className="text-2xl font-medium text-green-600 dark:text-green-400 mt-1">${totalCobrado.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 px-5 py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Alumnos sin pagar</p>
            <p className="text-2xl font-medium text-red-500 dark:text-red-400 mt-1">{totalPendiente}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : (
          <div className="bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Alumno</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Categoría</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Faixa</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Monto</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {alumnosFiltrados.map((a, i) => {
                  const pago = pagos[a.id]
                  const estado = pago ? pago.estado : 'pendiente'
                  return (
                    <tr key={a.id} className={i % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-black'}>
                      <td className="px-5 py-3 font-medium text-gray-800 dark:text-white">{a.nombre}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.categoria === 'Infantil' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200' : 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-200'}`}>
                          {a.categoria}
                        </span>
                      </td>
                         <td className="px-5 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorFaixa[a.faixa] || 'bg-gray-100 text-gray-700'}`}>
                                {a.faixa}
                            </span>
                        </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-300">
                        {pago ? `$${parseFloat(pago.monto).toLocaleString()}` : a.monto ? `$${parseFloat(a.monto).toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoStyle[estado]}`}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-3">
                        {estado !== 'pagado' && (
                          <button onClick={() => marcarPagado(a)} className="text-green-500 hover:text-green-400 text-xs font-medium">
                            Marcar pagado
                          </button>
                        )}
                        <button onClick={() => abrirModal(a)} className="text-gray-400 hover:text-gray-200 text-xs">
                          Editar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Registrar pago</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{modal.nombre} — {MESES[mes - 1]} {año}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Monto</label>
                <input type="number" className={inputClass} value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fecha de pago</label>
                <input type="date" className={inputClass} value={form.fecha_pago} onChange={e => setForm({ ...form, fecha_pago: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Estado</label>
                <select className={inputClass} value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900">
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