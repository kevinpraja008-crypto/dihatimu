export default function CreateGroupModal({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-slate-900">Buat Group Kunjungan</h2>
        <p className="mt-2 text-sm text-slate-500">
          Komponen sementara berhasil dipulihkan. Nanti kita rapikan lagi form aslinya.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white"
        >
          Tutup
        </button>
      </div>
    </div>
  )
}
