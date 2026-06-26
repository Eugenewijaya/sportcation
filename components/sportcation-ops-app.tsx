"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AdminUserDirectoryWorkspace, AdminVenueModerationWorkspace } from "@/components/admin-directory-workspace"
import { AdminBookingReviewWorkspace, AdminPaymentReviewWorkspace } from "@/components/admin-review-workspace"
import { MerchantBookingWorkspace } from "@/components/merchant-booking-workspace"
import { MerchantFinanceWorkspace } from "@/components/merchant-finance-workspace"
import { MerchantPersistentWorkspace } from "@/components/merchant-persistent-workspace"
import { OpsAccountControls } from "@/components/ops-account-controls"
import {
  Activity,
  Banknote,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Database,
  Edit3,
  FileText,
  Filter,
  Home,
  LayoutDashboard,
  LockKeyhole,
  Megaphone,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Ticket,
  Trash2,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  Loader2,
  Tag,
  Star,
  type LucideIcon,
} from "lucide-react"

export type SportcationOpsRole = "merchant" | "admin"

export type MerchantSection = "overview" | "venues" | "slots" | "bookings" | "finance" | "promotions" | "customers" | "reviews" | "settings"
export type AdminSection = "overview" | "users" | "venues" | "bookings" | "payments" | "reports" | "content" | "settings"
export type SportcationOpsSection = MerchantSection | AdminSection

type StatusTone = "green" | "yellow" | "red" | "gray" | "blue"

type NavItem = {
  section: SportcationOpsSection
  label: string
  href: string
  icon: LucideIcon
}

type StatCard = {
  label: string
  value: string
  helper: string
  icon: LucideIcon
  tone?: StatusTone
}

type TableRow = {
  id: string
  primary: string
  secondary: string
  meta: string
  metric: string
  status: string
  statusTone: StatusTone
  image?: string
}

type ResourceConfig = {
  title: string
  subtitle: string
  createLabel: string
  entityName: string
  helper: string
  rows: TableRow[]
  formFields: Array<{
    label: string
    placeholder: string
    type?: "text" | "number" | "select" | "textarea"
  }>
}

const merchantNav: NavItem[] = [
  { section: "overview", label: "Dashboard", href: "/merchant", icon: LayoutDashboard },
  { section: "venues", label: "Venues", href: "/merchant/venues", icon: Store },
  { section: "slots", label: "Slots", href: "/merchant/slots", icon: CalendarClock },
  { section: "bookings", label: "Bookings", href: "/merchant/bookings", icon: Ticket },
  { section: "finance", label: "Finance", href: "/merchant/finance", icon: Wallet },
  { section: "promotions", label: "Promotions", href: "/merchant/promotions", icon: Tag },
  { section: "customers", label: "Customers", href: "/merchant/customers", icon: Users },
  { section: "reviews", label: "Reviews", href: "/merchant/reviews", icon: Star },
  { section: "settings", label: "Settings", href: "/merchant/settings", icon: Settings },
]

