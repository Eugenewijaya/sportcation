import { NextResponse } from "next/server"
import type { ZodError } from "zod"

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init)
}
export function apiError(code: string, message: string, status: number, details?: unknown) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  )
}

export function invalidRequest(error: ZodError) {
  return apiError(
    "VALIDATION_ERROR",
    "Periksa kembali data yang dikirim.",
    400,
    error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  )
}

export function internalError(error: unknown) {
  console.error(error)
  return apiError("INTERNAL_ERROR", "Terjadi kesalahan pada server.", 500)
}
