import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Tv,
  Smartphone,
  MessageCircle,
  Image,
  Check,
  Star,
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  Users,
  Menu,
  X,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  ExternalLink,
  Sparkles,
  Crown,
  Building2,
  Camera,
  Quote,
} from 'lucide-react'

/* ───── helpers ───── */
function Section({ children, className = '', id }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}

function FadeIn({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ───── Data ───── */
const features = [
  {
    icon: Tv,
    title: 'Modo TV em Tempo Real',
    desc: 'Dashboard ao vivo para a equipe acompanhar prazos, tarefas do dia e status — tudo sem precisar de login.',
  },
  {
    icon: Smartphone,
    title: 'Acesso PWA Mobile',
    desc: 'Instale direto no celular como um app nativo. Marque tarefas, confira agendas e trabalhe de qualquer lugar.',
  },
  {
    icon: MessageCircle,
    title: 'Integração WhatsApp & Maps',
    desc: 'Envie mensagens e abra a localização de clientes com um toque. Sem copiar e colar, sem perder tempo.',
  },
  {
    icon: Image,
    title: 'Gestão de Galerias',
    desc: 'Centralize links de entrega, portfólio e galerias de cada cliente em um só painel organizado.',
  },
]

const testimonials = [
  {
    name: 'Rafael Mendes',
    role: 'Fotógrafo',
    text: 'O PWA facilita muito marcar tarefas como concluídas direto do set.',
    avatar: 'RM',
  },
  {
    name: 'Juliana Reis',
    role: 'Dona de Estúdio',
    text: 'O Modo TV é o diferencial. Minha equipe nunca mais perdeu um prazo.',
    avatar: 'JR',
  },
  {
    name: 'Carlos Britto',
    role: 'Gestor de Agência',
    text: 'A centralização de clientes e links de galeria economizam horas de chat.',
    avatar: 'CB',
  },
]

const plans = [
  {
    name: 'Start',
    price: 'R$ 69,90',
    period: '/mês',
    highlight: false,
    icon: Zap,
    features: [
      'Até 2 funcionários',
      'Calendário Inteligente',
      'Acesso PWA Mobile',
      'Gestão de Clientes',
      'Suporte por e-mail',
    ],
    cta: 'Assinar Start',
  },
  {
    name: 'Pro',
    price: 'R$ 149,90',
    period: '/mês',
    highlight: true,
    badge: 'Mais Popular',
    icon: Crown,
    features: [
      'Até 5 funcionários',
      'Modo TV em Tempo Real',
      'Gestão de Galerias',
      'Integração WhatsApp & Maps',
      'Tipos de tarefa ilimitados',
      'Suporte prioritário',
    ],
    cta: 'Assinar Pro',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    highlight: false,
    icon: Building2,
    features: [
      'Funcionários ilimitados',
      'Tudo do plano Pro',
      'Onboarding dedicado',
      'SLA personalizado',
      'API & Integrações',
    ],
    cta: 'Falar com Consultor',
  },
]

/* ═══════════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════════ */
export function LandingPage() {
  const navigate = useNavigate()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    setMobileMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  /* ─── Navbar ─── */
  const Navbar = () => (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-purple-900/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5d109c] to-[#7c3aed] flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Clic<span className="text-[#7c3aed]">Studio</span>
            </span>
          </div>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-8">
            {[
              ['Benefícios', 'features'],
              ['Depoimentos', 'social'],
              ['Planos', 'pricing'],
            ].map(([label, id]) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#5d109c] to-[#7c3aed] text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-600/25 transition-all cursor-pointer"
            >
              Começar Agora
            </button>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden text-gray-300 hover:text-white cursor-pointer"
          >
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#09090b]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-6 space-y-4"
        >
          {[
            ['Benefícios', 'features'],
            ['Depoimentos', 'social'],
            ['Planos', 'pricing'],
          ].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="block w-full text-left text-gray-300 hover:text-white py-2 cursor-pointer"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => navigate('/login')}
            className="block w-full text-left text-gray-300 hover:text-white py-2 cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={() => scrollTo('pricing')}
            className="w-full mt-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#5d109c] to-[#7c3aed] text-white text-sm font-semibold cursor-pointer"
          >
            Começar Agora
          </button>
        </motion.div>
      )}
    </nav>
  )

  /* ─── Hero ─── */
  const Hero = () => (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* bg glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#5d109c]/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#7c3aed]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5d109c]/15 border border-[#5d109c]/30 text-[#a78bfa] text-xs sm:text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Gestão inteligente para estúdios criativos
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
            ClicStudio:{' '}
            <span className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent">
              Fluxo Inteligente.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Menos tempo na agenda, mais tempo na criação. Organize sua equipe, clientes e entregas
            em uma plataforma feita sob medida para fotógrafos e videomakers.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('pricing')}
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#5d109c] to-[#7c3aed] text-white font-semibold text-base shadow-xl shadow-purple-700/20 hover:shadow-purple-600/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo('features')}
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur text-gray-300 font-semibold text-base hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              Ver Demonstração
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[
            ['500+', 'Tarefas gerenciadas'],
            ['99%', 'Uptime garantido'],
            ['4.9★', 'Satisfação'],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )

  /* ─── Features Grid ─── */
  const Features = () => (
    <Section id="features" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#5d109c]/15 border border-[#5d109c]/30 text-[#a78bfa] text-xs sm:text-sm font-medium mb-4">
            Funcionalidades
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Tudo que seu estúdio precisa
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Ferramentas pensadas para o dia a dia de quem vive de imagem, sem complexidade desnecessária.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.1}>
              <div className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md hover:border-[#5d109c]/40 hover:bg-white/[0.06] transition-all duration-300 h-full">
                {/* glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5d109c]/0 to-[#7c3aed]/0 group-hover:from-[#5d109c]/5 group-hover:to-[#7c3aed]/5 transition-all duration-300 pointer-events-none" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5d109c]/20 to-[#7c3aed]/20 flex items-center justify-center mb-5 group-hover:from-[#5d109c]/30 group-hover:to-[#7c3aed]/30 transition-colors">
                    <f.icon className="w-6 h-6 text-[#a78bfa]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )

  /* ─── Prova Social ─── */
  const SocialProof = () => (
    <Section id="social" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#5d109c]/15 border border-[#5d109c]/30 text-[#a78bfa] text-xs sm:text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Quem usa, recomenda
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.12}>
              <div className="relative p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md h-full flex flex-col">
                <Quote className="w-8 h-8 text-[#5d109c]/40 mb-4 flex-shrink-0" />
                <p className="text-gray-300 leading-relaxed italic flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/[0.06]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5d109c] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-[#7c3aed] text-[#7c3aed]" />
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )

  /* ─── Pricing ─── */
  const Pricing = () => (
    <Section id="pricing" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#5d109c]/15 border border-[#5d109c]/30 text-[#a78bfa] text-xs sm:text-sm font-medium mb-4">
            Planos
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Escolha o plano ideal
          </h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">
            Comece pequeno e escale quando precisar. Sem surpresas, sem fidelidade.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.12}>
              <div
                className={`relative rounded-2xl p-[1px] ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-[#7c3aed] to-[#5d109c]'
                    : 'bg-white/[0.06]'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-[#5d109c] to-[#7c3aed] text-white text-xs font-bold shadow-lg shadow-purple-700/30">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div
                  className={`relative rounded-2xl p-6 sm:p-8 h-full ${
                    plan.highlight
                      ? 'bg-[#0f0a1a]'
                      : 'bg-white/[0.02] backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        plan.highlight
                          ? 'bg-gradient-to-br from-[#5d109c] to-[#7c3aed]'
                          : 'bg-[#5d109c]/15'
                      }`}
                    >
                      <plan.icon
                        className={`w-5 h-5 ${plan.highlight ? 'text-white' : 'text-[#a78bfa]'}`}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  </div>

                  <div className="mb-8">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-500 text-sm ml-1">{plan.period}</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-[#7c3aed] mt-0.5 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate('/login')}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                      plan.highlight
                        ? 'bg-gradient-to-r from-[#5d109c] to-[#7c3aed] text-white shadow-lg shadow-purple-700/25 hover:shadow-purple-600/40'
                        : 'border border-white/10 text-gray-300 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )

  /* ─── CTA Final ─── */
  const FinalCTA = () => (
    <Section className="py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="relative rounded-3xl overflow-hidden p-[1px] bg-gradient-to-br from-[#5d109c]/60 to-[#7c3aed]/30">
          <div className="relative rounded-3xl bg-[#09090b] px-6 sm:px-16 py-16 sm:py-20">
            {/* glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#5d109c]/15 rounded-full blur-[120px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                Pronto para transformar{' '}
                <span className="bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent">
                  seu estúdio?
                </span>
              </h2>
              <p className="mt-6 text-gray-400 max-w-lg mx-auto text-lg">
                Crie sua conta em menos de 2 minutos e comece a organizar sua agenda como nunca antes.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-10 group inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#5d109c] to-[#7c3aed] text-white font-bold text-lg shadow-xl shadow-purple-700/25 hover:shadow-purple-600/50 transition-all cursor-pointer"
              >
                Criar minha conta
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )

  /* ─── Footer ─── */
  const Footer = () => (
    <footer className="border-t border-white/[0.06] bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5d109c] to-[#7c3aed] flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Clic<span className="text-[#7c3aed]">Studio</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Gestão inteligente de agenda para estúdios de fotografia e vídeo.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Produto</h4>
            <ul className="space-y-2.5">
              {['Funcionalidades', 'Planos', 'Changelog'].map((l) => (
                <li key={l}>
                  <button
                    onClick={() =>
                      l === 'Funcionalidades'
                        ? scrollTo('features')
                        : l === 'Planos'
                        ? scrollTo('pricing')
                        : null
                    }
                    className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2.5">
              {['Sobre', 'Contato', 'Termos de Uso', 'Privacidade'].map((l) => (
                <li key={l}>
                  <span className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Redes */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              {[
                { icon: Instagram, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Mail, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-[#a78bfa] hover:border-[#5d109c]/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} ClicStudio. Todos os direitos reservados.
          </p>
          <p className="text-xs text-gray-600">
            Feito para criativos pela{' '}
            <span className="text-[#a78bfa] font-medium">Agência Buffalo</span>
          </p>
        </div>
      </div>
    </footer>
  )

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-[#09090b] text-white antialiased selection:bg-[#5d109c]/40">
      <Navbar />
      <Hero />
      <Features />
      <SocialProof />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
