import { supabase } from '../lib/supabase'
import {
  createAttendancePhotoSignedUrlMap,
  isStoredAttendancePhoto,
} from './attendancePhotoService'
import { initialMasterGroups, toTitleCase } from './dummy'

const listeners = new Set()

let masterGroups = []

function notify() {
  listeners.forEach((cb) => cb())
}

function normalizeGroup(group) {
  return {
    status: 'active',
    tanggalKegiatan: new Date().toISOString().split('T')[0],
    unitKunjungan: '',
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
    unitKunjungan: row.unit_kunjungan || '',
    code: row.code,
    status: row.status,
    tanggalKegiatan: row.tanggal_kegiatan,
    catatan: row.catatan || '',
    participants,
  })
}

function dbParticipantToApp(
  row,
  signedPhotoUrls = new Map(),
) {
  const storedPhotoPath =
    isStoredAttendancePhoto(row.foto)
      ? row.foto
      : null

  const displayPhoto =
    storedPhotoPath
      ? signedPhotoUrls.get(
        storedPhotoPath,
      ) || null
      : row.foto

  return {
    id: row.id,
    nama: row.nama,
    jabatan: row.jabatan,
    role: row.role || 'TAMU',
    qrId: row.qr_id,
    kehadiran:
      row.kehadiran
      || 'BELUM HADIR',
    foto: displayPhoto,
    fotoPath: storedPhotoPath,
    jamHadir: row.jam_hadir,
    tanggalHadir:
      row.tanggal_hadir,
    checkInAt:
      row.check_in_at
        ? Date.parse(row.check_in_at)
        : null,
  }
}

function groupToDb(group) {
  return {
    group_id: group.groupId,
    name: group.name,
    instansi: group.instansi,
    level: group.level,
    wilayah: group.wilayah,
    unit_kunjungan: group.unitKunjungan || null,
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
    foto:
      isStoredAttendancePhoto(
        participant.fotoPath,
      )
        ? participant.fotoPath
        : participant.foto || null,
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

  let signedPhotoUrls = new Map()

  try {
    signedPhotoUrls =
      await createAttendancePhotoSignedUrlMap(
        (participants || []).map(
          (participant) =>
            participant.foto,
        ),
      )
  } catch (error) {
    console.error(
      '[DIHATIMU] Gagal membuat URL foto privat:',
      error,
    )
  }

  masterGroups = (groups || []).map((group) => {
    const groupParticipants = (participants || [])
      .filter((p) => p.master_group_id === group.id)
      .map((participant) =>
        dbParticipantToApp(
          participant,
          signedPhotoUrls,
        ),
      )

    return dbGroupToApp(group, groupParticipants)
  })


  notify()
}


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

    return {
      ok: false,
      error,
    }
  }

  const savedGroup = dbGroupToApp(data, [])

  masterGroups = [savedGroup, ...masterGroups]
  notify()

  return {
    ok: true,
    group: savedGroup,
  }
}

