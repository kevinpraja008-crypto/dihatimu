import { jsPDF } from 'jspdf'
import logoDprd from '../assets/logo-dprd.png'
import logoDihatimu from '../assets/logo-dihatimu.png'
import { computeGroupStats, formatTanggalKegiatan } from './dummy'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d').drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = src
  })
}

function safeFilename(name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-')
}

function drawStatBox(doc, x, y, w, h, label, value) {
  doc.setDrawColor(1, 50, 32)
  doc.setLineWidth(0.3)
  doc.setFillColor(245, 247, 249)
  doc.roundedRect(x, y, w, h, 2, 2, 'FD')
  doc.setDrawColor(212, 175, 55)
  doc.setLineWidth(0.8)
  doc.line(x + 2, y + 2, x + w - 2, y + 2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text(label, x + 4, y + 10)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(1, 50, 32)
  doc.text(String(value), x + 4, y + 20)
}

export async function downloadGroupPdf(group) {
  const stats = computeGroupStats(group)
  const [dprdB64, dihatimuB64] = await Promise.all([
    loadImage(logoDprd),
    loadImage(logoDihatimu),
  ])

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  let y = 16

  doc.addImage(dprdB64, 'PNG', margin, y - 4, 24, 24)
  doc.addImage(dihatimuB64, 'PNG', pageW - margin - 30, y - 6, 30, 30)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(1, 50, 32)
  doc.text('LAPORAN KEHADIRAN TAMU', pageW / 2, y + 2, { align: 'center' })
  y += 10

  doc.setFontSize(11)
  doc.text('DIHATIMU — Digitalisasi Kehadiran Tamu DPRD', pageW / 2, y, { align: 'center' })
  y += 12

  doc.setFontSize(13)
  doc.text(group.name, pageW / 2, y, { align: 'center' })
  y += 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  doc.text(`Tanggal Kegiatan: ${formatTanggalKegiatan(group.tanggalKegiatan)}`, pageW / 2, y, {
    align: 'center',
  })
  y += 12

  const boxW = (pageW - margin * 2 - 8) / 3
  drawStatBox(doc, margin, y, boxW, 24, 'Total Peserta', stats.total)
  drawStatBox(doc, margin + boxW + 4, y, boxW, 24, 'Hadir', stats.hadir)
  drawStatBox(doc, margin + (boxW + 4) * 2, y, boxW, 24, 'Belum Hadir', stats.belum)
  y += 32

  doc.setDrawColor(212, 175, 55)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(1, 50, 32)
  doc.text('DATA PESERTA', margin, y)
  y += 8

  for (let i = 0; i < group.participants.length; i++) {
    const p = group.participants[i]

    if (y > 248) {
      doc.addPage()
      y = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(11, 46, 38)
    doc.text(`${i + 1}. ${p.nama}`, margin, y)
    y += 6

    if (p.foto) {
      try {
        doc.addImage(p.foto, 'JPEG', margin, y, 26, 26)
      } catch {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(8)
        doc.text('[Foto tidak tersedia]', margin, y + 4)
      }
    } else {
      doc.setDrawColor(230, 234, 237)
      doc.setFillColor(245, 247, 249)
      doc.roundedRect(margin, y, 26, 26, 13, 13, 'FD')
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text('No foto', margin + 5, y + 16)
    }

    const textX = margin + 32
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(50, 50, 50)
    doc.text(`Jabatan: ${p.jabatan}`, textX, y + 4)
    doc.text(`Role: ${p.role}`, textX, y + 10)
    doc.text(`Status: ${p.kehadiran}`, textX, y + 16)
    doc.text(`Jam Hadir: ${p.jamHadir || '-'}`, textX, y + 22)

    y += 34
    doc.setDrawColor(240, 242, 245)
    doc.line(margin, y, pageW - margin, y)
    y += 6
  }

  const printDate = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  doc.setDrawColor(212, 175, 55)
  doc.line(margin, pageH - 18, pageW - margin, pageH - 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('Dicetak oleh Sistem DIHATIMU', margin, pageH - 12)
  doc.text(`Tanggal Cetak: ${printDate}`, pageW / 2, pageH - 12, { align: 'center' })
  doc.text('Version 1.0.0', pageW - margin, pageH - 12, { align: 'right' })

  doc.save(`Laporan-${safeFilename(group.name)}.pdf`)
}
