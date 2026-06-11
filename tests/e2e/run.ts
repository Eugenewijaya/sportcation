import { spawn, spawnSync, type ChildProcess } from "node:child_process"
import path from "node:path"
import { prepareE2E } from "@/tests/e2e/setup"
import {
  e2eContextPath,
  e2eDatabasePath,
  toLibsqlFileUrl,
} from "@/tests/e2e/paths"
import { readFile } from "node:fs/promises"

type E2EContext = {
  authSecret: string
}

const baseURL = "http://127.0.0.1:3100"

async function main() {
  await prepareE2E()
  const e2eContext = JSON.parse(await readFile(e2eContextPath, "utf8")) as E2EContext
  const environment = {
    ...process.env,
    BETTER_AUTH_SECRET: e2eContext.authSecret,
    BETTER_AUTH_URL: baseURL,
    AUTH_TRUSTED_ORIGINS: baseURL,
    NEXT_PUBLIC_APP_URL: baseURL,
    TURSO_DATABASE_URL: toLibsqlFileUrl(e2eDatabasePath),
  }

  const server = spawn(
    process.execPath,
    [
      path.resolve("node_modules/next/dist/bin/next"),
      "dev",
      "--hostname",
      "127.0.0.1",
      "-p",
      "3100",
    ],
    {
      cwd: process.cwd(),
      env: environment,
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
    },
  )

  const serverOutput: string[] = []
  server.stdout?.on("data", (chunk) => serverOutput.push(String(chunk)))
  server.stderr?.on("data", (chunk) => serverOutput.push(String(chunk)))

  try {
    await waitForServer(server)
    const playwright = spawn(
      process.execPath,
      [path.resolve("node_modules/@playwright/test/cli.js"), "test"],
      {
        cwd: process.cwd(),
        env: {
          ...environment,
          E2E_EXTERNAL_SERVER: "1",
        },
        stdio: "inherit",
      },
    )
    const exitCode = await waitForExit(playwright)
    return exitCode ?? 1
  } finally {
    await stopProcess(server)
  }

  async function waitForServer(processHandle: ChildProcess) {
    const deadline = Date.now() + 120_000
    while (Date.now() < deadline) {
      if (processHandle.exitCode !== null) {
        throw new Error(`E2E server exited early.\n${serverOutput.join("").slice(-4000)}`)
      }

      try {
        const [appResponse, authResponse] = await Promise.all([
          fetch(baseURL, { redirect: "manual" }),
          fetch(`${baseURL}/api/auth/get-session`, { redirect: "manual" }),
        ])
        if (appResponse.status < 500 && authResponse.status < 500) return
      } catch {
        // Server is still starting.
      }
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
    throw new Error(`Timed out waiting for E2E server.\n${serverOutput.join("").slice(-4000)}`)
  }
}

function waitForExit(processHandle: ChildProcess) {
  return new Promise<number | null>((resolve, reject) => {
    processHandle.once("error", reject)
    processHandle.once("exit", (code) => resolve(code))
  })
}

async function stopProcess(processHandle: ChildProcess) {
  if (processHandle.exitCode !== null) return

  if (process.platform === "win32" && processHandle.pid) {
    spawnSync("taskkill", ["/PID", String(processHandle.pid), "/T", "/F"], {
      stdio: "ignore",
    })
    return
  }

  if (processHandle.pid) {
    process.kill(-processHandle.pid, "SIGTERM")
  }
  await Promise.race([waitForExit(processHandle), delay(5_000)])
  if (processHandle.exitCode === null && processHandle.pid) {
    process.kill(-processHandle.pid, "SIGKILL")
  }
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

main()
  .then((exitCode) => {
    if (exitCode === 0) console.log("Sportcation E2E suite completed.")
    process.exit(exitCode)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
