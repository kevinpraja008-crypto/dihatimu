import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import GroupDetailActions from '../components/group-detail/GroupDetailActions'
import GroupDetailHeader from '../components/group-detail/GroupDetailHeader'
import GroupDetailProgress from '../components/group-detail/GroupDetailProgress'
import GroupDetailStats from '../components/group-detail/GroupDetailStats'
import ParticipantsTable from '../components/group-detail/ParticipantsTable'
import { useMasterData } from '../context/MasterDataContext'
import { computeGroupStats } from '../data/dummy'

export default function GroupDetail() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { masterGroups } = useMasterData()

  const group = masterGroups.find((g) => g.id === groupId)

  if (!group) {
    return (
      <AdminLayout title="Detail Group" subtitle="Kelola peserta dan kehadiran group">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate('/master-group')}
            className="mb-6 flex items-center gap-1.5 text-sm font-semibold text-[#013220] transition-colors hover:text-[#014D2F]"
          >
            <span aria-hidden>‹</span>
            Kembali ke Master Group
          </button>
          <div className="rounded-3xl border border-[#e8eaed] bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-muted">Group tidak ditemukan.</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const stats = computeGroupStats(group)
  const isSelesai = stats.total > 0 && stats.hadir === stats.total

  return (
    <AdminLayout title="Detail Group" subtitle="Kelola peserta dan kehadiran group">
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/master-group')}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#013220] transition-colors hover:text-[#014D2F]"
        >
          <span aria-hidden>‹</span>
          Kembali ke Master Group
        </button>

        <GroupDetailHeader group={group} isSelesai={isSelesai} />
        <GroupDetailStats stats={stats} />
        <GroupDetailProgress stats={stats} />
        <GroupDetailActions />
        <ParticipantsTable group={group} stats={stats} />
      </div>
    </AdminLayout>
  )
}
