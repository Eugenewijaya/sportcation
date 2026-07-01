import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="rounded-full bg-red-100 p-4 mb-4 text-red-600">
        <AlertCircle size={48} strokeWidth={1.5} />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Halaman Tidak Ditemukan</h2>
      <p className="text-gray-500 max-w-md mb-8">
        Maaf, halaman yang Anda tuju mungkin telah dihapus, namanya diubah, atau tidak pernah ada.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
