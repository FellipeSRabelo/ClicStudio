import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Download, CheckCircle2 } from 'lucide-react'
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
          <img
            src="/icons/branco_semfundo.png"
            alt="ClicStudio"
            className="h-50 w-50 rounded-2xl mx-auto mb-4 object-cover"
          />
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
