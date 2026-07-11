import { auth } from "./packages/shared-lib/auth"

async function createAdmin() {
  console.log("Creating super admin user...")
  
  try {
    const response = await auth.api.signUpEmail({
      body: {
        email: "superadmin@sportcation.local",
        password: "sportcation2026",
        name: "Super Admin",
      }
    })

    if (response.user) {
      console.log("Admin user created successfully!")
      console.log("Email: superadmin@sportcation.local")
      console.log("Password: sportcation2026")
      
      // Update role to admin using the DB
      const { getDb } = await import("./packages/shared-lib/db")
      const { users } = await import("./packages/shared-lib/db/schema")
      const { eq } = await import("drizzle-orm")
      
      const db = getDb()
      await db.update(users).set({ role: "admin" }).where(eq(users.id, response.user.id))
      console.log("User role updated to 'admin'")
    } else {
      console.log("Failed to create admin:", response)
    }
  } catch (error) {
    console.error("Error creating admin:")
    console.error(error)
  }
}

createAdmin()
