import path from "node:path"

export const e2eDirectory = path.resolve(".tmp")
export const e2eDatabasePath = path.join(e2eDirectory, "e2e.db")
export const e2eContextPath = path.join(e2eDirectory, "e2e-context.json")

export function toLibsqlFileUrl(filePath: string) {
  return `file:${filePath.replaceAll("\\", "/")}`
}
