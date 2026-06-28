import { motion } from 'framer-motion'

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Ya',
  cancelLabel = 'Batal',
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Tutup"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#e8eaed] bg-white p-6 shadow-xl"
      >
        <h3 className="text-lg font-bold text-[#013220]">{title}</h3>
        <div className="mt-3 whitespace-pre-line text-sm text-gray-700">{message}</div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#e8eaed] py-2.5 text-sm font-semibold text-gray-700 hover:bg-soft-gray"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gradient-to-b from-[#014D2F] to-[#013220]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
