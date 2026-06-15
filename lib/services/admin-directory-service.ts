import { desc, eq } from "drizzle-orm"
import type {
  AdminMerchantStatus,
  AdminUserReview,
  AdminVenueModeration,
  AdminVenueStatus,
} from "@/lib/admin-directory/types"
import type { SportcationDbExecutor } from "@/lib/db"
import {
  bookings,
  courts,
  merchantMembers,
  merchantProfiles,
  notifications,
  slots,
  sportCategories,
  userProfiles,
  users,
  venues,
} from "@/lib/db/schema"
import { DomainError } from "@/lib/domain/errors"
import type { AdminUserQuery, AdminVenueModerationQuery } from "@/lib/validation/admin-directory"

const defaultVenueImage = "/padel-court-modern.jpg"

export async function listAdminUsers(
  db: SportcationDbExecutor,
  filters: AdminUserQuery = { q: "", role: "", status: "" },
): Promise<AdminUserReview[]> {
  const [userRows, memberships, ownedMerchants, bookingRows, notificationRows] = await Promise.all([
    selectAdminUserRows(db).orderBy(desc(users.createdAt)),
    selectMerchantMembershipRows(db),
    selectOwnedMerchantRows(db),
    db.select({ userId: bookings.userId, status: bookings.status, totalAmount: bookings.totalAmount }).from(bookings),
    db.select({ userId: notifications.userId }).from(notifications),
  ])

  const query = filters.q.trim().toLowerCase()
  const membershipsByUser = groupBy(memberships, (membership) => membership.userId)
  const ownedMerchantByUser = new Map(ownedMerchants.map((merchant) => [merchant.ownerUserId, merchant]))
  const bookingsByUser = groupBy(bookingRows, (booking) => booking.userId)
  const notificationsByUser = groupBy(notificationRows, (notification) => notification.userId)

  return userRows
    .map((row): AdminUserReview => {
      const userMemberships = membershipsByUser.get(row.id) ?? []
      const ownedMerchant = ownedMerchantByUser.get(row.id) ?? null
      const userBookings = bookingsByUser.get(row.id) ?? []
      const userNotifications = notificationsByUser.get(row.id) ?? []
      const review = getUserReview(row, userMemberships, ownedMerchant)

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        image: row.image,
        role: row.role,
        status: row.status,
        emailVerified: row.emailVerified,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        profile: {
          fullName: row.profileFullName,
          avatarUrl: row.profileAvatarUrl,
          city: row.profileCity,
        },
        merchantMemberships: userMemberships.map((membership) => ({
          merchantId: membership.merchantId,
          businessName: membership.businessName,
          merchantStatus: membership.merchantStatus,
          role: membership.role,
        })),
        ownedMerchant: ownedMerchant
          ? {
              id: ownedMerchant.id,
              businessName: ownedMerchant.businessName,
              legalName: ownedMerchant.legalName,
              status: ownedMerchant.status,
            }
          : null,
        stats: {
          bookingCount: userBookings.length,
          activeBookings: userBookings.filter((booking) => ["pending_payment", "confirmed", "checked_in"].includes(booking.status)).length,
          totalSpend: userBookings.reduce((total, booking) => total + booking.totalAmount, 0),
          notificationCount: userNotifications.length,
        },
        review,
      }
    })
    .filter((user) => !filters.role || user.role === filters.role)
    .filter((user) => !filters.status || user.status === filters.status)
    .filter((user) => {
      if (!query) return true
      return [
        user.id,
        user.name,
        user.email,
        user.phone,
        user.role,
        user.status,
        user.profile.fullName,
        user.profile.city,
        user.ownedMerchant?.businessName,
        ...user.merchantMemberships.map((membership) => membership.businessName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
}

export async function getAdminUser(db: SportcationDbExecutor, userId: string): Promise<AdminUserReview> {
  const user = (await listAdminUsers(db)).find((item) => item.id === userId)
  if (!user) throw new DomainError("USER_NOT_FOUND", "User tidak ditemukan.", 404)
  return user
}

export async function listAdminVenues(
  db: SportcationDbExecutor,
  filters: AdminVenueModerationQuery = { q: "", status: "", merchantStatus: "" },
): Promise<AdminVenueModeration[]> {
  const [venueRows, courtRows, slotRows, bookingRows] = await Promise.all([
    selectAdminVenueRows(db).orderBy(desc(venues.updatedAt)),
    db.select({ venueId: courts.venueId }).from(courts),
    db.select({ venueId: slots.venueId, status: slots.status }).from(slots),
    db.select({ venueId: bookings.venueId, totalAmount: bookings.totalAmount }).from(bookings),
  ])

  const query = filters.q.trim().toLowerCase()
  const courtsByVenue = groupBy(courtRows, (court) => court.venueId)
  const slotsByVenue = groupBy(slotRows, (slot) => slot.venueId)
  const bookingsByVenue = groupBy(bookingRows, (booking) => booking.venueId)

  return venueRows
    .map((row): AdminVenueModeration => {
      const venueCourts = courtsByVenue.get(row.id) ?? []
      const venueSlots = slotsByVenue.get(row.id) ?? []
      const venueBookings = bookingsByVenue.get(row.id) ?? []
      const review = getVenueReview(row.status, row.merchantStatus, venueCourts.length)

      return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        address: row.address,
        city: row.city,
        area: row.area,
        priceFrom: row.priceFrom,
        rating: row.rating,
        reviewCount: row.reviewCount,
        image: row.imageUrl ?? defaultVenueImage,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        category: {
          id: row.categoryId,
          name: row.categoryName,
          slug: row.categorySlug,
        },
        merchant: {
          id: row.merchantId,
          businessName: row.merchantBusinessName,
          legalName: row.merchantLegalName,
          status: row.merchantStatus,
          owner: {
            id: row.ownerId,
            name: row.ownerName,
            email: row.ownerEmail,
          },
        },
        stats: {
          courtCount: venueCourts.length,
          slotCount: venueSlots.length,
          availableSlots: venueSlots.filter((slot) => slot.status === "available").length,
          bookedSlots: venueSlots.filter((slot) => slot.status === "booked").length,
          bookingCount: venueBookings.length,
          totalGmv: venueBookings.reduce((total, booking) => total + booking.totalAmount, 0),
        },
        review,
      }
    })
    .filter((venue) => !filters.status || venue.status === filters.status)
    .filter((venue) => !filters.merchantStatus || venue.merchant.status === filters.merchantStatus)
    .filter((venue) => {
      if (!query) return true
      return [
        venue.id,
        venue.name,
        venue.slug,
        venue.description,
        venue.address,
        venue.city,
        venue.area,
        venue.status,
        venue.category.name,
        venue.merchant.businessName,
        venue.merchant.owner.name,
        venue.merchant.owner.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
}

export async function getAdminVenue(db: SportcationDbExecutor, venueId: string): Promise<AdminVenueModeration> {
  const venue = (await listAdminVenues(db)).find((item) => item.id === venueId)
  if (!venue) throw new DomainError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)
  return venue
}

function selectAdminUserRows(db: SportcationDbExecutor) {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      image: users.image,
      role: users.role,
      status: users.status,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      profileFullName: userProfiles.fullName,
      profileAvatarUrl: userProfiles.avatarUrl,
      profileCity: userProfiles.city,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
}

function selectMerchantMembershipRows(db: SportcationDbExecutor) {
  return db
    .select({
      userId: merchantMembers.userId,
      merchantId: merchantMembers.merchantId,
      role: merchantMembers.role,
      businessName: merchantProfiles.businessName,
      merchantStatus: merchantProfiles.status,
    })
    .from(merchantMembers)
    .innerJoin(merchantProfiles, eq(merchantMembers.merchantId, merchantProfiles.id))
}

function selectOwnedMerchantRows(db: SportcationDbExecutor) {
  return db
    .select({
      id: merchantProfiles.id,
      ownerUserId: merchantProfiles.ownerUserId,
      businessName: merchantProfiles.businessName,
      legalName: merchantProfiles.legalName,
      status: merchantProfiles.status,
    })
    .from(merchantProfiles)
}

function selectAdminVenueRows(db: SportcationDbExecutor) {
  return db
    .select({
      id: venues.id,
      name: venues.name,
      slug: venues.slug,
      description: venues.description,
      address: venues.address,
      city: venues.city,
      area: venues.area,
      priceFrom: venues.priceFrom,
      rating: venues.rating,
      reviewCount: venues.reviewCount,
      imageUrl: venues.imageUrl,
      status: venues.status,
      createdAt: venues.createdAt,
      updatedAt: venues.updatedAt,
      categoryId: sportCategories.id,
      categoryName: sportCategories.name,
      categorySlug: sportCategories.slug,
      merchantId: merchantProfiles.id,
      merchantBusinessName: merchantProfiles.businessName,
      merchantLegalName: merchantProfiles.legalName,
      merchantStatus: merchantProfiles.status,
      ownerId: users.id,
      ownerName: users.name,
      ownerEmail: users.email,
    })
    .from(venues)
    .innerJoin(sportCategories, eq(venues.categoryId, sportCategories.id))
    .innerJoin(merchantProfiles, eq(venues.merchantId, merchantProfiles.id))
    .innerJoin(users, eq(merchantProfiles.ownerUserId, users.id))
}

function getUserReview(
  user: {
    role: AdminUserReview["role"]
    status: AdminUserReview["status"]
    emailVerified: boolean
  },
  memberships: Array<{ merchantStatus: AdminMerchantStatus }>,
  ownedMerchant: { status: AdminMerchantStatus } | null,
) {
  if (user.status !== "active") {
    return { needsAttention: true, reason: `Account status is ${user.status}.` }
  }
  if (!user.emailVerified) {
    return { needsAttention: true, reason: "Email has not been verified." }
  }
  if (user.role === "merchant_owner" && !ownedMerchant) {
    return { needsAttention: true, reason: "Merchant owner has no owned merchant profile." }
  }
  if (ownedMerchant && ownedMerchant.status !== "verified") {
    return { needsAttention: true, reason: `Owned merchant status is ${ownedMerchant.status}.` }
  }
  const flaggedMembership = memberships.find((membership) => membership.merchantStatus !== "verified")
  if (flaggedMembership) {
    return { needsAttention: true, reason: `Merchant membership status is ${flaggedMembership.merchantStatus}.` }
  }
  return { needsAttention: false, reason: "User identity and merchant links are operationally healthy." }
}

function getVenueReview(status: AdminVenueStatus, merchantStatus: AdminMerchantStatus, courtCount: number) {
  if (merchantStatus !== "verified") {
    return { needsAttention: true, reason: `Merchant status is ${merchantStatus}.` }
  }
  if (status !== "published") {
    return { needsAttention: true, reason: `Venue status is ${status}.` }
  }
  if (courtCount === 0) {
    return { needsAttention: true, reason: "Venue has no courts configured." }
  }
  return { needsAttention: false, reason: "Venue ownership, moderation, and court inventory are healthy." }
}

function groupBy<T, K>(items: T[], getKey: (item: T) => K): Map<K, T[]> {
  return items.reduce((groups, item) => {
    const key = getKey(item)
    const next = groups.get(key)
    if (next) {
      next.push(item)
    } else {
      groups.set(key, [item])
    }
    return groups
  }, new Map<K, T[]>())
}
