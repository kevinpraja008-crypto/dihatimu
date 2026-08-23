import { motion } from 'framer-motion'

export default function ParticipantsTable({ group, stats }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="admin-card overflow-hidden"
    >
      <div className="flex items-center justify-between border-b px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-[#013220]">
            Daftar Peserta
          </h2>

          <p className="text-sm text-slate-500">
            Total {stats.total} Peserta
          </p>
        </div>
      </div>

      {group.participants.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-500">
            Belum ada peserta pada group ini.
          </p>
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase">
                Nama
              </th>

              <th className="px-6 py-3 text-left text-xs font-bold uppercase">
                Role
              </th>

              <th className="px-6 py-3 text-left text-xs font-bold uppercase">
                Status
              </th>

              <th className="px-6 py-3 text-left text-xs font-bold uppercase">
                QR ID
              </th>
            </tr>
          </thead>

          <tbody>
            {group.participants.map((p) => (
              <tr
                key={p.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold">
                    {p.nama}
                  </p>

                  <p className="text-sm text-slate-500">
                    {p.jabatan}
                  </p>
                </td>

                <td className="px-6 py-4">
                  {p.role}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      p.kehadiran === 'HADIR'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {p.kehadiran}
                  </span>
                </td>

                <td className="px-6 py-4 font-mono text-xs">
                  {p.qrId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </motion.section>
  )
}
