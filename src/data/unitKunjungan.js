export const akdOptions = [
    {
      value: 'PIMPINAN DPRD',
      label: 'Pimpinan DPRD',
      shortLabel: 'PIMPINAN',
    },
    {
      value: 'KOMISI I',
      label: 'Komisi I',
      shortLabel: 'KOMISI I',
    },
    {
      value: 'KOMISI II',
      label: 'Komisi II',
      shortLabel: 'KOMISI II',
    },
    {
      value: 'KOMISI III',
      label: 'Komisi III',
      shortLabel: 'KOMISI III',
    },
    {
      value: 'KOMISI IV',
      label: 'Komisi IV',
      shortLabel: 'KOMISI IV',
    },
    {
      value: 'KOMISI V',
      label: 'Komisi V',
      shortLabel: 'KOMISI V',
    },
    {
      value: 'BADAN ANGGARAN',
      label: 'Badan Anggaran',
      shortLabel: 'BANGGAR',
    },
    {
      value: 'BADAN MUSYAWARAH',
      label: 'Badan Musyawarah',
      shortLabel: 'BANMUS',
    },
    {
      value: 'BADAN PEMBENTUKAN PERATURAN DAERAH',
      label: 'Badan Pembentukan Peraturan Daerah',
      shortLabel: 'BAPEMPERDA',
    },
    {
      value: 'BADAN KEHORMATAN',
      label: 'Badan Kehormatan',
      shortLabel: 'BK',
    },
    {
      value: 'PANITIA KHUSUS',
      label: 'Panitia Khusus',
      shortLabel: 'PANSUS',
    },
    {
      value: 'GABUNGAN AKD',
      label: 'Gabungan AKD',
      shortLabel: 'GABUNGAN AKD',
    },
  ]
  
  export const bagianOptions = [
    {
      value: 'BAGIAN UMUM',
      label: 'Bagian Umum',
      shortLabel: 'BAGIAN UMUM',
    },
    {
      value: 'BAGIAN PERSIDANGAN DAN PERUNDANG-UNDANGAN',
      label: 'Bagian Persidangan dan Perundang-undangan',
      shortLabel: 'PERSIDANGAN & PUU',
    },
    {
      value: 'BAGIAN PROGRAM DAN KEUANGAN',
      label: 'Bagian Program dan Keuangan',
      shortLabel: 'PROGRAM & KEUANGAN',
    },
    {
      value: 'BAGIAN FASILITASI PENGANGGARAN DAN PENGAWASAN',
      label: 'Bagian Fasilitasi Penganggaran dan Pengawasan',
      shortLabel: 'FASILITASI P&P',
    },
    {
      value: 'GABUNGAN BAGIAN',
      label: 'Gabungan Bagian',
      shortLabel: 'GABUNGAN BAGIAN',
    },
  ]
  
  export function getUnitOptions(instansi) {
    if (instansi === 'DPRD') return akdOptions
    if (instansi === 'SEKRETARIAT') return bagianOptions
  
    return []
  }
  
  export function getUnitLabel(instansi, value) {
    if (!value) return ''
  
    const option = getUnitOptions(instansi).find(
      (item) => item.value === value,
    )
  
    return option?.label || value
  }
  
  export function getUnitShortLabel(instansi, value) {
    if (!value) return ''
  
    const option = getUnitOptions(instansi).find(
      (item) => item.value === value,
    )
  
    return option?.shortLabel || value
  }