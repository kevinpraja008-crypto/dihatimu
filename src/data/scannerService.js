import { findParticipantByQrId } from './dummy'

const QR_ID_PATTERN = /^DHTM-[A-Z0-9-]+$/i

/**
 * Parse isi QR mentah menjadi payload terstruktur.
 * Mendukung: qrId langsung, JSON, URL dengan query param.
 */
export function parseQrPayload(raw) {
  const text = String(raw || '').trim()

  if (!text) {
    return { valid: false, error: 'Format QR tidak valid.' }
  }

  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text)
      const payload = {
        qrId: obj.qrId ? String(obj.qrId).trim() : null,
        groupId: obj.groupId ? String(obj.groupId).trim() : null,
        participantId: obj.participantId ? String(obj.participantId).trim() : null,
      }
      if (!payload.qrId && !payload.participantId) {
        return { valid: false, error: 'Format QR tidak valid.' }
      }
      return { valid: true, payload }
    } catch {
      return { valid: false, error: 'Format QR tidak valid.' }
    }
  }

  if (text.includes('://') || text.startsWith('?')) {
    try {
      const url = text.startsWith('?')
        ? new URL(text, 'https://dihatimu.local')
        : new URL(text)
      const params = url.searchParams
      const payload = {
        qrId: params.get('qrId')?.trim() || null,
        groupId: params.get('groupId')?.trim() || null,
        participantId: params.get('participantId')?.trim() || null,
      }
      if (!payload.qrId && !payload.participantId && !payload.groupId) {
        return { valid: false, error: 'Format QR tidak valid.' }
      }
      if (!payload.qrId && !payload.participantId) {
        return { valid: false, error: 'Format QR tidak valid.' }
      }
      return { valid: true, payload }
    } catch {
      return { valid: false, error: 'Format QR tidak valid.' }
    }
  }

  if (QR_ID_PATTERN.test(text)) {
    return { valid: true, payload: { qrId: text, groupId: null, participantId: null } }
  }

  return { valid: false, error: 'Format QR tidak valid.' }
}

/** @deprecated gunakan parseQrPayload — kompatibilitas */
export function normalizeQrPayload(raw) {
  const parsed = parseQrPayload(raw)
  if (!parsed.valid) return ''
  return parsed.payload.qrId || parsed.payload.participantId || ''
}

function findGroupByRef(masterGroups, groupRef) {
  if (!groupRef) return null
  const ref = String(groupRef).trim()
  return (
    masterGroups.find((g) => g.id === ref || g.groupId === ref) || null
  )
}

function withSource(group, participant) {
  return {
    group,
    participant,
    source: group.status === 'archived' ? 'arsip' : 'aktif',
  }
}

/**
 * Cari peserta di seluruh master (aktif + arsip).
 * Validasi silang: qrId, groupId, participantId harus cocok jika disediakan bersamaan.
 */
export function findParticipantInMaster(masterGroups, payload) {
  const qrId = payload.qrId?.trim() || null
  const groupRef = payload.groupId?.trim() || null
  const participantId = payload.participantId?.trim() || null

  if (qrId) {
    const byQr = findParticipantByQrId(masterGroups, qrId)
    if (byQr) {
      if (groupRef) {
        const g = findGroupByRef(masterGroups, groupRef)
        if (!g || g.id !== byQr.group.id) return null
      }
      if (participantId && byQr.participant.id !== participantId) return null
      return withSource(byQr.group, byQr.participant)
    }
  }

  if (groupRef && participantId) {
    const group = findGroupByRef(masterGroups, groupRef)
    if (!group) return null
    const participant = group.participants.find((p) => p.id === participantId)
    if (!participant) return null
    if (qrId && participant.qrId.toUpperCase() !== qrId.toUpperCase()) return null
    return withSource(group, participant)
  }

  if (participantId) {
    let match = null
    for (const group of masterGroups) {
      const participant = group.participants.find((p) => p.id === participantId)
      if (participant) {
        if (match) return null
        match = withSource(group, participant)
      }
    }
    if (match && qrId && match.participant.qrId.toUpperCase() !== qrId.toUpperCase()) {
      return null
    }
    return match
  }

  return null
}

/**
 * Resolve scan QR ke peserta master (aktif + arsip).
 * Hanya QR yang cocok dengan data master yang diterima.
 */
export function resolveQrScan(masterGroups, raw) {
  console.log('QR terbaca:', raw)

  const parsed = parseQrPayload(raw)

  if (!parsed.valid) {
    console.log('QR payload normal:', null)
    return { ok: false, error: parsed.error }
  }

  console.log('QR payload normal:', parsed.payload)

  const found = findParticipantInMaster(masterGroups, parsed.payload)

  if (!found) {
    console.log('Peserta ditemukan:', null)
    console.log('Sumber data:', null)
    return { ok: false, error: 'QR tidak terdaftar pada sistem DIHATIMU.' }
  }

  console.log('Peserta ditemukan:', found.participant)
  console.log('Sumber data:', found.source)

  const alreadyHadir = found.participant.kehadiran === 'HADIR'

  return {
    ok: true,
    group: found.group,
    participant: found.participant,
    qrId: found.participant.qrId,
    source: found.source,
    alreadyHadir,
  }
}

/** State navigasi ke halaman Review */
export function buildReviewState({ group, participant, source }) {
  const alreadyHadir = participant.kehadiran === 'HADIR'
  return {
    mode: 'real',
    groupId: group.id,
    participantId: participant.id,
    qrId: participant.qrId,
    source: source || (group.status === 'archived' ? 'arsip' : 'aktif'),
    readOnly: alreadyHadir,
    alreadyHadir,
  }
}
