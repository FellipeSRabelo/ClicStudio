import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Loader2, Download, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useInstallPWA } from '../hooks/useInstallPWA'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { canInstall, isInstalled, install } = useInstallPWA()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await signIn(email, password)
    if (err) {
      setError('Email ou senha inválidos')
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mb-4">
            <Camera size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ClicStudio</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de Agenda do Estúdio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Entrar'}
          </Button>
        </form>

        {/* PWA Install */}
        {canInstall && (
          <button
            onClick={install}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-gray-700 py-3 px-4 text-sm text-gray-400 hover:text-white hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
          >
            <Download size={18} className="text-primary-light" />
            <span>Instalar App no dispositivo</span>
          </button>
        )}
        {isInstalled && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-green-500">
            <CheckCircle2 size={16} />
            <span>App instalado!</span>
          </div>
        )}
      </div>
    </div>
  )
}
