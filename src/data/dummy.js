export const eventInfo = {
  title: 'Rapat Paripurna DPRD',
  date: '1 Juni 2026',
  location: 'Ruang Sidang Utama',
  session: 'Sesi Pagi',
}

export const stats = {
  totalRegistered: 248,
  checkedIn: 187,
  pending: 61,
  groups: 12,
}

/** @deprecated Digunakan halaman lain; Dashboard memakai masterGroups */
export const groups = [
  { id: 'g1', name: 'Fraksi PDI Perjuangan', registered: 42, checkedIn: 38, color: '#3d2a5c' },
  { id: 'g2', name: 'Fraksi Golkar', registered: 35, checkedIn: 29, color: '#4a3568' },
  { id: 'g3', name: 'Fraksi Gerindra', registered: 28, checkedIn: 22, color: '#5c4a7a' },
  { id: 'g4', name: 'Fraksi Nasdem', registered: 24, checkedIn: 19, color: '#6b5a8a' },
  { id: 'g5', name: 'Tamu Undangan', registered: 56, checkedIn: 41, color: '#7a6a9a' },
  { id: 'g6', name: 'Media & Pers', registered: 18, checkedIn: 12, color: '#8a7aaa' },
]

export const liveFeed = [
  {
    id: 'l1',
    name: 'Dr. Ahmad Wijaya',
    role: 'Anggota DPRD',
    group: 'Fraksi PDI Perjuangan',
    time: '09:42:15',
    status: 'hadir',
  },
  {
    id: 'l2',
    name: 'Siti Rahmawati, S.H.',
    role: 'Tamu Undangan',
    group: 'Tamu Undangan',
    time: '09:41:58',
    status: 'hadir',
  },
  {
    id: 'l3',
    name: 'Budi Santoso',
    role: 'Wartawan',
    group: 'Media & Pers',
    time: '09:41:32',
    status: 'hadir',
  },
  {
    id: 'l4',
    name: 'Ir. Made Surya',
    role: 'Anggota DPRD',
    group: 'Fraksi Golkar',
    time: '09:40:47',
    status: 'hadir',
  },
  {
    id: 'l5',
    name: 'Dewi Lestari',
    role: 'Sekretariat DPRD',
    group: 'Tamu Undangan',
    time: '09:40:12',
    status: 'hadir',
  },
]

export const sampleGuest = {
  id: 'TAM-2026-0142',
  name: 'Dr. Ahmad Wijaya',
  nik: '3273********0012',
  role: 'Anggota DPRD',
  group: 'Fraksi PDI Perjuangan',
  institution: 'DPRD Kabupaten/Kota',
  registeredAt: '28 Mei 2026',
  seat: 'Baris A — Kursi 12',
}

// ─── Data Master DIHATIMU ───────────────────────────────────────────────────

export const roleOptions = ['TAMU', 'PENERIMA TAMU', 'PENANDATANGAN SPPD']

export const DEFAULT_ROLE = 'TAMU'

