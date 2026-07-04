import QRCode from 'qrcode'
import logoSekretariat from "../assets/logo-sekretariat-dprd.png";
import logoDihatimu from '../assets/logo-dihatimu.png'
import gedungDprd from '../assets/logo-gedung-line-art.png'

const CARD_WIDTH = 420
const CARD_HEIGHT = 680

const QR_OPTIONS = {
  margin: 1,
  errorCorrectionLevel: 'M',
  color: {
    dark: '#013220',
    light: '#FFFFFF',
  },
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }

  if (current) lines.push(current)
  return lines
}

function drawContainedImage(ctx, img, x, y, maxW, maxH) {
  const ratio = Math.min(maxW / img.width, maxH / img.height)
  const w = img.width * ratio
  const h = img.height * ratio
  ctx.drawImage(img, x + (maxW - w) / 2, y + (maxH - h) / 2, w, h)
}

export function buildMonitorUrl(groupId) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/monitor/group/${groupId}`
  }
  return `/monitor/group/${groupId}`
}

export function buildQrFilename(nama) {
  const slug = nama
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  return `QR-${slug || 'PESERTA'}.png`
}

function drawBadge(ctx, text, x, y, w) {
  ctx.fillStyle = 'rgba(1, 50, 32, 0.06)'
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)'
  ctx.lineWidth = 1
  const h = 18
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, 4)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#013220'
  ctx.font = 'bold 7px "Segoe UI", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(text, x + w / 2, y + 12)
}

export async function generatePremiumQrCard({ participant, group }) {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#F5F7F9'
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)'
  ctx.lineWidth = 2
  ctx.strokeRect(12, 12, CARD_WIDTH - 24, CARD_HEIGHT - 24)

  ctx.strokeStyle = 'rgba(1, 50, 32, 0.08)'
  ctx.lineWidth = 1
  ctx.strokeRect(18, 18, CARD_WIDTH - 36, CARD_HEIGHT - 36)

  const [imgDprd, imgDihatimu, imgGedung] = await Promise.all([
    loadImage(logoDprd),
    loadImage(logoDihatimu),
    loadImage(gedungDprd),
  ])

  ctx.save()
  ctx.globalAlpha = 0.035
  const gw = CARD_WIDTH * 0.92
  const gh = gw * (imgGedung.height / imgGedung.width)
  ctx.drawImage(imgGedung, (CARD_WIDTH - gw) / 2, 180, gw, gh)
  ctx.restore()

  drawContainedImage(ctx, imgDprd, 28, 28, 68, 52)
  drawContainedImage(ctx, imgDihatimu, CARD_WIDTH - 96, 24, 76, 56)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#013220'
  ctx.font = 'bold 9px "Segoe UI", system-ui, sans-serif'
  ctx.fillText('DIGITAL ATTENDANCE PASS', CARD_WIDTH / 2, 98)

  ctx.font = 'bold 18px "Segoe UI", system-ui, sans-serif'
  ctx.fillText('DIHATIMU', CARD_WIDTH / 2, 122)

  ctx.font = '10px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#2a4a3a'
  ctx.fillText('Sekretariat DPRD Kabupaten Subang', CARD_WIDTH / 2, 138)

  const badgeW = 108
  const badgeGap = 6
  const badges = ['VERIFIED', 'SECURE QR', 'DIGITAL ATTENDANCE']
  const totalBadgeW = badges.length * badgeW + (badges.length - 1) * badgeGap
  let badgeX = (CARD_WIDTH - totalBadgeW) / 2
  badges.forEach((label) => {
    drawBadge(ctx, label, badgeX, 148, badgeW)
    badgeX += badgeW + badgeGap
  })

  const qrSize = 260
  const qrX = (CARD_WIDTH - qrSize) / 2
  const qrY = 178

  ctx.fillStyle = '#FFFFFF'
  ctx.shadowColor = 'rgba(0,0,0,0.08)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 4
  ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24)
  ctx.shadowColor = 'transparent'

  const qrDataUrl = await QRCode.toDataURL(participant.qrId, {
    ...QR_OPTIONS,
    width: qrSize,
  })
  const qrImg = await loadImage(qrDataUrl)
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

  const infoY = qrY + qrSize + 36

  ctx.textAlign = 'center'
  ctx.fillStyle = '#013220'
  ctx.font = 'bold 16px "Segoe UI", system-ui, sans-serif'
  const nameLines = wrapText(ctx, participant.nama.toUpperCase(), CARD_WIDTH - 56)
  nameLines.slice(0, 2).forEach((line, i) => {
    ctx.fillText(line, CARD_WIDTH / 2, infoY + i * 20)
  })

  const jabatanOffset = nameLines.length > 1 ? 42 : 26
  ctx.font = '12px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#2a4a3a'
  ctx.fillText(participant.jabatan, CARD_WIDTH / 2, infoY + jabatanOffset)

  const metaY = infoY + jabatanOffset + 28
  ctx.textAlign = 'left'
  ctx.font = '8px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(11, 46, 38, 0.55)'
  ctx.fillText('ID PESERTA', 36, metaY)
  ctx.fillText('ID GROUP', 36, metaY + 28)
  ctx.fillText('STATUS', 36, metaY + 56)

  ctx.font = 'bold 9px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = '#013220'
  ctx.fillText(participant.qrId, 36, metaY + 12)
  ctx.fillText(group.groupId, 36, metaY + 40)

  ctx.fillStyle = 'rgba(1, 50, 32, 0.08)'
  ctx.beginPath()
  ctx.roundRect(36, metaY + 48, 72, 18, 9)
  ctx.fill()
  ctx.fillStyle = '#047857'
  ctx.font = 'bold 8px "Segoe UI", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('AKTIF', 72, metaY + 60)

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(36, CARD_HEIGHT - 44)
  ctx.lineTo(CARD_WIDTH - 36, CARD_HEIGHT - 44)
  ctx.stroke()

  ctx.textAlign = 'center'
  ctx.font = '8px "Segoe UI", system-ui, sans-serif'
  ctx.fillStyle = 'rgba(11, 46, 38, 0.45)'
  ctx.fillText('QR CODE KEHADIRAN TAMU — DIHATIMU v1.0.0', CARD_WIDTH / 2, CARD_HEIGHT - 28)

  return canvas.toDataURL('image/png')
}

export async function generateQrDataUrl(participant, group) {
  return generatePremiumQrCard({ participant, group })
}

export async function downloadQrPng(participant, group, filename) {
  const dataUrl = await generatePremiumQrCard({ participant, group })
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename || buildQrFilename(participant.nama)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export async function downloadAllGroupQrs(group, onProgress) {
  if (!group.participants.length) return { downloaded: 0, total: 0 }

  let downloaded = 0
  for (const participant of group.participants) {
    await downloadQrPng(participant, group, buildQrFilename(participant.nama))
    downloaded += 1
    onProgress?.(downloaded, group.participants.length)
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  return { downloaded, total: group.participants.length }
}
