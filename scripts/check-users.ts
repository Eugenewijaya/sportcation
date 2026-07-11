import { createClient } from "@libsql/client"

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function main() {
  const rs = await client.execute("SELECT id, email, role FROM users")
  console.log("Users in DB:")
  console.dir(rs.rows, { depth: null })
  
  if (rs.rows.length > 0) {
    console.log(`\nUpdating all users to admin...`)
    await client.execute({
      sql: "UPDATE users SET role = 'admin'",
      args: []
    })
    console.log("Updated role to admin for all users!")
  } else {
    console.log("No users found. Please sign up in the UI first.")
  }
}

main().catch(console.error)
