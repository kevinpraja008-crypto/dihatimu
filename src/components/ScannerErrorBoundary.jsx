import { Component } from 'react'

export default class ScannerErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[DIHATIMU] Scanner crash:', error, info)
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-6 text-center">
            <p className="text-sm text-red-300">
              Kamera belum dapat diaktifkan. Periksa izin kamera atau refresh halaman.
            </p>
          </div>
        )
      )
    }
    return this.props.children
  }
}
