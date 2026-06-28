import { supabase } from '../lib/supabase'
import { initialMasterGroups, toTitleCase } from './dummy'

const STORAGE_KEY = 'dihatimu-master-groups'
const listeners = new Set()

let masterGroups = []

function notify() {
  listeners.forEach((cb) => cb())
}

function normalizeGroup(group) {
  return {
    status: 'active',
    tanggalKegiatan: new Date().toISOString().split('T')[0],
    catatan: '',
    participants: [],
    ...group,
  }
}

function dbGroupToApp(row, participants = []) {
  return normalizeGroup({
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    instansi: row.instansi,
    level: row.level,
    wilayah: row.wilayah,
    code: row.code,
    status: row.status,
    tanggalKegiatan: row.tanggal_kegiatan,
    catatan: row.catatan || '',
    participants,
  })
}

function dbParticipantToApp(row) {
  return {
    id: row.id,
    nama: row.nama,
    jabatan: row.jabatan,
    role: row.role || 'TAMU',
    qrId: row.qr_id,
    kehadiran: row.kehadiran || 'BELUM HADIR',
    foto: row.foto,
    jamHadir: row.jam_hadir,
    tanggalHadir: row.tanggal_hadir,
    checkInAt: row.check_in_at ? Date.parse(row.check_in_at) : null,
  }
}

function groupToDb(group) {
  return {
    group_id: group.groupId,
    name: group.name,
    instansi: group.instansi,
    level: group.level,
    wilayah: group.wilayah,
    code: group.code,
    status: group.status || 'active',
    tanggal_kegiatan: group.tanggalKegiatan,
    catatan: group.catatan || '',
  }
}

function participantToDb(groupId, participant) {
  return {
    master_group_id: groupId,
    nama: participant.nama,
    jabatan: participant.jabatan,
    role: participant.role || 'TAMU',
    qr_id: participant.qrId,
    kehadiran: participant.kehadiran || 'BELUM HADIR',
    foto: participant.foto || null,
    jam_hadir: participant.jamHadir || null,
    tanggal_hadir: participant.tanggalHadir || null,
    check_in_at: participant.checkInAt
      ? new Date(participant.checkInAt).toISOString()
      : null,
  }
}

async function loadFromSupabase() {
  const { data: groups, error: groupError } = await supabase
    .from('master_groups')
    .select('*')
    .order('created_at', { ascending: false })

  if (groupError) {
    console.error('[DIHATIMU] Gagal load master_groups:', groupError)
    masterGroups = initialMasterGroups.map(normalizeGroup)
    notify()
    return
  }

  const { data: participants, error: participantError } = await supabase
    .from('participants')
    .select('*')

  if (participantError) {
    console.error('[DIHATIMU] Gagal load participants:', participantError)
  }

  masterGroups = (groups || []).map((group) => {
    const groupParticipants = (participants || [])
      .filter((p) => p.master_group_id === group.id)
      .map(dbParticipantToApp)

    return dbGroupToApp(group, groupParticipants)
  })

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(masterGroups))
  } catch {
    /* ignore */
  }

  notify()
}

loadFromSupabase()

export function refreshMasterGroups() {
  return loadFromSupabase()
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getMasterGroups() {
  return masterGroups
}

export function setMasterGroups(groups) {
  masterGroups = groups.map(normalizeGroup)
  notify()
}

export async function addMasterGroup(group) {
  const payload = groupToDb(group)

  const { data, error } = await supabase
    .from('master_groups')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('[DIHATIMU] Gagal tambah group:', error)
    alert('Gagal menyimpan group ke Supabase.')
    return
  }

  masterGroups = [dbGroupToApp(data, []), ...masterGroups]
  notify()
}

export async function updateGroup(groupId, updates) {
  const payload = {}

  if (updates.name !== undefined) payload.name = updates.name
  if (updates.instansi !== undefined) payload.instansi = updates.instansi
  if (updates.level !== undefined) payload.level = updates.level
  if (updates.wilayah !== undefined) payload.wilayah = updates.wilayah
  if (updates.code !== undefined) payload.code = updates.code
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.tanggalKegiatan !== undefined) payload.tanggal_kegiatan = updates.tanggalKegiatan
  if (updates.catatan !== undefined) payload.catatan = updates.catatan

  const { error } = await supabase
    .from('master_groups')
    .update(payload)
    .eq('id', groupId)

  if (error) {
    console.error('[DIHATIMU] Gagal update group:', error)
    alert('Gagal update group.')
    return
  }

  masterGroups = masterGroups.map((g) =>
    g.id === groupId ? normalizeGroup({ ...g, ...updates }) : g,
  )
  notify()
}

export function archiveGroup(groupId) {
  return updateGroup(groupId, {
    status: 'archived',
    archivedAt: Date.now(),
  })
}