export async function updateGroup(groupId, updates) {
  const payload = {}

  if (updates.name !== undefined) {
    payload.name = updates.name
  }

  if (updates.instansi !== undefined) {
    payload.instansi = updates.instansi
  }

  if (updates.level !== undefined) {
    payload.level = updates.level
  }

  if (updates.wilayah !== undefined) {
    payload.wilayah = updates.wilayah
  }

  if (updates.unitKunjungan !== undefined) {
    payload.unit_kunjungan = updates.unitKunjungan || null
  }

  if (updates.code !== undefined) {
    payload.code = updates.code
  }

  if (updates.status !== undefined) {
    payload.status = updates.status
  }

  if (updates.tanggalKegiatan !== undefined) {
    payload.tanggal_kegiatan = updates.tanggalKegiatan
  }

  if (updates.catatan !== undefined) {
    payload.catatan = updates.catatan
  }

  const { data, error } = await supabase
    .from('master_groups')
    .update(payload)
    .eq('id', groupId)
    .select('*')
    .single()

  if (error) {
    console.error('[DIHATIMU] Gagal update group:', error)
    alert('Gagal memperbarui group.')

    return {
      ok: false,
      error,
    }
  }

  const currentGroup = masterGroups.find(
    (group) => group.id === groupId,
  )

  const updatedGroup = dbGroupToApp(
    data,
    currentGroup?.participants || [],
  )

  masterGroups = masterGroups.map((group) =>
    group.id === groupId ? updatedGroup : group,
  )

  notify()

  return {
    ok: true,
    group: updatedGroup,
  }
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

    return {
      ok: false,
      message: 'Gagal menyimpan peserta ke Supabase.',
      error,
    }
  }

  const savedParticipant = dbParticipantToApp(data)

  masterGroups = masterGroups.map((group) =>
    group.id === groupId
      ? {
        ...group,
        participants: [
          ...group.participants,
          savedParticipant,
        ],
      }
      : group,
  )

  notify()

  return {
    ok: true,
    participant: savedParticipant,
  }
}
export async function updateParticipant(
  groupId,
  participantId,
  updates,
) {
  const payload = {}

  if (updates.nama !== undefined) {
    payload.nama = toTitleCase(updates.nama)
  }

  if (updates.jabatan !== undefined) {
    payload.jabatan = toTitleCase(updates.jabatan)
  }

  if (updates.role !== undefined) {
    payload.role = updates.role
  }

  if (updates.qrId !== undefined) {
    payload.qr_id = updates.qrId
  }

  if (updates.kehadiran !== undefined) {
    payload.kehadiran = updates.kehadiran
  }

  if (
    updates.fotoPath !== undefined
    || updates.foto !== undefined
  ) {
    payload.foto =
      isStoredAttendancePhoto(
        updates.fotoPath,
      )
        ? updates.fotoPath
        : updates.foto || null
  }

  if (updates.jamHadir !== undefined) {
    payload.jam_hadir = updates.jamHadir
  }

  if (updates.tanggalHadir !== undefined) {
    payload.tanggal_hadir = updates.tanggalHadir
  }

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
    console.error(
      '[DIHATIMU] Gagal update peserta:',
      error,
    )

    return {
      ok: false,
      message: 'Gagal memperbarui peserta di Supabase.',
      error,
    }
  }

  masterGroups = masterGroups.map((group) => {
    if (group.id !== groupId) return group

    return {
      ...group,
      participants: group.participants.map((participant) =>
        participant.id === participantId
          ? {
            ...participant,
            ...updates,
            nama:
              updates.nama !== undefined
                ? toTitleCase(updates.nama)
                : participant.nama,
            jabatan:
              updates.jabatan !== undefined
                ? toTitleCase(updates.jabatan)
                : participant.jabatan,
          }
          : participant,
      ),
    }
  })

  notify()

  return {
    ok: true,
  }
}

export async function deleteParticipant(
  groupId,
  participantId,
) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('id', participantId)

  if (error) {
    console.error(
      '[DIHATIMU] Gagal hapus peserta:',
      error,
    )

    return {
      ok: false,
      message:
        'Peserta gagal dihapus dari Supabase. Silakan coba lagi.',
    }
  }

  masterGroups = masterGroups.map((group) =>
    group.id === groupId
      ? {
        ...group,
        participants: group.participants.filter(
          (participant) =>
            participant.id !== participantId,
        ),
      }
      : group,
  )

  notify()

  return {
    ok: true,
  }
}

export function findGroupById(groupId) {
  return masterGroups.find((g) => g.id === groupId) || null
}
export async function beginParticipantCheckIn(
  groupId,
  participantId,
) {
  const group = masterGroups.find(
    (item) => item.id === groupId,
  )

  if (!group) {
    return {
      ok: false,
      message: 'Master Group peserta tidak ditemukan.',
    }
  }

  const participant = group.participants.find(
    (item) => item.id === participantId,
  )

  if (!participant) {
    return {
      ok: false,
      message: 'Data peserta tidak ditemukan.',
    }
  }

  if (participant.kehadiran === 'HADIR') {
    return {
      ok: false,
      message: 'Peserta sudah tercatat hadir.',
    }
  }

  const { data, error } = await supabase.rpc(
    'begin_participant_check_in',
    {
      p_group_id: groupId,
      p_participant_id: participantId,
    },
  )

  if (error) {
    console.error(
      '[DIHATIMU] Gagal memulai sesi scan:',
      error,
    )

    return {
      ok: false,
      message:
        error.message ||
        'Sesi scan gagal dibuat. Silakan scan ulang.',
    }
  }

  if (
    !data?.ok ||
    !data?.checkInToken ||
    !data?.scannedAt
  ) {
    return {
      ok: false,
      message:
        'Supabase tidak memberikan waktu scan yang valid.',
    }
  }

  return {
    ok: true,
    data,
  }
}
