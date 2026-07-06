"use client"

import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="id">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
          <div className="rounded-full bg-red-100 p-4 mb-4 text-red-600">
            <AlertTriangle size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Terjadi Kesalahan</h1>
          <h2 className="text-lg font-medium text-gray-700 mb-4">Sistem mengalami gangguan teknis</h2>
          <p className="text-gray-500 max-w-md mb-8">
            Maaf, kami tidak dapat memproses permintaan Anda saat ini. Kami telah mencatat kendala ini dan akan segera memperbaikinya.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  )
}
