import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import QrModal from '../components/QrModal'
import GroupDetailActions from '../components/group-detail/GroupDetailActions'
import GroupDetailHeader from '../components/group-detail/GroupDetailHeader'
import GroupDetailProgress from '../components/group-detail/GroupDetailProgress'
import GroupDetailStats from '../components/group-detail/GroupDetailStats'
import ParticipantFormModal from '../components/group-detail/ParticipantFormModal'
import ParticipantsTable from '../components/group-detail/ParticipantsTable'
import { useMasterData } from '../context/MasterDataContext'
import {
  computeGroupStats,
  createParticipant,
  formatTanggalKegiatan,
} from '../data/dummy'

function IconArrowLeft({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 18l-6-6 6-6"
      />
    </svg>
  )
}

function IconCalendar({ className }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 3v4m8-4v4M4 10h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
      />
    </svg>
  )
}

export default function GroupDetail() {
  const { groupId } = useParams()
  const navigate = useNavigate()

  const {
    masterGroups,
    addParticipant,
    updateParticipant,
    deleteParticipant,
  } = useMasterData()

  const [showParticipantModal, setShowParticipantModal] =
    useState(false)

  const [editingParticipant, setEditingParticipant] =
    useState(null)

  const [qrParticipant, setQrParticipant] =
    useState(null)

  const [deletingParticipant, setDeletingParticipant] =
    useState(null)

  const group = masterGroups.find(
    (item) => item.id === groupId,
  )

  if (!group) {
    return (
      <AdminLayout
        title="Detail Group"
        subtitle="Kelola peserta dan kehadiran group"
      >
        <div className="mx-auto max-w-[1480px]">
          <button
            type="button"
            onClick={() => navigate('/master-group')}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#013220] transition-colors hover:text-[#04694B]"
          >
            <IconArrowLeft className="h-4 w-4" />
            Kembali ke Master Group
          </button>

          <div className="rounded-3xl border border-[#e8eaed] bg-white p-10 text-center shadow-sm">
            <p className="text-sm text-muted">
              Group tidak ditemukan.
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const stats = computeGroupStats(group)

  const isSelesai =
    stats.total > 0 && stats.hadir === stats.total

  async function handleAddParticipant(formData) {
    const participant = createParticipant(
      group,
      formData,
      masterGroups,
    )

    return addParticipant(group.id, participant)
  }

  async function handleEditParticipant(formData) {
    if (!editingParticipant) {
      return {
        ok: false,
        message:
          'Data peserta yang akan diedit tidak ditemukan.',
      }
    }

    return updateParticipant(
      group.id,
      editingParticipant.id,
      formData,
    )
  }

  function handleViewAttendance(participant) {
    if (participant.kehadiran !== 'HADIR') return

    navigate('/review', {
      state: {
        mode: 'real',
        groupId: group.id,
        participantId: participant.id,
        readOnly: true,
        returnTo: `/group/${group.id}`,
        returnLabel: 'Kembali ke Detail Group',
      },
    })
  }

  async function handleDeleteParticipant() {
    if (!deletingParticipant) return

    const result = await deleteParticipant(
      group.id,
      deletingParticipant.id,
    )

    if (result?.ok === false) {
      window.alert(
        result.message ||
        'Peserta gagal dihapus. Silakan coba lagi.',
      )
      return
    }

    setDeletingParticipant(null)
  }

  return (
    <AdminLayout
      title="Detail Group"
      subtitle="Kelola peserta dan kehadiran group"
    >
      <div className="mx-auto max-w-[1480px] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/master-group')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#013220] transition-colors hover:text-[#04694B]"
          >
            <IconArrowLeft className="h-4 w-4" />
            Kembali ke Master Group
          </button>

          {group.tanggalKegiatan && (
            <div className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-[rgba(1,50,32,0.1)] bg-white px-4 text-sm font-medium text-[#0B2E26] shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
              <IconCalendar className="h-[18px] w-[18px] text-[#013220]" />

              {formatTanggalKegiatan(
                group.tanggalKegiatan,
              )}
            </div>
          )}
        </div>

        <GroupDetailHeader
          group={group}
          isSelesai={isSelesai}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <GroupDetailStats stats={stats} />
          <GroupDetailProgress stats={stats} />
        </div>

        <GroupDetailActions
          onAddParticipant={() =>
            setShowParticipantModal(true)
          }
        />

        <ParticipantsTable
          group={group}
          stats={stats}
          onEditParticipant={(participant) =>
            setEditingParticipant(participant)
          }
          onViewAttendance={handleViewAttendance}
          onDownloadQr={(participant) =>
            setQrParticipant(participant)
          }
          onDeleteParticipant={(participant) =>
            setDeletingParticipant(participant)
          }
        />
      </div>

      {showParticipantModal && (
        <ParticipantFormModal
          group={group}
          onSubmit={handleAddParticipant}
          onClose={() =>
            setShowParticipantModal(false)
          }
        />
      )}

      {editingParticipant && (
        <ParticipantFormModal
          group={group}
          participant={editingParticipant}
          onSubmit={handleEditParticipant}
          onClose={() =>
            setEditingParticipant(null)
          }
        />
      )}
      {qrParticipant && (
        <QrModal
          participant={qrParticipant}
          group={group}
          onClose={() =>
            setQrParticipant(null)
          }
        />
      )}
      {deletingParticipant && (
        <ConfirmModal
          title="Hapus Peserta?"
          message={`Peserta "${deletingParticipant.nama}" akan dihapus permanen.\n\nQR dan seluruh data kehadiran peserta ini juga ikut terhapus. Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus Peserta"
          cancelLabel="Batal"
          danger
          onConfirm={handleDeleteParticipant}
          onCancel={() =>
            setDeletingParticipant(null)
          }
        />
      )}
    </AdminLayout>
  )
}