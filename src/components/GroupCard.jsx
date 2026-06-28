export default function GroupCard({ group }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        {group?.status || 'Aktif'}
      </p>
      <h3 className="mt-2 text-lg font-bold text-slate-900">
        {group?.nama || group?.name || group?.judul || 'Group Kunjungan'}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {group?.instansi || group?.asalInstansi || group?.tanggal || '-'}
      </p>
    </div>
  )
}
