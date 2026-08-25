import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import GroupDetailActions from '../components/group-detail/GroupDetailActions'
import GroupDetailHeader from '../components/group-detail/GroupDetailHeader'
import GroupDetailProgress from '../components/group-detail/GroupDetailProgress'
import GroupDetailStats from '../components/group-detail/GroupDetailStats'
import ParticipantsTable from '../components/group-detail/ParticipantsTable'
import { useMasterData } from '../context/MasterDataContext'
import {
  computeGroupStats,
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
  const { masterGroups } = useMasterData()

  const group = masterGroups.find((item) => item.id === groupId)

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
              {formatTanggalKegiatan(group.tanggalKegiatan)}
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

        <GroupDetailActions />

        <ParticipantsTable
          group={group}
          stats={stats}
        />
      </div>
    </AdminLayout>
  )
}