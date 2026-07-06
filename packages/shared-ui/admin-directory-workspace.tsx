"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  Database,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"
import type {
  AdminUserReview,
  AdminUserRole,
  AdminUserStatus,
  AdminVenueModeration,
  AdminVenueStatus,
} from "@/lib/admin-directory/types"

type Notice = { tone: "success" | "error"; message: string } | null
type UserTab = "all" | AdminUserRole
type VenueTab = "all" | AdminVenueStatus

const userTabs: Array<{ id: UserTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "customer", label: "Customers" },
  { id: "merchant_owner", label: "Owners" },
  { id: "merchant_staff", label: "Staff" },
  { id: "admin", label: "Admins" },
]

const venueTabs: Array<{ id: VenueTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "review", label: "Review" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
  { id: "rejected", label: "Rejected" },
  { id: "archived", label: "Archived" },
]

async function apiRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`)
    throw new Error("Session berakhir. Silakan login kembali.")
  }
  const payload = await response.json()
  if (!response.ok) {
    const details = payload.error?.details as Array<{ message?: string }> | undefined
    throw new Error(details?.[0]?.message || payload.error?.message || "Request gagal diproses.")
  }
  return payload.data as T
}

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)
}

function ratingLabel(value: number) {
  return (value / 100).toFixed(1)
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function AdminUserDirectoryWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [users, setUsers] = useState<AdminUserReview[]>([])
  const [selected, setSelected] = useState<AdminUserReview | null>(null)
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<UserTab>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | AdminUserStatus>("all")
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setNotice(null)
    try {
      const data = await apiRequest<AdminUserReview[]>("/api/admin/users")
      setUsers(data)
      setSelected((current) => (current ? data.find((user) => user.id === current.id) ?? null : current))
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data user admin gagal dimuat." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    apiRequest<AdminUserReview[]>("/api/admin/users")
      .then((data) => {
        if (active) setUsers(data)
      })
      .catch((error: unknown) => {
        if (active) setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data user admin gagal dimuat." })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return users
      .filter((item) => tab === "all" || item.role === tab)
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .filter((item) => {
        if (!value) return true
        return [
          item.id,
          item.name,
          item.email,
          item.phone,
          item.role,
          item.status,
          item.profile.fullName,
          item.profile.city,
          item.ownedMerchant?.businessName,
          ...item.merchantMemberships.map((membership) => membership.businessName),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value)
      })
  }, [query, statusFilter, tab, users])

  const stats = useMemo(() => {
    return [
      { label: "Platform users", value: String(users.length), helper: "Persisted auth users" },
      { label: "Customers", value: String(users.filter((user) => user.role === "customer").length), helper: "Booking-side accounts" },
      { label: "Merchant links", value: String(users.filter((user) => user.ownedMerchant || user.merchantMemberships.length).length), helper: "Owner or staff profiles" },
      { label: "Need review", value: String(users.filter((user) => user.review.needsAttention).length), helper: "Status or merchant link issue" },
    ]
  }, [users])

  async function openDetail(userId: string) {
    setDetailLoading(true)
    setNotice(null)
    try {
      setSelected(await apiRequest<AdminUserReview>(`/api/admin/users/${userId}`))
      onAction("Admin user detail loaded from persisted data")
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "User detail gagal dimuat." })
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <AdminDirectoryFrame
      eyebrow="Admin database"
      title="Admin User Directory"
      description="Inspect persisted customer, merchant, and admin accounts without enabling account mutations yet."
      actionLabel="Refresh Users"
      onRefresh={() => void load()}
      query={query}
      onQueryChange={setQuery}
      queryPlaceholder="Search name, email, role, merchant..."
      notice={notice}
      stats={stats}
      tabs={userTabs}
      activeTab={tab}
      onTabChange={(value) => setTab(value as UserTab)}
      trailingFilter={
        <select
          aria-label="User status filter"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "all" | AdminUserStatus)}
          className="h-13 rounded-2xl border-0 bg-[#edf1f1] px-4 text-xs font-black uppercase tracking-[0.12em] text-[#687073] outline-none"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="restricted">Restricted</option>
          <option value="disabled">Disabled</option>
        </select>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
          {loading ? (
            <StateBlock icon={LoaderCircle} spin title="Loading admin users..." body="Mengambil data user, profile, merchant link, booking, dan notification dari SQLite/libSQL." />
          ) : !filtered.length ? (
            <StateBlock icon={Users} title="No matching users" body="Tidak ada user yang cocok dengan filter admin saat ini." />
          ) : (
            <div className="divide-y divide-[#edf1f1]">
              {filtered.map((item) => (
                <article key={item.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(280px,1fr)_170px_auto] xl:items-center xl:px-6">
                  <div className="flex min-w-0 items-center gap-4">
                    <Avatar user={item} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-black">{item.name}</h3>
                        <StatusBadge label={userStatusLabel(item.status)} tone={item.review.needsAttention ? "yellow" : userStatusTone(item.status)} />
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-[#687073]">{item.email ?? item.phone ?? "No contact"}</p>
                      <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.12em] text-[#9aa1a6]">
                        {userRoleLabel(item.role)} - {item.profile.city ?? "No city"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black">{item.stats.bookingCount} bookings</p>
                    <p className="mt-1 text-xs font-bold text-[#687073]">{rupiah(item.stats.totalSpend)} spend</p>
                    <p className="mt-1 text-xs font-black uppercase text-[#007c61]">{item.stats.notificationCount} notifications</p>
                  </div>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button type="button" onClick={() => void openDetail(item.id)} className="h-10 rounded-xl bg-[#edf1f1] px-4 text-xs font-black uppercase text-[#4d5559]">
                      Detail
                    </button>
                    {item.review.needsAttention && (
                      <span className="inline-flex h-10 items-center rounded-xl bg-[#fff2c9] px-4 text-xs font-black uppercase text-[#8a6f00]">
                        Review
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <AdminUserDetailPanel 
          selected={selected} 
          detailLoading={detailLoading} 
          onAction={onAction}
          onRefresh={() => selected && void openDetail(selected.id)}
        />
      </div>
    </AdminDirectoryFrame>
  )
}

export function AdminVenueModerationWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [venues, setVenues] = useState<AdminVenueModeration[]>([])
  const [selected, setSelected] = useState<AdminVenueModeration | null>(null)
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<VenueTab>("all")
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setNotice(null)
    try {
      const data = await apiRequest<AdminVenueModeration[]>("/api/admin/venues")
      setVenues(data)
      setSelected((current) => (current ? data.find((venue) => venue.id === current.id) ?? null : current))
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data venue moderation gagal dimuat." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    apiRequest<AdminVenueModeration[]>("/api/admin/venues")
      .then((data) => {
        if (active) setVenues(data)
      })
      .catch((error: unknown) => {
        if (active) setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data venue moderation gagal dimuat." })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return venues
      .filter((item) => tab === "all" || item.status === tab)
      .filter((item) => {
        if (!value) return true
        return [
          item.id,
          item.name,
          item.slug,
          item.address,
          item.city,
          item.area,
          item.category.name,
          item.status,
          item.merchant.businessName,
          item.merchant.owner.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value)
      })
  }, [query, tab, venues])

  const stats = useMemo(() => {
    return [
      { label: "Venues", value: String(venues.length), helper: "Persisted supply records" },
      { label: "Published", value: String(venues.filter((venue) => venue.status === "published").length), helper: "Visible in catalog" },
      { label: "Need review", value: String(venues.filter((venue) => venue.review.needsAttention).length), helper: "Moderation or merchant issue" },
      { label: "Tracked GMV", value: rupiah(venues.reduce((total, venue) => total + venue.stats.totalGmv, 0)), helper: "From bookings table" },
    ]
  }, [venues])

  async function openDetail(venueId: string) {
    setDetailLoading(true)
    setNotice(null)
    try {
      setSelected(await apiRequest<AdminVenueModeration>(`/api/admin/venues/${venueId}`))
      onAction("Admin venue detail loaded from persisted data")
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Venue detail gagal dimuat." })
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <AdminDirectoryFrame
      eyebrow="Moderation database"
      title="Venue Moderation"
      description="Review venue visibility, merchant ownership, court inventory, slots, and booking impact from persisted platform data."
      actionLabel="Refresh Venues"
      onRefresh={() => void load()}
      query={query}
      onQueryChange={setQuery}
      queryPlaceholder="Search venue, merchant, city, category..."
      notice={notice}
      stats={stats}
      tabs={venueTabs}
      activeTab={tab}
      onTabChange={(value) => setTab(value as VenueTab)}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
          {loading ? (
            <StateBlock icon={LoaderCircle} spin title="Loading venue moderation..." body="Mengambil venue, merchant, court, slot, dan booking dari SQLite/libSQL." />
          ) : !filtered.length ? (
            <StateBlock icon={Store} title="No matching venues" body="Tidak ada venue yang cocok dengan filter moderation saat ini." />
          ) : (
            <div className="divide-y divide-[#edf1f1]">
              {filtered.map((item) => (
                <article key={item.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(300px,1fr)_170px_auto] xl:items-center xl:px-6">
                  <div className="flex min-w-0 items-center gap-4">
                    <img src={item.image} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-black">{item.name}</h3>
                        <StatusBadge label={venueStatusLabel(item.status)} tone={item.review.needsAttention ? "yellow" : venueStatusTone(item.status)} />
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-[#687073]">{item.merchant.businessName}</p>
                      <p className="mt-1 truncate text-xs font-black uppercase tracking-[0.12em] text-[#9aa1a6]">
                        {item.category.name} - {item.area ?? item.city}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black">{rupiah(item.priceFrom)}</p>
                    <p className="mt-1 text-xs font-bold text-[#687073]">{item.stats.courtCount} courts / {item.stats.slotCount} slots</p>
                    <p className="mt-1 text-xs font-black uppercase text-[#007c61]">Rating {ratingLabel(item.rating)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button type="button" onClick={() => void openDetail(item.id)} className="h-10 rounded-xl bg-[#edf1f1] px-4 text-xs font-black uppercase text-[#4d5559]">
                      Detail
                    </button>
                    {item.review.needsAttention && (
                      <span className="inline-flex h-10 items-center rounded-xl bg-[#fff2c9] px-4 text-xs font-black uppercase text-[#8a6f00]">
                        Review
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <AdminVenueDetailPanel selected={selected} detailLoading={detailLoading} />
      </div>
    </AdminDirectoryFrame>
  )
}

function AdminDirectoryFrame({
  eyebrow,
  title,
  description,
  actionLabel,
  onRefresh,
  query,
  onQueryChange,
  queryPlaceholder,
  notice,
  stats,
  tabs,
  activeTab,
  onTabChange,
  trailingFilter,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  onRefresh: () => void
  query: string
  onQueryChange: (value: string) => void
  queryPlaceholder: string
  notice: Notice
  stats: Array<{ label: string; value: string; helper: string }>
  tabs: Array<{ id: string; label: string }>
  activeTab: string
  onTabChange: (value: string) => void
  trailingFilter?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007c61]">{eyebrow}</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eafff8] px-3 py-1 text-xs font-black text-[#007c61]">
                <Database className="h-3.5 w-3.5" />
                SQLite / libSQL
              </span>
            </div>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] lg:text-5xl">{title}</h2>
            <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-[#687073]">{description}</p>
          </div>
          <button type="button" onClick={onRefresh} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#071413] px-5 text-sm font-black uppercase tracking-[0.12em] text-white">
            <RefreshCw className="h-5 w-5" />
            {actionLabel}
          </button>
        </div>
        <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex h-13 items-center gap-3 rounded-2xl bg-[#edf1f1] px-4">
            <Search className="h-5 w-5 text-[#798186]" />
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={queryPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#9ca3a7]" />
          </label>
          <div className="flex min-w-0 flex-wrap gap-2 lg:flex-nowrap">
            {trailingFilter}
            <div className="sportcation-scrollbar flex min-w-0 gap-2 overflow-x-auto">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={cx(
                    "h-13 min-w-fit rounded-2xl px-4 text-xs font-black uppercase tracking-[0.12em]",
                    activeTab === item.id ? "bg-[#007c61] text-white" : "bg-[#edf1f1] text-[#687073]",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {notice && <NoticeBanner notice={notice} />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">{stat.label}</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">{stat.value}</h3>
            <p className="mt-1 text-sm font-semibold text-[#687073]">{stat.helper}</p>
          </article>
        ))}
      </section>

      {children}
    </div>
  )
}

function AdminUserDetailPanel({ 
  selected, 
  detailLoading,
  onAction,
  onRefresh
}: { 
  selected: AdminUserReview | null
  detailLoading: boolean
  onAction: (message: string) => void
  onRefresh: () => void
}) {
  const [updating, setUpdating] = useState(false)

  async function handleMerchantStatus(status: "verified" | "suspended" | "draft") {
    if (!selected?.ownedMerchant) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/merchants/${selected.ownedMerchant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        onAction(`Merchant status updated to ${status}`)
        onRefresh()
      } else {
        const err = await res.json()
        alert(`Error: ${err.error?.message || "Failed to update status"}`)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <aside className="h-fit rounded-[30px] bg-white p-6 shadow-sm xl:sticky xl:top-28">
      <PanelHeader title={selected?.name ?? "Select user"} loading={detailLoading} />
      {selected ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-[24px] bg-[#071413] p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#49e7ba]">Identity</p>
            <h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">{selected.profile.fullName ?? selected.name}</h3>
            <p className="mt-2 text-sm font-bold text-white/65">{selected.email ?? selected.phone ?? "No contact"}</p>
          </div>
          <DetailRow icon={User} label="Role and status" value={`${userRoleLabel(selected.role)} / ${userStatusLabel(selected.status)}`} helper={`Email verified: ${selected.emailVerified ? "yes" : "no"}`} />
          <DetailRow icon={MapPin} label="Profile city" value={selected.profile.city ?? "No city"} helper={`User ID ${selected.id}`} />
          <DetailRow icon={CalendarClock} label="Booking count" value={`${selected.stats.bookingCount} bookings`} helper={`${selected.stats.activeBookings} active - ${rupiah(selected.stats.totalSpend)} spend`} />
          <DetailRow icon={Building2} label="Merchant owner" value={selected.ownedMerchant?.businessName ?? "No owned merchant"} helper={selected.ownedMerchant ? `Status: ${selected.ownedMerchant.status}` : `${selected.merchantMemberships.length} memberships`} />
          
          {selected.ownedMerchant && (
            <div className="rounded-2xl bg-[#f3f6f6] p-4 space-y-3 text-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">Merchant Documents</p>
              
              <div className="grid gap-2">
                <a href={selected.ownedMerchant.ktpUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg bg-white p-3 hover:bg-gray-50">
                  <span className="font-bold text-[#687073]">KTP</span>
                  {selected.ownedMerchant.ktpUrl ? <CheckCircle2 className="h-4 w-4 text-[#007c61]" /> : <AlertCircle className="h-4 w-4 text-[#c11f32]" />}
                </a>
                <a href={selected.ownedMerchant.npwpUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg bg-white p-3 hover:bg-gray-50">
                  <span className="font-bold text-[#687073]">NPWP</span>
                  {selected.ownedMerchant.npwpUrl ? <CheckCircle2 className="h-4 w-4 text-[#007c61]" /> : <AlertCircle className="h-4 w-4 text-[#c11f32]" />}
                </a>
                <a href={selected.ownedMerchant.businessLicenseUrl || "#"} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-lg bg-white p-3 hover:bg-gray-50">
                  <span className="font-bold text-[#687073]">Surat Izin Usaha</span>
                  {selected.ownedMerchant.businessLicenseUrl ? <CheckCircle2 className="h-4 w-4 text-[#007c61]" /> : <AlertCircle className="h-4 w-4 text-[#c11f32]" />}
                </a>
              </div>

              {selected.ownedMerchant.status === "review" && (
                <div className="mt-4 flex gap-2 pt-2 border-t border-[#edf1f1]">
                  <button disabled={updating} onClick={() => handleMerchantStatus("verified")} className="flex-1 rounded-xl bg-[#007c61] py-2 text-xs font-black uppercase text-white hover:bg-[#00634e]">
                    Approve
                  </button>
                  <button disabled={updating} onClick={() => handleMerchantStatus("draft")} className="flex-1 rounded-xl bg-[#c11f32] py-2 text-xs font-black uppercase text-white hover:bg-[#a01627]">
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {selected.merchantMemberships.length > 0 && (
            <div className="rounded-2xl bg-[#f3f6f6] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">Merchant memberships</p>
              <div className="mt-3 space-y-2">
                {selected.merchantMemberships.map((membership) => (
                  <div key={`${membership.merchantId}-${membership.role}`} className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                    <span className="min-w-0 truncate text-sm font-black">{membership.businessName}</span>
                    <span className="text-xs font-bold text-[#687073]">{membership.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <ReviewBox review={selected.review} />
        </div>
      ) : (
        <EmptyDetail icon={Users} body="Open a user detail to review identity, profile, merchant links, booking count, and notification count." />
      )}
    </aside>
  )
}

function AdminVenueDetailPanel({ selected, detailLoading }: { selected: AdminVenueModeration | null; detailLoading: boolean }) {
  return (
    <aside className="h-fit rounded-[30px] bg-white p-6 shadow-sm xl:sticky xl:top-28">
      <PanelHeader title={selected?.name ?? "Select venue"} loading={detailLoading} />
      {selected ? (
        <div className="mt-6 space-y-5">
          <img src={selected.image} alt="" className="h-40 w-full rounded-[24px] object-cover" />
          <DetailRow icon={Store} label="Venue status" value={venueStatusLabel(selected.status)} helper={`${selected.category.name} - ${rupiah(selected.priceFrom)}`} />
          <DetailRow icon={Building2} label="Merchant" value={selected.merchant.businessName} helper={`Merchant status ${selected.merchant.status}`} />
          <DetailRow icon={User} label="Owner" value={selected.merchant.owner.name} helper={selected.merchant.owner.email ?? "No email"} />
          <DetailRow icon={MapPin} label="Location" value={selected.area ?? selected.city} helper={selected.address} />
          <DetailRow icon={CalendarClock} label="Inventory" value={`${selected.stats.courtCount} courts / ${selected.stats.slotCount} slots`} helper={`${selected.stats.availableSlots} available - ${selected.stats.bookedSlots} booked`} />
          <DetailRow icon={BadgeCheck} label="Booking impact" value={`${selected.stats.bookingCount} bookings`} helper={`${rupiah(selected.stats.totalGmv)} tracked GMV`} />
          <ReviewBox review={selected.review} />
        </div>
      ) : (
        <EmptyDetail icon={Store} body="Open a venue detail to review moderation status, merchant ownership, inventory, and booking impact." />
      )}
    </aside>
  )
}

function Avatar({ user }: { user: AdminUserReview }) {
  if (user.image || user.profile.avatarUrl) {
    return <img src={user.image ?? user.profile.avatarUrl ?? ""} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
  }
  return (
    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#dcfff6] text-[#007c61]">
      <User className="h-8 w-8" />
    </span>
  )
}

function PanelHeader({ title, loading }: { title: string; loading: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">Read-only detail</p>
        <h3 className="mt-2 truncate text-2xl font-black tracking-[-0.05em]">{title}</h3>
      </div>
      {loading && <LoaderCircle className="h-5 w-5 animate-spin text-[#008f71]" />}
    </div>
  )
}

function DetailRow({ icon: Icon, label, value, helper }: { icon: LucideIcon; label: string; value: string; helper: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dcfff6] text-[#007c61]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">{label}</p>
        <p className="mt-1 truncate text-base font-black">{value}</p>
        <p className="mt-1 text-sm font-semibold text-[#687073]">{helper}</p>
      </div>
    </div>
  )
}

function ReviewBox({ review }: { review: { needsAttention: boolean; reason: string } }) {
  return (
    <div className={cx("rounded-2xl p-4", review.needsAttention ? "bg-[#fff8df] text-[#7b6400]" : "bg-[#eafff8] text-[#007c61]")}>
      <div className="flex items-start gap-3">
        {review.needsAttention ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em]">{review.needsAttention ? "Needs review" : "Healthy"}</p>
          <p className="mt-1 text-sm font-bold leading-relaxed">{review.reason}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyDetail({ icon: Icon, body }: { icon: LucideIcon; body: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-[#d7dddd] p-6 text-center">
      <Icon className="mx-auto h-9 w-9 text-[#9aa1a6]" />
      <p className="mt-3 text-sm font-bold text-[#687073]">{body}</p>
    </div>
  )
}

function NoticeBanner({ notice }: { notice: Exclude<Notice, null> }) {
  const Icon = notice.tone === "success" ? CheckCircle2 : AlertCircle
  return (
    <div className={cx("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold", notice.tone === "success" ? "border-[#b8f3df] bg-[#eafff8] text-[#007c61]" : "border-[#ffd1d5] bg-[#fff0f1] text-[#c11f32]")}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      {notice.message}
    </div>
  )
}

function StateBlock({ icon: Icon, title, body, spin }: { icon: LucideIcon; title: string; body: string; spin?: boolean }) {
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div>
        <Icon className={cx("mx-auto h-10 w-10 text-[#008f71]", spin && "animate-spin")} />
        <p className="mt-3 font-black">{title}</p>
        <p className="mt-1 text-sm font-semibold text-[#7d8589]">{body}</p>
      </div>
    </div>
  )
}

function StatusBadge({ label, tone }: { label: string; tone: "green" | "yellow" | "red" | "gray" | "blue" }) {
  return (
    <span className={cx("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]", badgeClass(tone))}>
      {label}
    </span>
  )
}

function badgeClass(tone: "green" | "yellow" | "red" | "gray" | "blue") {
  if (tone === "green") return "bg-[#dcfff6] text-[#007c61]"
  if (tone === "yellow") return "bg-[#fff2c9] text-[#8a6f00]"
  if (tone === "red") return "bg-[#fff0f1] text-[#c11f32]"
  if (tone === "blue") return "bg-[#e5efff] text-[#2c64a7]"
  return "bg-[#f1f2f2] text-[#646c70]"
}

function userRoleLabel(role: AdminUserRole) {
  const labels: Record<AdminUserRole, string> = {
    customer: "Customer",
    merchant_owner: "Merchant owner",
    merchant_staff: "Merchant staff",
    admin: "Admin",
  }
  return labels[role]
}

function userStatusLabel(status: AdminUserStatus) {
  const labels: Record<AdminUserStatus, string> = {
    active: "Active",
    pending: "Pending",
    restricted: "Restricted",
    disabled: "Disabled",
  }
  return labels[status]
}

function userStatusTone(status: AdminUserStatus) {
  if (status === "active") return "green"
  if (status === "pending") return "yellow"
  if (status === "restricted" || status === "disabled") return "red"
  return "gray"
}

function venueStatusLabel(status: AdminVenueStatus) {
  const labels: Record<AdminVenueStatus, string> = {
    draft: "Draft",
    review: "Review",
    published: "Published",
    rejected: "Rejected",
    archived: "Archived",
  }
  return labels[status]
}

function venueStatusTone(status: AdminVenueStatus) {
  if (status === "published") return "green"
  if (status === "review" || status === "draft") return "yellow"
  if (status === "rejected") return "red"
  if (status === "archived") return "gray"
  return "blue"
}
