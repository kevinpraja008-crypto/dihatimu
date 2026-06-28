const STORAGE_KEY = 'dihatimu-settings'

const DEFAULT_SETTINGS = {
  namaInstansi: 'Sekretariat DPRD Kabupaten Subang',
  liveMonitor: {
    displayDuration: 8,
    animationEnabled: true,
    soundEnabled: true,
  },
}

const listeners = new Set()

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
  } catch {
    /* fallback */
  }
  return { ...DEFAULT_SETTINGS }
}

let settings = load()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
  listeners.forEach((cb) => cb())
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSettings() {
  return settings
}

export function updateSettings(updates) {
  settings = { ...settings, ...updates }
  persist()
}

export function updateLiveMonitorSettings(updates) {
  settings = {
    ...settings,
    liveMonitor: { ...settings.liveMonitor, ...updates },
  }
  persist()
}

export function exportBackup() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    masterGroups: JSON.parse(localStorage.getItem('dihatimu-master-groups') || '[]'),
    settings,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `dihatimu-backup-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  URL.revokeObjectURL(link.href)
}

export function restoreBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (data.masterGroups) {
          localStorage.setItem('dihatimu-master-groups', JSON.stringify(data.masterGroups))
        }
        if (data.settings) {
          settings = { ...DEFAULT_SETTINGS, ...data.settings }
          persist()
        }
        resolve(data)
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
