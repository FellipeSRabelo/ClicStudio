import { Filter, Instagram } from 'lucide-react'
import { Checkbox } from '../ui/Input'
import { cn } from '../../lib/utils'

export function FilterSidebar({
  funcionarios = [],
  tiposTarefa = [],
  filtroFuncionarios,
  setFiltroFuncionarios,
  filtroTipos,
  setFiltroTipos,
  showAgendaConteudo,
  setShowAgendaConteudo,
}) {
  const toggleFuncionario = (id) => {
    setFiltroFuncionarios((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const toggleTipo = (id) => {
    setFiltroTipos((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  return (
    <div className="w-56 shrink-0 rounded-xl border border-gray-800 bg-surface p-4 space-y-6 overflow-y-auto">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
        <Filter size={16} />
        Filtros
      </div>

      {/* Por Funcionário */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Funcionários
        </h3>
        <div className="space-y-2">
          {funcionarios.map((func) => (
            <label
              key={func.id}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 hover:text-white transition-colors"
            >
              <input
                type="checkbox"
                checked={filtroFuncionarios.includes(func.id)}
                onChange={() => toggleFuncionario(func.id)}
                className="w-3.5 h-3.5 rounded border-gray-600 cursor-pointer accent-primary"
              />
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: func.cor }}
              />
              <span className="truncate">{func.nome}</span>
            </label>
          ))}
          {funcionarios.length === 0 && (
            <p className="text-xs text-gray-600">Nenhum funcionário</p>
          )}
        </div>
      </div>

      {/* Por Tipo de Tarefa */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Tipo de Tarefa
        </h3>
        <div className="space-y-2">
          {tiposTarefa.map((tipo) => (
            <label
              key={tipo.id}
              className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 hover:text-white transition-colors"
            >
              <input
                type="checkbox"
                checked={filtroTipos.includes(tipo.id)}
                onChange={() => toggleTipo(tipo.id)}
                className="w-3.5 h-3.5 rounded border-gray-600 cursor-pointer accent-primary"
              />
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: tipo.cor }}
              />
              <span className="truncate">{tipo.nome}</span>
            </label>
          ))}
          {tiposTarefa.length === 0 && (
            <p className="text-xs text-gray-600">Nenhum tipo</p>
          )}
        </div>
      </div>

      {/* Limpar filtros */}
      {(filtroFuncionarios.length > 0 || filtroTipos.length > 0) && (
        <button
          onClick={() => {
            setFiltroFuncionarios([])
            setFiltroTipos([])
          }}
          className="w-full text-xs text-primary-light hover:text-white transition-colors cursor-pointer"
        >
          Limpar filtros
        </button>
      )}

      {/* Agenda de Conteúdo toggle */}
      {setShowAgendaConteudo && (
        <div className="pt-2 border-t border-gray-800">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Agenda de Conteúdo
          </h3>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={showAgendaConteudo}
              onChange={(e) => setShowAgendaConteudo(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-600 cursor-pointer accent-primary"
            />
            <Instagram size={14} className="text-pink-400 shrink-0" />
            <span className="truncate">Exibir no calendário</span>
          </label>
        </div>
      )}
    </div>
  )
}