export function toTitleCase(value) {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const instansiOptions = ['SEKRETARIAT', 'DPRD']

export const levelWilayahOptions = ['PROVINSI', 'KABUPATEN', 'KOTA']

export const wilayahOptions = {
  provinsi: ['Jawa Barat', 'Banten', 'DKI Jakarta'],
  kabupaten: ['Subang', 'Garut', 'Bandung'],
  kota: ['Bogor', 'Cimahi', 'Bandung'],
}

const LEVEL_CODE = {
  PROVINSI: 'PROV',
  KABUPATEN: 'KAB',
  KOTA: 'KOT',
}

export function getWilayahLabel(level, form) {
  if (level === 'PROVINSI') return form.provinsi
  if (level === 'KABUPATEN') return form.kabupaten
  return form.kota
}

export function buildGroupName({ instansi, level, wilayah }) {
  const w = String(wilayah).trim().toUpperCase()
  const inst = String(instansi).trim().toUpperCase()
  const lvl = String(level).trim().toUpperCase()
  if (inst === 'DPRD') return `DPRD ${lvl} ${w}`
  return `SEKRETARIAT DPRD ${lvl} ${w}`
}

export function buildGroupCode({ instansi, level, wilayah }) {
  const levelCode = LEVEL_CODE[level]
  const wilayahCode = wilayah.toUpperCase().replace(/\s+/g, '-')
  if (instansi === 'DPRD') return `DPRD-${levelCode}-${wilayahCode}`
  return `SEK-DPRD-${levelCode}-${wilayahCode}`
}

export function generateGroupId(sequence) {
  return `GRP-${String(sequence).padStart(4, '0')}`
}

export function getNextGroupSequence(masterGroups) {
  const maxSeq = masterGroups.reduce((max, g) => {
    const num = parseInt(String(g.groupId || '').replace('GRP-', ''), 10)
    return Number.isNaN(num) ? max : Math.max(max, num)
  }, 0)
  return maxSeq + 1
}

export function generateQrId(groupCode, number) {
  return `DHTM-${groupCode}-${String(number).padStart(4, '0')}`
}

export function collectAllQrIds(masterGroups) {
  return new Set(masterGroups.flatMap((g) => g.participants.map((p) => p.qrId)))
}

export function generateUniqueQrId(group, masterGroups) {
  const used = collectAllQrIds(masterGroups)
  let number = group.participants.length + 1
  let qrId = generateQrId(group.code, number)

  while (used.has(qrId)) {
    number += 1
    qrId = generateQrId(group.code, number)
  }

  return qrId
}

export function createParticipant(group, { nama, jabatan, role }, masterGroups) {
  const qrId = generateUniqueQrId(group, masterGroups)
  const nextNumber = group.participants.length + 1

  return {
    id: `p-${group.id}-${nextNumber}-${Date.now()}`,
    nama: toTitleCase(nama),
    jabatan: toTitleCase(jabatan),
    role,
    kehadiran: 'BELUM HADIR',
    qrId,
    foto: null,
  }
}

export function todayIsoDate() {
  return new Date().toISOString().split('T')[0]
}

export function createMasterGroup({ instansi, level, wilayah, groupSequence, tanggalKegiatan }) {
  const name = buildGroupName({ instansi, level, wilayah })
  const code = buildGroupCode({ instansi, level, wilayah })

  return {
    id: `mg-${Date.now()}`,
    groupId: generateGroupId(groupSequence),
    name,
    instansi,
    level,
    wilayah,
    code,
    status: 'active',
    tanggalKegiatan: tanggalKegiatan || todayIsoDate(),
    catatan: '',
    participants: [],
  }
}

export function isGroupActive(group) {
  return group.status !== 'archived'
}

export function getActiveGroups(masterGroups) {
  return masterGroups.filter(isGroupActive)
}

export function getArchivedGroups(masterGroups) {
  return masterGroups.filter((g) => g.status === 'archived')
}

export function formatTanggalKegiatan(isoDate) {
  if (!isoDate) return 'Tanpa Tanggal'
  try {
    return new Date(isoDate + 'T00:00:00').toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return isoDate
  }
}

export function groupArchivedByDate(masterGroups) {
  const map = new Map()
  for (const group of getArchivedGroups(masterGroups)) {
    const key = group.tanggalKegiatan || '0000-00-00'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(group)
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, groups]) => ({
      date,
      label: formatTanggalKegiatan(date === '0000-00-00' ? null : date),
      groups,
    }))
}

export function computeGroupStats(group) {
  const total = group.participants.length
  const hadir = group.participants.filter((p) => p.kehadiran === 'HADIR').length
  return {
    total,
    hadir,
    belum: total - hadir,
    percent: total > 0 ? Math.round((hadir / total) * 100) : 0,
  }
}

export function computeDashboardStats(masterGroups) {
  const active = getActiveGroups(masterGroups)
  const totalGroup = active.length
  const totalPeserta = active.reduce((sum, g) => sum + g.participants.length, 0)
  const sudahHadir = active.reduce(
    (sum, g) => sum + g.participants.filter((p) => p.kehadiran === 'HADIR').length,
    0,
  )
  return {
    totalGroup,
    totalPeserta,
    sudahHadir,
    belumHadir: totalPeserta - sudahHadir,
  }
}

export function getRecentActivity(masterGroups, limit = 8) {
  const activities = []

  for (const group of masterGroups) {
    for (const p of group.participants) {
      if (p.kehadiran === 'HADIR' && p.jamHadir) {
        activities.push({
          id: `act-${p.id}`,
          nama: p.nama,
          groupName: group.name,
          time: p.jamHadir,
          checkInAt: p.checkInAt || 0,
          participantId: p.id,
          groupId: group.id,
          foto: p.foto,
          jabatan: p.jabatan,
        })
      }
    }
  }

  return activities.sort((a, b) => b.checkInAt - a.checkInAt).slice(0, limit)
}

export function getLatestCheckIn(masterGroups) {
  const [latest] = getRecentActivity(masterGroups, 1)
  return latest || null
}

/** Lookup peserta by qrId — dipakai Scanner (case-insensitive) */
export function findParticipantByQrId(masterGroups, qrId) {
  const target = String(qrId || '').trim()
  if (!target) return null

  for (const group of masterGroups) {
    const participant = group.participants.find(
      (p) => p.qrId === target || p.qrId.toUpperCase() === target.toUpperCase(),
    )
    if (participant) return { group, participant }
  }
  return null
}

export const initialMasterGroups = []