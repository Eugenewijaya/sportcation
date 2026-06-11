export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = "DomainError"
  }
}

export function isConstraintError(error: unknown, constraint: "FOREIGN KEY" | "UNIQUE") {
  let current: unknown = error

  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (current instanceof Error && current.message.toUpperCase().includes(constraint)) {
      return true
    }
    current =
      typeof current === "object" && current !== null && "cause" in current
        ? (current as { cause?: unknown }).cause
        : undefined
  }

  return false
}
