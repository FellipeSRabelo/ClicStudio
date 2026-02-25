import { useState, useEffect } from 'react'

function getIsIOS() {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function getIsStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS] = useState(getIsIOS)
  const [isStandalone] = useState(getIsStandalone)

  useEffect(() => {
    if (getIsStandalone()) {
      setIsInstalled(true)
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const installedHandler = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const install = async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    if (outcome === 'accepted') {
      setIsInstalled(true)
      return true
    }
    return false
  }

  // canInstall: Android/Desktop com prompt nativo OU iOS que ainda não está em standalone
  const canInstallNative = !!deferredPrompt && !isInstalled
  const canInstallIOS = isIOS && !isStandalone && !isInstalled

  return {
    canInstall: canInstallNative || canInstallIOS,
    canInstallNative,
    canInstallIOS,
    isInstalled,
    isStandalone,
    isIOS,
    install,
  }
}