export function restoreGroup(groupId) {
  return updateGroup(groupId, {
    status: 'active',
    archivedAt: null,
  })
}

export async function deleteGroup(groupId) {
  const { error } = await supabase
    .from('master_groups')
    .delete()
    .eq('id', groupId)

  if (error) {
    console.error('[DIHATIMU] Gagal hapus group:', error)
    alert('Gagal hapus group.')
    return
  }

  masterGroups = masterGroups.filter((g) => g.id !== groupId)
  notify()
}

export async function addParticipant(groupId, participant) {
  const payload = participantToDb(groupId, participant)

  const { data, error } = await supabase
    .from('participants')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('[DIHATIMU] Gagal tambah peserta:', error)
    alert('Gagal menyimpan peserta ke Supabase.')
    return
  }

  const savedParticipant = dbParticipantToApp(data)

  masterGroups = masterGroups.map((g) =>
    g.id === groupId
      ? { ...g, participants: [...g.participants, savedParticipant] }
      : g,
  )

  notify()
}

export async function updateParticipant(groupId, participantId, updates) {
  const payload = {}

  if (updates.nama !== undefined) payload.nama = toTitleCase(updates.nama)
  if (updates.jabatan !== undefined) payload.jabatan = toTitleCase(updates.jabatan)
  if (updates.role !== undefined) payload.role = updates.role
  if (updates.qrId !== undefined) payload.qr_id = updates.qrId
  if (updates.kehadiran !== undefined) payload.kehadiran = updates.kehadiran
  if (updates.foto !== undefined) payload.foto = updates.foto
  if (updates.jamHadir !== undefined) payload.jam_hadir = updates.jamHadir
  if (updates.tanggalHadir !== undefined) payload.tanggal_hadir = updates.tanggalHadir
  if (updates.checkInAt !== undefined) {
    payload.check_in_at = updates.checkInAt
      ? new Date(updates.checkInAt).toISOString()
      : null
  }

  const { error } = await supabase
    .from('participants')
    .update(payload)
    .eq('id', participantId)

  if (error) {
    console.error('[DIHATIMU] Gagal update peserta:', error)
    alert('Gagal update peserta.')
    return
  }

  masterGroups = masterGroups.map((g) => {
    if (g.id !== groupId) return g

    return {
      ...g,
      participants: g.participants.map((p) =>
        p.id === participantId
          ? {
              ...p,
              ...updates,
              nama: updates.nama ? toTitleCase(updates.nama) : p.nama,
              jabatan: updates.jabatan ? toTitleCase(updates.jabatan) : p.jabatan,
            }
          : p,
      ),
    }
  })

  notify()
}

export async function deleteParticipant(groupId, participantId) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', participantId)

  if (error) {
    console.error('[DIHATIMU] Gagal hapus peserta:', error)
    alert('Gagal hapus peserta.')
    return
  }

  masterGroups = masterGroups.map((g) =>
    g.id === groupId
      ? { ...g, participants: g.participants.filter((p) => p.id !== participantId) }
      : g,
  )

  notify()
}

export function findGroupById(groupId) {
  return masterGroups.find((g) => g.id === groupId) || null
}

export async function recordCheckIn(
  groupId,
  participantId,
  { foto = null, jamHadir, tanggalHadir } = {},
) {
  const now = new Date()
  const time =
    jamHadir ||
    now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' WIB'

  const date = tanggalHadir || now.toISOString().split('T')[0]
  const checkInAt = now.toISOString()

  const group = masterGroups.find((g) => g.id === groupId)
  const participant = group?.participants.find((p) => p.id === participantId)

  const updatePayload = {
    kehadiran: 'HADIR',
    foto: foto ?? participant?.foto ?? null,
    jam_hadir: time,
    tanggal_hadir: date,
    check_in_at: checkInAt,
  }

  const { error } = await supabase
    .from('participants')
    .update(updatePayload)
    .eq('id', participantId)

  if (error) {
    console.error('[DIHATIMU] Gagal simpan kehadiran:', error)
    alert('Gagal menyimpan kehadiran.')
    return
  }

  await supabase.from('attendance_logs').insert({
    master_group_id: groupId,
    participant_id: participantId,
    qr_id: participant?.qrId || null,
    nama: participant?.nama || null,
    jabatan: participant?.jabatan || null,
    foto: foto ?? participant?.foto ?? null,
    jam_hadir: time,
    tanggal_hadir: date,
    device_info: navigator.userAgent,
  })

  masterGroups = masterGroups.map((g) => {
    if (g.id !== groupId) return g

    return {
      ...g,
      participants: g.participants.map((p) =>
        p.id === participantId
          ? {
              ...p,
              kehadiran: 'HADIR',
              foto: foto ?? p.foto,
              jamHadir: time,
              tanggalHadir: date,
              checkInAt: Date.now(),
            }
          : p,
      ),
    }
  })

  notify()
}