const adminNav: NavItem[] = [
  { section: "overview", label: "Command", href: "/admin", icon: LayoutDashboard },
  { section: "users", label: "Users", href: "/admin/users", icon: Users },
  { section: "venues", label: "Venues", href: "/admin/venues", icon: Store },
  { section: "bookings", label: "Bookings", href: "/admin/bookings", icon: Ticket },
  { section: "payments", label: "Payments", href: "/admin/payments", icon: CreditCard },
  { section: "reports", label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { section: "content", label: "Content", href: "/admin/content", icon: Megaphone },
  { section: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
]

const merchantStats: StatCard[] = [
  { label: "Monthly GMV", value: "Rp 428.6M", helper: "+18.4% from May", icon: TrendingUp, tone: "green" },
  { label: "Active Courts", value: "32", helper: "4 venues online", icon: Store, tone: "blue" },
  { label: "Today Bookings", value: "86", helper: "14 pending check-in", icon: Ticket, tone: "yellow" },
  { label: "Payout Queue", value: "Rp 72.4M", helper: "Next settlement Friday", icon: Banknote, tone: "green" },
]

const adminStats: StatCard[] = [
  { label: "Platform GMV", value: "Rp 8.2B", helper: "+23.1% month over month", icon: TrendingUp, tone: "green" },
  { label: "Active Users", value: "48.2K", helper: "2.1K new this week", icon: Users, tone: "blue" },
  { label: "Open Reviews", value: "27", helper: "Venue and payout checks", icon: ShieldCheck, tone: "yellow" },
  { label: "System Health", value: "99.98%", helper: "API target for next phase", icon: Activity, tone: "green" },
]

const merchantRows = {
  venues: [
    row("VEN-1001", "Padel Arena", "Kebayoran Baru, Jakarta", "4 courts", "Rp 350.000/hr", "Published", "green", "/padel-court-modern.jpg"),
    row("VEN-1002", "Elite Tennis SCBD", "Sudirman, Jakarta", "2 courts", "Rp 250.000/hr", "Draft", "yellow", "/tennis-court-blue.jpg"),
    row("VEN-1003", "Metro Futsal Hub", "Senopati, Jakarta", "3 courts", "Rp 150.000/hr", "Published", "green", "/futsal-indoor-court.jpg"),
  ],
  slots: [
    row("SLT-2401", "Court 04 - 10:00", "Padel Arena", "24 Oct 2024", "Rp 350.000", "Available", "green"),
    row("SLT-2402", "Court 02 - 19:00", "Padel Arena", "24 Oct 2024", "Rp 420.000", "Booked", "blue"),
    row("SLT-2403", "Court 01 - 21:00", "Elite Tennis SCBD", "25 Oct 2024", "Rp 250.000", "Blocked", "gray"),
  ],
  bookings: [
    row("BKG-77291", "Alex Rivera", "Padel Arena - Court 04", "24 Oct, 10:00", "Rp 365.000", "Confirmed", "green"),
    row("BKG-77302", "Maya Putri", "Elite Tennis SCBD", "24 Oct, 18:00", "Rp 265.000", "Checked in", "blue"),
    row("BKG-77318", "Rendi Halim", "Metro Futsal Hub", "25 Oct, 20:00", "Rp 165.000", "Pending payment", "yellow"),
  ],
  finance: [
    row("PAY-9001", "QRIS Settlement", "Padel Arena", "24 bookings", "Rp 18.450.000", "Ready payout", "green"),
    row("PAY-9002", "Voucher Subsidy", "Flash sale campaign", "12 redemptions", "Rp 2.100.000", "Review", "yellow"),
    row("PAY-9003", "Refund Hold", "Cancelled weather slots", "3 bookings", "Rp 840.000", "On hold", "red"),
  ],
  promotions: [
    row("PRM-001", "Weekend Warrior", "10% off Saturday slots", "Valid till Dec 31", "124 used", "Active", "green"),
    row("PRM-002", "Early Bird Padel", "Rp 50k off morning sessions", "Valid till Nov 30", "45 used", "Scheduled", "blue"),
    row("PRM-003", "Flash Sale", "50% off last minute", "Expired yesterday", "89 used", "Ended", "gray"),
  ],
  customers: [
    row("CUS-801", "Budi Santoso", "budi@example.com", "Member since Jan 2024", "12 bookings", "VIP", "green"),
    row("CUS-802", "Siti Aminah", "siti@example.com", "Member since Mar 2024", "5 bookings", "Regular", "blue"),
    row("CUS-803", "Andi Wijaya", "andi@example.com", "Member since Oct 2024", "1 booking", "New", "yellow"),
  ],
  reviews: [
    row("REV-501", "Padel Arena", "Court 01 was fantastic!", "By Budi Santoso", "5 Stars", "Published", "green"),
    row("REV-502", "Elite Tennis SCBD", "Net needs fixing", "By Siti Aminah", "3 Stars", "Needs Reply", "yellow"),
    row("REV-503", "Metro Futsal Hub", "Great location but hot", "By Andi Wijaya", "4 Stars", "Replied", "blue"),
  ],
}

const adminRows = {
  users: [
    row("USR-1001", "Alex Rivera", "alex.rivera@sportcation.com", "Customer", "24 bookings", "Active", "green"),
    row("USR-1002", "Nadya Venue Ops", "ops@padelarena.id", "Merchant owner", "4 venues", "Verified", "blue"),
    row("USR-1003", "Risk Review User", "review@example.com", "Customer", "2 disputes", "Restricted", "red"),
  ],
  venues: [
    row("VEN-APP-11", "Vantage Padel Arena", "Jakarta Selatan", "Submitted today", "Rp 450.000/hr", "Needs review", "yellow", "/padel-court-modern.jpg"),
    row("VEN-APP-12", "Urban Drive Range", "Setiabudi", "4 images", "Rp 300.000/hr", "Approved", "green", "/golf-course-green.png"),
    row("VEN-APP-13", "Prime Performance Hub", "Kemang", "Missing tax doc", "Rp 720.000/mo", "Blocked", "red", "/modern-gym-equipment.png"),
  ],
  bookings: [
    row("BKG-8801", "SP-77291", "Padel Arena - Alex Rivera", "QRIS", "Rp 365.000", "Confirmed", "green"),
    row("BKG-8802", "SP-77292", "Elite Tennis - Maya Putri", "Virtual Account", "Rp 265.000", "Refund request", "yellow"),
    row("BKG-8803", "SP-77293", "Metro Futsal - Rendi Halim", "Wallet", "Rp 165.000", "Disputed", "red"),
  ],
  payments: [
    row("TRX-2201", "QRIS / OVO", "SP-77291", "Midtrans simulation", "Rp 365.000", "Paid", "green"),
    row("TRX-2202", "Virtual Account", "SP-77292", "BCA", "Rp 265.000", "Pending", "yellow"),
    row("TRX-2203", "Refund Batch", "Weather cancellation", "3 bookings", "Rp 840.000", "Manual review", "red"),
  ],
  reports: [
    row("RPT-01", "GMV Performance", "Daily revenue and take rate", "Updated 09:00", "Rp 8.2B", "Healthy", "green"),
    row("RPT-02", "Venue Supply", "Availability and slot coverage", "Jakarta", "78%", "Watch", "yellow"),
    row("RPT-03", "Payment Risk", "Failed and disputed payments", "Last 7 days", "1.8%", "Stable", "green"),
  ],
  content: [
    row("CMS-01", "Ultra Flash Sale", "Homepage banner", "Runs until Sunday", "70% off", "Live", "green"),
    row("CMS-02", "Privacy Policy", "Legal page", "Needs DPO review", "v2.5", "Draft", "yellow"),
    row("CMS-03", "Sport Categories", "Explore chips", "8 active categories", "Padel first", "Published", "green"),
  ],
}

const merchantResources: Record<Exclude<MerchantSection, "overview" | "settings">, ResourceConfig> = {
  venues: {
    title: "Venue Catalog",
    subtitle: "Manage venue identity, location, facility, image, and publish status.",
    createLabel: "New Venue",
    entityName: "venue",
    helper: "Ready for Drizzle table mapping: venues, courts, venue_images, facilities.",
    rows: merchantRows.venues,
    formFields: [
      { label: "Venue name", placeholder: "Padel Arena" },
      { label: "Sport category", placeholder: "Padel", type: "select" },
      { label: "Address", placeholder: "Jl. Suryo No. 12, Jakarta Selatan", type: "textarea" },
      { label: "Base price", placeholder: "350000", type: "number" },
      { label: "Publish status", placeholder: "Published / Draft", type: "select" },
    ],
  },
  slots: {
    title: "Slot Inventory",
    subtitle: "Create, block, price, and publish court availability by date and time.",
    createLabel: "Create Slot",
    entityName: "slot",
    helper: "Ready for slot CRUD with unique constraint on court_id, date, start_time, end_time.",
    rows: merchantRows.slots,
    formFields: [
      { label: "Court", placeholder: "Court 04", type: "select" },
      { label: "Date", placeholder: "2024-10-24" },
      { label: "Start time", placeholder: "10:00" },
      { label: "End time", placeholder: "11:00" },
      { label: "Price", placeholder: "350000", type: "number" },
    ],
  },
  bookings: {
    title: "Booking Operations",
    subtitle: "Track customer sessions, check-in status, cancellations, and support actions.",
    createLabel: "Manual Booking",
    entityName: "booking",
    helper: "Ready for booking state transitions: pending, confirmed, checked_in, cancelled, completed.",
    rows: merchantRows.bookings,
    formFields: [
      { label: "Customer", placeholder: "Search customer" },
      { label: "Slot", placeholder: "Court 04 - 24 Oct - 10:00", type: "select" },
      { label: "Booking status", placeholder: "Confirmed", type: "select" },
      { label: "Internal note", placeholder: "Check-in note", type: "textarea" },
    ],
  },
  finance: {
    title: "Settlement Center",
    subtitle: "Review payouts, refund holds, platform fee, and campaign subsidy.",
    createLabel: "Adjustment",
    entityName: "transaction",
    helper: "Ready for payments, payouts, refund ledger, and wallet transaction tables.",
    rows: merchantRows.finance,
    formFields: [
      { label: "Transaction type", placeholder: "Payout / Adjustment / Refund", type: "select" },
      { label: "Reference", placeholder: "PAY-9001" },
      { label: "Amount", placeholder: "18450000", type: "number" },
      { label: "Reason", placeholder: "Settlement correction", type: "textarea" },
    ],
  },
  promotions: {
    title: "Marketing & Promotions",
    subtitle: "Launch flash sales, discount codes, and special rates to boost bookings.",
    createLabel: "New Promo",
    entityName: "promotion",
    helper: "Ready to be wired to a new 'promotions' schema table.",
    rows: merchantRows.promotions,
    formFields: [
      { label: "Promo Name", placeholder: "Weekend Warrior" },
      { label: "Discount Type", placeholder: "Percentage / Fixed", type: "select" },
      { label: "Value", placeholder: "10", type: "number" },
      { label: "Valid Until", placeholder: "2024-12-31" },
    ],
  },
  customers: {
    title: "Customer CRM",
    subtitle: "Understand your player base, frequency, and loyalty.",
    createLabel: "Export CRM",
    entityName: "customer",
    helper: "Aggregates users who have booked your venues.",
    rows: merchantRows.customers,
    formFields: [
      { label: "Customer Name", placeholder: "Read only field" },
      { label: "Loyalty Status", placeholder: "VIP / Regular / New", type: "select" },
      { label: "Admin Note", placeholder: "Internal note about this player", type: "textarea" },
    ],
  },
  reviews: {
    title: "Ratings & Reviews",
    subtitle: "Monitor feedback and reply to customers to maintain your reputation.",
    createLabel: "Appeal Review",
    entityName: "review",
    helper: "Ready for 'venue_reviews' table mapping.",
    rows: merchantRows.reviews,
    formFields: [
      { label: "Reply Message", placeholder: "Thank you for the feedback...", type: "textarea" },
      { label: "Status", placeholder: "Published / Hidden", type: "select" },
    ],
  },
}

const adminResources: Record<Exclude<AdminSection, "overview" | "settings">, ResourceConfig> = {
  users: {
    title: "User Registry",
    subtitle: "Manage customers, merchant owners, staff roles, verification, and restrictions.",
    createLabel: "Invite User",
    entityName: "user",
    helper: "Ready for users, user_profiles, merchant_members, roles, and audit_logs.",
    rows: adminRows.users,
    formFields: [
      { label: "Full name", placeholder: "Alex Rivera" },
      { label: "Email / phone", placeholder: "alex@sportcation.com" },
      { label: "Role", placeholder: "Customer / Merchant / Admin", type: "select" },
      { label: "Status", placeholder: "Active / Restricted", type: "select" },
    ],
  },
  venues: {
    title: "Venue Moderation",
    subtitle: "Approve partners, inspect documents, validate images, and control visibility.",
    createLabel: "Add Venue",
    entityName: "venue",
    helper: "Ready for venue approval workflow and partner ownership relations.",
    rows: adminRows.venues,
    formFields: [
      { label: "Venue name", placeholder: "Vantage Padel Arena" },
      { label: "Owner", placeholder: "Nadya Venue Ops" },
      { label: "Review status", placeholder: "Needs review", type: "select" },
      { label: "Reviewer note", placeholder: "Missing tax document", type: "textarea" },
    ],
  },
  bookings: {
    title: "Booking Control",
    subtitle: "Monitor platform bookings, disputes, cancellations, resell links, and QR check-ins.",
    createLabel: "Create Case",
    entityName: "booking case",
    helper: "Ready for admin booking audit, dispute workflow, and immutable state history.",
    rows: adminRows.bookings,
    formFields: [
      { label: "Booking code", placeholder: "SP-77291" },
      { label: "Case type", placeholder: "Refund / Dispute / Manual verify", type: "select" },
      { label: "Priority", placeholder: "High / Normal / Low", type: "select" },
      { label: "Resolution note", placeholder: "Explain admin action", type: "textarea" },
    ],
  },
  payments: {
    title: "Payment Reconciliation",
    subtitle: "Audit payment status, refunds, payout release, wallet movements, and failed charges.",
    createLabel: "Manual Review",
    entityName: "payment review",
    helper: "Ready for payment_events, ledger_entries, refunds, and payout batches.",
    rows: adminRows.payments,
    formFields: [
      { label: "Payment reference", placeholder: "TRX-2201" },
      { label: "Provider", placeholder: "QRIS / VA / Wallet", type: "select" },
      { label: "Amount", placeholder: "365000", type: "number" },
      { label: "Admin decision", placeholder: "Approve / Hold / Refund", type: "select" },
    ],
  },
  reports: {
    title: "Platform Reports",
    subtitle: "Track GMV, venue supply, conversion, payment risk, and operational health.",
    createLabel: "New Report",
    entityName: "report",
    helper: "Ready for materialized views or Neon read replicas when analytics grows.",
    rows: adminRows.reports,
    formFields: [
      { label: "Report name", placeholder: "GMV Performance" },
      { label: "Metric source", placeholder: "bookings/payments", type: "select" },
      { label: "Date range", placeholder: "Last 30 days" },
      { label: "Notes", placeholder: "Executive summary", type: "textarea" },
    ],
  },
  content: {
    title: "Content Control",
    subtitle: "Manage homepage banners, flash sale copy, category order, legal pages, and promos.",
    createLabel: "Create Content",
    entityName: "content item",
    helper: "Ready for cms_entries or a future headless CMS integration, not local JSON storage.",
    rows: adminRows.content,
    formFields: [
      { label: "Title", placeholder: "Ultra Flash Sale" },
      { label: "Placement", placeholder: "Homepage / Explore / Legal", type: "select" },
      { label: "Status", placeholder: "Draft / Live / Archived", type: "select" },
      { label: "Body", placeholder: "Campaign copy", type: "textarea" },
    ],
  },
}

function row(
  id: string,
  primary: string,
  secondary: string,
  meta: string,
  metric: string,
  status: string,
  statusTone: StatusTone,
  image?: string,
): TableRow {
  return { id, primary, secondary, meta, metric, status, statusTone, image }
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function SportcationOpsApp({
  role,
  section = "overview",
}: {
  role: SportcationOpsRole
  section?: SportcationOpsSection
}) {
  const { data, loading } = useOpsDashboard(role);
  
  const currentMerchantRows = useMemo(() => mapMerchantDataToRows(role === "merchant" ? data : null), [data, role]);
  const currentAdminRows = useMemo(() => mapAdminDataToRows(role === "admin" ? data : null), [data, role]);

  const nav = role === "merchant" ? merchantNav : adminNav
  const normalizedSection = nav.some((item) => item.section === section) ? section : "overview"
  const [actionMessage, setActionMessage] = useState(
    role === "merchant" ? "Venue and slot CRUD connected" : "Admin UI ready for backend wiring",
  )

  const roleTitle = role === "merchant" ? "Merchant Studio" : "Admin Command"
  const roleSubtitle =
    role === "merchant"
      ? "Operate venues, slots, bookings, and settlement from one responsive workspace."
      : "Control platform users, venue approval, payments, reports, and content governance."

  return (
    <main className="min-h-screen bg-[#f3f6f6] text-[#2c3133]">
      <div className="lg:flex">
        <OpsSidebar role={role} nav={nav} active={normalizedSection as SportcationOpsSection} />
        <section className="min-h-screen flex-1 lg:pl-[292px]">
          <OpsTopBar role={role} title={roleTitle} subtitle={roleSubtitle} />
          <div className="mx-auto w-full max-w-[430px] px-5 py-6 lg:max-w-none lg:px-8 lg:py-8">
            <MobileOpsNav nav={nav} active={normalizedSection as SportcationOpsSection} />
            {actionMessage && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#c7f7e7] bg-[#eafff8] px-4 py-3 text-sm font-bold text-[#007c61] lg:hidden">
                <Database className="h-4 w-4" />
                {actionMessage}
              </div>
            )}
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : (
              <WorkspaceRouter
                role={role}
                section={normalizedSection}
                merchantRows={currentMerchantRows}
                adminRows={currentAdminRows}
                onAction={setActionMessage}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function WorkspaceRouter({
  role,
  section,
  merchantRows,
  adminRows,
  onAction,
}: {
  role: SportcationOpsRole
  section: string
  merchantRows: any
  adminRows: any
  onAction: (message: string) => void
}) {
  if (role === "merchant") {
    if (section === "overview") return <MerchantOverview onAction={onAction} merchantRows={merchantRows} />
    if (section === "settings") return <SettingsWorkspace role="merchant" onAction={onAction} />
    if (section === "venues" || section === "slots") {
      return <MerchantPersistentWorkspace resource={section} onAction={onAction} />
    }
    if (section === "bookings") return <MerchantBookingWorkspace onAction={onAction} />
    if (section === "finance") return <MerchantFinanceWorkspace onAction={onAction} />
    return <CrudWorkspace config={getMerchantResources(merchantRows)[section as keyof ReturnType<typeof getMerchantResources>]} role="merchant" onAction={onAction} />
  }

  if (section === "overview") return <AdminOverview onAction={onAction} adminRows={adminRows} />
  if (section === "settings") return <SettingsWorkspace role="admin" onAction={onAction} />
  if (section === "users") return <AdminUserDirectoryWorkspace onAction={onAction} />
  if (section === "venues") return <AdminVenueModerationWorkspace onAction={onAction} />
  if (section === "bookings") return <AdminBookingReviewWorkspace onAction={onAction} />
  if (section === "payments") return <AdminPaymentReviewWorkspace onAction={onAction} />
  return <CrudWorkspace config={getAdminResources(adminRows)[section as keyof ReturnType<typeof getAdminResources>]} role="admin" onAction={onAction} />
}

function OpsSidebar({
  role,
  nav,
  active,
}: {
  role: SportcationOpsRole
  nav: NavItem[]
  active: SportcationOpsSection
}) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[292px] border-r border-[#e2e8e8] bg-white px-6 py-7 lg:block">
      <Link href="/" className="flex items-center gap-3 font-black italic tracking-[-0.05em] text-[#1f2326]">
        <span className="h-9 w-9 rounded-xl bg-[#12d5aa]" />
        <span className="text-2xl">SPORTCATION</span>
      </Link>
      <div className="mt-8 rounded-[28px] bg-[#071413] p-5 text-white">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#49e7ba]">{role === "merchant" ? "Partner mode" : "Platform mode"}</p>
        <h2 className="mt-3 text-2xl font-black tracking-[-0.05em]">{role === "merchant" ? "Merchant Studio" : "Admin Command"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          {role === "merchant" ? "Manage supply, bookings, and payout readiness." : "Govern demand, supply, payment risk, and content."}
        </p>
      </div>
      <nav className="mt-7 space-y-2">
        {nav.map((item) => (
          <OpsNavLink key={item.href} item={item} active={active === item.section} />
        ))}
      </nav>
      <div className="mt-8 grid gap-3">
        <OpsAccountControls />
        <Link href="/" className="rounded-2xl bg-[#edf1f1] px-4 py-3 text-sm font-black text-[#5f666a]">
          Back to User App
        </Link>
      </div>
    </aside>
  )
}

function OpsNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cx(
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-[0.14em] transition",
        active ? "bg-[#eafff8] text-[#007c61]" : "text-[#8a9297] hover:bg-[#f3f6f6] hover:text-[#2c3133]",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </Link>
  )
}

function OpsTopBar({
  role,
  title,
  subtitle,
}: {
  role: SportcationOpsRole
  title: string
  subtitle: string
}) {
  return (
    <header className="border-b border-[#e2e8e8] bg-white/80 px-5 py-4 backdrop-blur lg:sticky lg:top-0 lg:z-20 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#007c61]">{role === "merchant" ? "Jakarta Partner" : "Sportcation HQ"}</p>
          <h1 className="truncate text-xl font-black tracking-[-0.05em] lg:text-2xl">{title}</h1>
          <p className="hidden text-sm font-semibold text-[#687073] lg:block">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="hidden h-12 items-center gap-2 rounded-full bg-[#edf1f1] px-5 text-sm font-black text-[#5f666a] lg:flex">
            <Home className="h-4 w-4" />
            User App
          </Link>
          <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#687073] shadow-sm">
            <Bell className="h-5 w-5" />
          </button>
          <div className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#49e7ba] bg-[#dcfff6] text-[#007c61]">
            {role === "merchant" ? <Store className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileOpsNav({
  nav,
  active,
}: {
  nav: NavItem[]
  active: SportcationOpsSection
}) {
  return (
    <div className="mb-6 lg:hidden">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="font-black italic tracking-[-0.05em]">SPORTCATION</Link>
        <OpsAccountControls compact />
      </div>
      <nav className="sportcation-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
        {nav.map((item) => {
          const Icon = item.icon
          const selected = active === item.section
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "flex min-w-fit items-center gap-2 rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.12em]",
                selected ? "bg-[#007c61] text-white shadow-lg shadow-emerald-900/10" : "bg-white text-[#8a9297]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function MerchantOverview({ onAction, merchantRows }: { onAction: (message: string) => void; merchantRows: any }) {
  return (
    <div className="space-y-8">
      <OpsHero
        label="Merchant workspace"
        title="Run your venue inventory without waiting for admin."
        body="Create courts, publish slot capacity, confirm bookings, and prepare payout records. Every card has the same resource shape expected by the upcoming Drizzle API."
        action="Add venue"
        onAction={() => onAction("Create venue drawer is ready for backend mutation")}
      />
      <StatsGrid stats={merchantStats} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_0.75fr]">
        <OperationsBoard title="Today Ops Queue" rows={merchantRows.bookings} onAction={onAction} />
        <ReadinessPanel
          title="CRUD Readiness"
          items={["Venue form fields mapped", "Slot unique key defined", "Booking state actions visible", "Settlement rows ready for ledger API"]}
        />
      </div>
    </div>
  )
}

function AdminOverview({ onAction, adminRows }: { onAction: (message: string) => void; adminRows: any }) {
  const [stats, setStats] = useState<StatCard[]>(adminStats)

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setStats(data.stats)
        }
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="space-y-8">
      <OpsHero
        label="Admin command"
        title="Control users, venues, payments, and platform content."
        body="The admin surface is structured around resources that will map cleanly to Drizzle schema modules and Neon-backed CRUD endpoints."
        action="Open review queue"
        onAction={() => onAction("Admin review queue route and UI are ready")}
      />
      <StatsGrid stats={stats} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_0.75fr]">
        <OperationsBoard title="Platform Review Queue" rows={[...adminRows.venues, ...adminRows.payments].slice(0, 5)} onAction={onAction} />
        <ReadinessPanel
          title="Backend Contract Targets"
          items={["Role-based route guards", "Drizzle schema per domain", "Neon pooled server connection", "Audit logs on every admin mutation"]}
        />
      </div>
    </div>
  )
}

function OpsHero({
  label,
  title,
  body,
  action,
  onAction,
}: {
  label: string
  title: string
  body: string
  action: string
  onAction: () => void
}) {
  return (
    <section className="overflow-hidden rounded-[32px] bg-[#071413] p-7 text-white shadow-[0_26px_70px_rgb(0_124_97/0.18)] lg:p-9">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-[#49e7ba]">{label}</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black leading-[1] tracking-[-0.07em] lg:text-6xl">{title}</h2>
          <p className="mt-5 max-w-2xl text-base font-semibold leading-relaxed text-white/68 lg:text-lg">{body}</p>
          <button
            type="button"
            onClick={onAction}
            className="mt-7 inline-flex h-13 items-center gap-2 rounded-full bg-gradient-to-r from-[#008f71] to-[#49e7ba] px-6 text-sm font-black uppercase tracking-[0.12em] text-white"
          >
            <Plus className="h-5 w-5" />
            {action}
          </button>
        </div>
        <div className="rounded-[28px] bg-white/8 p-5">
          <div className="grid grid-cols-2 gap-3">
            {["Create", "Read", "Update", "Delete"].map((item, index) => (
              <div key={item} className="rounded-2xl bg-white/10 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">CRUD {index + 1}</p>
                <p className="mt-2 text-xl font-black">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StatsGrid({ stats }: { stats: StatCard[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        // Fallback icon mapping if API doesn't return functions
        const Icon = stat.icon || (i === 0 ? TrendingUp : i === 1 ? Users : i === 2 ? ShieldCheck : Activity)
        return (
          <article key={stat.label} className="rounded-[26px] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className={cx("grid h-12 w-12 place-items-center rounded-2xl", toneBg(stat.tone ?? "green"))}>
                <Icon className="h-6 w-6" />
              </span>
              <MoreHorizontal className="h-5 w-5 text-[#a1a8ac]" />
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#687073]">{stat.label}</p>
            <h3 className="mt-2 text-3xl font-black tracking-[-0.06em]">{stat.value}</h3>
            <p className="mt-2 text-sm font-semibold text-[#687073]">{stat.helper}</p>
          </article>
        )
      })}
    </section>
  )
}

function CrudWorkspace({
  config,
  role,
  onAction,
}: {
  config: ResourceConfig
  role: SportcationOpsRole
  onAction: (message: string) => void
}) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<TableRow>(config.rows[0])
  const [formOpen, setFormOpen] = useState(true)

  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return config.rows
    return config.rows.filter((item) => [item.primary, item.secondary, item.status, item.id].join(" ").toLowerCase().includes(normalized))
  }, [config.rows, query])

  function trigger(action: string, item?: TableRow) {
    if (item) setSelected(item)
    setFormOpen(true)
    onAction(`${action} ${item?.id ?? config.entityName}: UI ready, backend mutation pending`)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007c61]">{role === "merchant" ? "Merchant resource" : "Admin resource"}</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] lg:text-5xl">{config.title}</h2>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-[#687073]">{config.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => trigger("Create")}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#008f71] to-[#49e7ba] px-5 text-sm font-black uppercase tracking-[0.12em] text-white"
            >
              <Plus className="h-5 w-5" />
              {config.createLabel}
            </button>
            <button type="button" onClick={() => onAction("Bulk action toolbar ready")} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#edf1f1] px-5 text-sm font-black text-[#5f666a]">
              <SlidersHorizontal className="h-5 w-5" />
              Bulk Actions
            </button>
          </div>
        </div>
        <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="flex h-13 items-center gap-3 rounded-2xl bg-[#edf1f1] px-4">
            <Search className="h-5 w-5 text-[#798186]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${config.entityName}s...`}
              className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#9ca3a7]"
            />
          </label>
          <button type="button" onClick={() => onAction("Filter state ready for query params")} className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#edf1f1] px-5 text-sm font-black text-[#5f666a]">
            <Filter className="h-5 w-5" />
            Filter
          </button>
          <button type="button" onClick={() => onAction("Export action ready for report endpoint")} className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#071413] px-5 text-sm font-black text-white">
            <FileText className="h-5 w-5" />
            Export
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
          <div className="border-b border-[#edf1f1] px-6 py-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#687073]">{filteredRows.length} records</p>
          </div>
          <div className="divide-y divide-[#edf1f1]">
            {filteredRows.map((item) => (
              <article key={item.id} className="grid gap-4 px-6 py-5 hover:bg-[#f9fbfb] transition-colors lg:grid-cols-[minmax(260px,1fr)_140px_150px_auto] lg:items-center">
                <button type="button" onClick={() => trigger("Read", item)} className="flex min-w-0 items-center gap-4 text-left hover:opacity-80 transition-opacity">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
                  ) : (
                    <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#dcfff6] text-[#007c61] shadow-sm">
                      <Database className="h-7 w-7" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-lg font-black leading-tight text-[#1f2326]">{item.primary}</span>
                    <span className="mt-1 block truncate text-sm font-semibold text-[#687073]">{item.secondary}</span>
                    <span className="mt-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-[#9aa1a6]">{item.id}</span>
                  </span>
                </button>
                <p className="text-sm font-bold text-[#5f666a] truncate">{item.meta}</p>
                <div>
                  <p className="text-lg font-black text-[#1f2326]">{item.metric}</p>
                  <div className="mt-1">
                    <StatusBadge label={item.status} tone={item.statusTone} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <IconButton label="Edit" icon={Edit3} onClick={() => trigger("Update", item)} />
                  <IconButton label="Archive" icon={LockKeyhole} onClick={() => trigger("Archive", item)} />
                  <IconButton label="Delete" icon={Trash2} danger onClick={() => trigger("Delete", item)} />
                </div>
              </article>
            ))}
          </div>
        </section>
        <CrudFormPanel config={config} selected={selected} open={formOpen} onToggle={() => setFormOpen(!formOpen)} onAction={onAction} />
      </div>
    </div>
  )
}

function CrudFormPanel({
  config,
  selected,
  open,
  onToggle,
  onAction,
}: {
  config: ResourceConfig
  selected: TableRow
  open: boolean
  onToggle: () => void
  onAction: (message: string) => void
}) {
  return (
    <aside className="rounded-[30px] bg-white p-6 shadow-sm xl:sticky xl:top-28 xl:h-fit">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left">
        <span>
          <span className="block text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">CRUD form draft</span>
          <span className="mt-2 block text-2xl font-black tracking-[-0.05em]">{selected.primary}</span>
        </span>
        <ChevronRight className={cx("h-5 w-5 text-[#8f979c] transition", open && "rotate-90")} />
      </button>
      {open && (
        <div className="mt-6 space-y-4">
          {config.formFields.map((field) => (
            <label key={field.label} className="block">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea className="mt-2 min-h-24 w-full rounded-2xl border-0 bg-[#edf1f1] px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#49e7ba]" placeholder={field.placeholder} />
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  className="mt-2 h-12 w-full rounded-2xl border-0 bg-[#edf1f1] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#49e7ba]"
                  placeholder={field.placeholder}
                />
              )}
            </label>
          ))}
          <div className="rounded-2xl bg-[#eafff8] p-4 text-sm font-bold leading-relaxed text-[#007c61]">
            {config.helper}
          </div>
          <button
            type="button"
            onClick={() => onAction(`Save draft ${config.entityName}: replace with server action or route handler mutation`)}
            className="h-13 w-full rounded-full bg-gradient-to-r from-[#008f71] to-[#49e7ba] text-sm font-black uppercase tracking-[0.14em] text-white"
          >
            Save Draft
          </button>
        </div>
      )}
    </aside>
  )
}

function OperationsBoard({
  title,
  rows,
  onAction,
}: {
  title: string
  rows: TableRow[]
  onAction: (message: string) => void
}) {
  return (
    <section className="min-w-0 rounded-[30px] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">Live queue</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.05em]">{title}</h2>
        </div>
        <button type="button" onClick={() => onAction("Queue filter ready")} className="rounded-full bg-[#edf1f1] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#687073]">
          Latest
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item) => (
          <button key={item.id} type="button" onClick={() => onAction(`Open ${item.id}`)} className="flex w-full items-center justify-between gap-4 rounded-2xl bg-[#f3f6f6] p-4 text-left">
            <span className="min-w-0">
              <span className="block truncate font-black">{item.primary}</span>
              <span className="block truncate text-sm font-semibold text-[#687073]">{item.secondary}</span>
            </span>
            <span className="text-right">
              <span className="block font-black">{item.metric}</span>
              <StatusBadge label={item.status} tone={item.statusTone} />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

function ReadinessPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="min-w-0 rounded-[30px] bg-[#071413] p-6 text-white shadow-[0_26px_70px_rgb(0_0_0/0.12)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#49e7ba]">Next backend phase</p>
      <h2 className="mt-3 text-2xl font-black tracking-[-0.05em]">{title}</h2>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/8 p-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#49e7ba]" />
            <p className="text-sm font-semibold leading-relaxed text-white/75">{item}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SettingsWorkspace({ role, onAction }: { role: SportcationOpsRole; onAction: (message: string) => void }) {
  const sections =
    role === "merchant"
      ? [
          ["Partner profile", "Legal name, tax ID, bank account, owner contact"],
          ["Staff roles", "Manager, cashier, check-in staff, finance viewer"],
          ["Operational rules", "Cancellation policy, slot buffer, auto-confirm"],
          ["Webhook readiness", "Payment, booking, payout, and notification events"],
        ]
      : [
          ["Role & permission matrix", "Admin, support, finance, content, risk"],
          ["Platform configuration", "Fees, voucher limits, refund SLA, QR validity"],
          ["Security controls", "Session policy, MFA, rate limit, audit retention"],
          ["Database readiness", "Drizzle migrations, Neon pooling, backup strategy"],
        ]

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm lg:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">{role} settings</p>
        <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] lg:text-5xl">Settings & Access Control</h2>
        <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-[#687073]">
          Settings UI is prepared for role-based permissions, server validation, audit logging, and Drizzle-backed persistence.
        </p>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map(([title, body], index) => (
          <article key={title} className="rounded-[28px] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dcfff6] text-[#007c61]">
                {index === 0 ? <UserCog className="h-6 w-6" /> : index === 1 ? <ShieldCheck className="h-6 w-6" /> : index === 2 ? <Settings className="h-6 w-6" /> : <Database className="h-6 w-6" />}
              </span>
              <button type="button" onClick={() => onAction(`Open ${title} settings`)} className="rounded-full bg-[#edf1f1] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#687073]">
                Configure
              </button>
            </div>
            <h3 className="mt-5 text-xl font-black">{title}</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[#687073]">{body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span className={cx("mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]", toneBadge(tone))}>
      {label}
    </span>
  )
}

function IconButton({
  label,
  icon: Icon,
  danger = false,
  onClick,
}: {
  label: string
  icon: LucideIcon
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      title={label}
      className={cx(
        "grid h-10 w-10 place-items-center rounded-full transition",
        danger ? "bg-[#ffe9ec] text-[#c92034] hover:bg-[#ffd9df]" : "bg-[#edf1f1] text-[#5f666a] hover:bg-[#dcfff6] hover:text-[#007c61]",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function toneBg(tone: StatusTone) {
  if (tone === "green") return "bg-[#dcfff6] text-[#007c61]"
  if (tone === "yellow") return "bg-[#fff2c9] text-[#8a6f00]"
  if (tone === "red") return "bg-[#ffe0e5] text-[#c92034]"
  if (tone === "blue") return "bg-[#e3f0ff] text-[#2263b7]"
  return "bg-[#edf1f1] text-[#687073]"
}

function toneBadge(tone: StatusTone) {
  if (tone === "green") return "bg-[#dcfff6] text-[#007c61]"
  if (tone === "yellow") return "bg-[#fff2c9] text-[#8a6f00]"
  if (tone === "red") return "bg-[#ffe0e5] text-[#c92034]"
  if (tone === "blue") return "bg-[#e3f0ff] text-[#2263b7]"
  return "bg-[#edf1f1] text-[#687073]"
}

function getMerchantResources(rows: typeof merchantRows): Record<Exclude<MerchantSection, "overview" | "settings">, ResourceConfig> { return { venues: { ...merchantResources.venues, rows: rows.venues }, slots: { ...merchantResources.slots, rows: rows.slots }, bookings: { ...merchantResources.bookings, rows: rows.bookings }, finance: { ...merchantResources.finance, rows: rows.finance }, promotions: { ...merchantResources.promotions, rows: rows.promotions }, customers: { ...merchantResources.customers, rows: rows.customers }, reviews: { ...merchantResources.reviews, rows: rows.reviews } } }
function getAdminResources(rows: typeof adminRows): Record<Exclude<AdminSection, "overview" | "settings" | "users" | "venues" | "bookings" | "payments">, ResourceConfig> { return { reports: { ...adminResources.reports, rows: rows.reports }, content: { ...adminResources.content, rows: rows.content } } }


function useOpsDashboard(role: SportcationOpsRole) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(role === "merchant" ? "/api/merchant/dashboard" : "/api/admin/dashboard")
      .then(res => res.json())
      .then(res => { setData(res); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [role]);
  return { data, loading };
}


function mapMerchantDataToRows(data: any) {
  if (!data) return merchantRows;
  return {
    venues: (data.venues || []).map((v: any) => row(v.id, v.name, v.address ?? "No address", v.courts?.length + " courts", v.price ? "Rp " + v.price : "Variable", v.status ?? "Published", "green", v.imageUrl)),
    slots: (data.slots || []).map((s: any) => row(s.id, s.court?.name + " - " + s.startTime, s.venue?.name, new Date(s.slotDate).toLocaleDateString(), "Rp " + s.price, s.status === "booked" ? "Booked" : "Available", s.status === "booked" ? "blue" : "green")),
    bookings: (data.bookings || []).map((b: any) => row(b.id, b.user?.name || "Customer", b.venue?.name, new Date(b.createdAt).toLocaleDateString(), "Rp " + b.totalAmount, b.status, b.status === "confirmed" ? "green" : "yellow")),
    finance: (data.payments || []).map((p: any) => row(p.payment.id, p.payment.method || "Payment", p.venue?.name, p.payment.status, "Rp " + p.payment.amount, p.payment.status, p.payment.status === "paid" ? "green" : "yellow")),
    promotions: data.promotions || merchantRows.promotions,
    customers: data.customers || merchantRows.customers,
    reviews: data.reviews || merchantRows.reviews,
  };
}

function mapAdminDataToRows(data: any) {
  if (!data) return adminRows;
  return {
    users: (data.users || []).map((u: any) => row(u.id, u.name, u.email, u.role, u.status, u.status, u.status === "active" ? "green" : "red")),
    venues: (data.venues || []).map((v: any) => row(v.id, v.name, v.merchant?.businessName || "Merchant", v.status, v.price ? "Rp " + v.price : "Variable", v.status ?? "Published", "green", v.imageUrl)),
    bookings: (data.bookings || []).map((b: any) => row(b.id, b.user?.name || "Customer", b.venue?.name, new Date(b.createdAt).toLocaleDateString(), "Rp " + b.totalAmount, b.status, b.status === "confirmed" ? "green" : "yellow")),
    payments: (data.payments || []).map((p: any) => row(p.id, p.method || "Payment", p.booking?.id, p.status, "Rp " + p.amount, p.status, p.status === "paid" ? "green" : "yellow")),
    reports: data.reports || adminRows.reports,
    content: (data.categories || []).map((c: any) => row(c.id, c.name, "Category", "Active", "N/A", c.isActive ? "Published" : "Draft", c.isActive ? "green" : "yellow"))
  };
}



