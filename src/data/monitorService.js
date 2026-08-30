import { supabase } from '../lib/supabase'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi.')
  }

  return supabase
}

export function isValidMonitorToken(value) {
  return UUID_PATTERN.test(String(value || '').trim())
}

function normalizeParticipant(value) {
  return {
    nama:
      typeof value?.nama === 'string'
        ? value.nama
        : '',
    jabatan:
      typeof value?.jabatan === 'string'
        ? value.jabatan
        : '',
    kehadiran:
      value?.kehadiran === 'HADIR'
        ? 'HADIR'
        : 'BELUM HADIR',
  }
}

function normalizePublicMonitor(value) {
  if (!value || typeof value !== 'object') {
    return null
  }

  return {
    name:
      typeof value.name === 'string'
        ? value.name
        : '',
    participants: Array.isArray(value.participants)
      ? value.participants.map(normalizeParticipant)
      : [],
  }
}

export async function getGroupMonitorToken(
  masterGroupId,
) {
  const client = requireSupabase()

  const { data, error } = await client.rpc(
    'get_group_monitor_token',
    {
      p_master_group_id: masterGroupId,
    },
  )

  if (error) {
    throw error
  }

  if (!isValidMonitorToken(data)) {
    throw new Error('Token QR Monitor tidak valid.')
  }

  return data
}

export async function fetchPublicGroupMonitor(
  monitorToken,
) {
  if (!isValidMonitorToken(monitorToken)) {
    return null
  }

  const client = requireSupabase()

  const { data, error } = await client.rpc(
    'get_public_group_monitor',
    {
      p_monitor_token: monitorToken,
    },
  )

  if (error) {
    throw error
  }

  return normalizePublicMonitor(data)
}

export function subscribeToPublicGroupMonitor(
  monitorToken,
  {
    onChange,
    onStatus,
  } = {},
) {
  if (
    !supabase
    || !isValidMonitorToken(monitorToken)
  ) {
    return () => {}
  }

  const channel = supabase
    .channel(
      `monitor:${monitorToken}`,
      {
        config: {
          private: true,
          broadcast: {
            ack: false,
            self: false,
          },
        },
      },
    )
    .on(
      'broadcast',
      {
        event: 'monitor_changed',
      },
      ({ payload }) => {
        onChange?.(payload)
      },
    )
    .subscribe((status) => {
      onStatus?.(status)
    })

  return () => {
    void supabase.removeChannel(channel)
  }
}