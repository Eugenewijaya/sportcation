"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { AdminUserDirectoryWorkspace, AdminVenueModerationWorkspace } from "@/components/admin-directory-workspace"
import { AdminBookingReviewWorkspace, AdminPaymentReviewWorkspace } from "@/components/admin-review-workspace"
import { AdminFinanceWorkspace } from "@/components/admin-finance-workspace"
import { AdminMerchantVerificationWorkspace } from "@/components/admin-merchants-workspace"
import { AdminReportsWorkspace } from "@/components/admin-reports-workspace"
import { AdminBannersWorkspace } from "@/components/admin-banners-workspace"
import { MerchantBookingWorkspace } from "@/components/merchant-booking-workspace"
import { MerchantFinanceWorkspace } from "@/components/merchant-finance-workspace"
import { MerchantPersistentWorkspace } from "@/components/merchant-persistent-workspace"
import { MerchantPosWorkspace } from "@/components/merchant-pos-workspace"
import { OpsAccountControls } from "@/components/ops-account-controls"
import {
  Activity,
  Banknote,
  BarChart3,
  Bell,
  CalendarClock,
  Calculator,
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
  Clock,
  HelpCircle,
  Landmark,
  type LucideIcon,
} from "lucide-react"

export type SportcationOpsRole = "merchant" | "admin"

export type MerchantSection = "overview" | "venues" | "slots" | "bookings" | "pos" | "finance" | "promotions" | "customers" | "reviews" | "settings" | "verification"
export type AdminSection = "overview" | "users" | "venues" | "bookings" | "payments" | "finance" | "reports" | "content" | "settings" | "merchants" | "banners"
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
  { section: "pos", label: "POS", href: "/merchant/pos", icon: Calculator },
  { section: "finance", label: "Finance", href: "/merchant/finance", icon: Wallet },
  { section: "promotions", label: "Promotions", href: "/merchant/promotions", icon: Tag },
  { section: "customers", label: "Customers", href: "/merchant/customers", icon: Users },
  { section: "reviews", label: "Reviews", href: "/merchant/reviews", icon: Star },
  { section: "settings", label: "Settings", href: "/merchant/settings", icon: Settings },
  { section: "verification", label: "Verification", href: "/merchant/verification", icon: ShieldCheck },
]

const adminNav: NavItem[] = [
  { section: "overview", label: "Command", href: "/admin", icon: LayoutDashboard },
  { section: "users", label: "Users", href: "/admin/users", icon: Users },
  { section: "venues", label: "Venues", href: "/admin/venues", icon: Store },
  { section: "merchants", label: "Verifikasi Mitra", href: "/admin/merchants", icon: ShieldCheck },
  { section: "banners", label: "Banners", href: "/admin/banners", icon: Tag },
  { section: "bookings", label: "Bookings", href: "/admin/bookings", icon: Ticket },
  { section: "payments", label: "Payments", href: "/admin/payments", icon: CreditCard },
  { section: "finance", label: "Finance", href: "/admin/finance", icon: Landmark },
  { section: "reports", label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { section: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
]

const merchantStats: StatCard[] = [
  { label: "Pendapatan Bulan Ini", value: "Rp 42.5M", helper: "Naik 12% dari bulan lalu", icon: TrendingUp, tone: "green" },
  { label: "Lapangan Aktif", value: "8", helper: "Semua lapangan beroperasi", icon: Store, tone: "blue" },
  { label: "Booking Hari Ini", value: "142", helper: "28 menunggu konfirmasi", icon: Ticket, tone: "yellow" },
  { label: "Siap Dicairkan", value: "Rp 12.4M", helper: "Dijadwalkan besok", icon: Banknote, tone: "green" },
]

const adminStats: StatCard[] = [
  { label: "Total GMV Platform", value: "Rp 1.2B", helper: "Bulan Mei 2026", icon: TrendingUp, tone: "green" },
  { label: "Pengguna Aktif", value: "12,482", helper: "+420 minggu ini", icon: Users, tone: "blue" },
  { label: "Verifikasi Tertunda", value: "12", helper: "Venue baru mendaftar", icon: ShieldCheck, tone: "yellow" },
  { label: "Status Sistem", value: "Normal", helper: "Uptime 99.9%", icon: Activity, tone: "green" },
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

const merchantResources: Record<Exclude<MerchantSection, "overview" | "settings" | "pos" | "verification">, ResourceConfig> = {
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

const adminResources: Record<Exclude<AdminSection, "overview" | "settings" | "finance" | "merchants" | "banners" | "reports">, ResourceConfig> = {
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
  const [actionMessage, setActionMessage] = useState("")

  const roleTitle = role === "merchant" ? "Merchant Studio" : "Admin Command"
  const roleSubtitle =
    role === "merchant"
      ? "Kelola venue, jadwal, pesanan, dan pencairan dana."
      : "Kelola pengguna, venue, pembayaran, laporan, dan konten."

  return (
    <main className="min-h-screen bg-[#faf9f6] text-foreground">
      <div className="lg:flex">
        <OpsSidebar role={role} nav={nav} active={normalizedSection as SportcationOpsSection} />
        <section className="min-h-screen flex-1 lg:pl-[260px]">
          <OpsTopBar role={role} title={roleTitle} subtitle={roleSubtitle} />
          <div className="mx-auto w-full max-w-[430px] px-5 py-2 lg:max-w-none lg:px-8">
            <MobileOpsNav nav={nav} active={normalizedSection as SportcationOpsSection} />
            {actionMessage && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 lg:hidden">
                <CheckCircle2 className="h-4 w-4" />
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
    if (section === "pos") return <MerchantPosWorkspace onAction={onAction} />
    return <CrudWorkspace config={getMerchantResources(merchantRows)[section as keyof ReturnType<typeof getMerchantResources>]} role="merchant" onAction={onAction} />
  }

  if (section === "overview") return <AdminOverview onAction={onAction} adminRows={adminRows} />
  if (section === "settings") return <SettingsWorkspace role="admin" onAction={onAction} />
  if (section === "users") return <AdminUserDirectoryWorkspace onAction={onAction} />
  if (section === "venues") return <AdminVenueModerationWorkspace onAction={onAction} />
  if (section === "merchants") return <AdminMerchantVerificationWorkspace onAction={onAction} />
  if (section === "reports") return <AdminReportsWorkspace onAction={onAction} />
  if (section === "bookings") return <AdminBookingReviewWorkspace onAction={onAction} />
  if (section === "payments") return <AdminPaymentReviewWorkspace onAction={onAction} />
  if (section === "finance") return <AdminFinanceWorkspace onAction={onAction} />
  if (section === "content") return <AdminBannersWorkspace onAction={onAction} />
  if (section === "banners") return <AdminBannersWorkspace onAction={onAction} />
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
    <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col border-r border-border bg-[#faf9f6] px-4 py-6 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 px-2 font-bold text-foreground">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#f25f22] text-white">
          <Database className="h-4 w-4" />
        </div>
        <span className="text-lg tracking-tight">Sportcation</span>
      </Link>
      
      <div className="flex-1 overflow-y-auto sportcation-scrollbar -mx-2 px-2">
        <nav className="space-y-1">
          {nav.map((item) => (
            <OpsNavLink key={item.href} item={item} active={active === item.section} />
          ))}
        </nav>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <div className="rounded-xl bg-orange-50/50 p-4 border border-orange-100">
          <h4 className="flex items-center gap-2 text-sm font-bold text-foreground"><Star className="h-3.5 w-3.5 text-[#f25f22]" /> Upgrade ke Pro</h4>
          <p className="mt-1 text-xs text-muted-foreground">Dapatkan wawasan & prediksi AI</p>
          <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-2.5 text-xs font-bold text-white transition hover:bg-zinc-800">
            Coba gratis 1 bulan
          </button>
        </div>
        
        <div className="mt-6 flex items-center justify-between rounded-xl bg-white p-2 shadow-sm border border-border">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f25f22] text-sm font-bold text-white">
              S
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Superadmin</p>
              <p className="text-[10px] text-muted-foreground">Sportcation Ops</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
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
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all",
        active ? "bg-[#f25f22] text-white shadow-sm shadow-orange-500/20" : "text-muted-foreground hover:bg-black/5 hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={cx("h-4 w-4", active ? "text-white" : "text-muted-foreground")} />
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
    <header className="flex h-[88px] items-center justify-between gap-4 bg-transparent px-5 lg:px-8">
      <div className="flex flex-1 items-center justify-center">
        <div className="relative hidden w-full max-w-2xl lg:block">
          <input 
            type="text" 
            placeholder="Cari venue, nama pemesan, atau ID booking..." 
            className="h-12 w-full rounded-full border border-border bg-white px-6 text-sm shadow-sm outline-none transition focus:border-zinc-300 focus:ring-2 focus:ring-zinc-100"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f25f22]"></span>
          Saturday, May 12 2026
        </div>
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-muted-foreground shadow-sm transition hover:bg-muted/50">
            <Megaphone className="h-4 w-4" />
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-border bg-white text-muted-foreground shadow-sm transition hover:bg-muted/50 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#f25f22] ring-2 ring-white"></span>
          </button>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
           <button className="h-10 rounded-full bg-white border border-border px-4 text-sm font-semibold shadow-sm hover:bg-muted/50">
             Export Laporan
           </button>
           <button className="h-10 rounded-full bg-[#f25f22] px-4 text-sm font-semibold text-white shadow-sm shadow-orange-500/20 hover:bg-[#ea580c] flex items-center gap-2">
             <Plus className="h-4 w-4" /> Booking Baru
           </button>
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
        <Link href="/" className="font-semibold italic tracking-[-0.05em]">
          <img src="/logo.png" alt="Sportcation" className="h-8 w-auto" />
        </Link>
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
                "flex min-w-fit items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
                selected ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-muted-foreground border border-border",
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

function AdminOverview({ onAction, adminRows }: { onAction: (message: string) => void; adminRows: any }) {
  return <AthenaeumOverview role="admin" onAction={onAction} />
}

function MerchantOverview({ onAction, merchantRows }: { onAction: (message: string) => void; merchantRows: any }) {
  return <AthenaeumOverview role="merchant" onAction={onAction} />
}

function AthenaeumOverview({ role, onAction }: { role: SportcationOpsRole, onAction: (message: string) => void }) {
  const [stats, setStats] = useState<StatCard[]>(role === "admin" ? adminStats : merchantStats)
  
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">Platform Anda sedang ramai — <span className="font-bold text-foreground">728 pengguna aktif</span> saat ini melihat-lihat lapangan.</p>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {/* Peak Traffic */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">Jam Sibuk Lapangan <span className="text-[10px] font-bold uppercase tracking-wider text-[#f25f22] flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Puncak 19:00</span></h3>
                <p className="mt-1 text-xs text-muted-foreground">Tingkat hunian lapangan sepanjang hari - 3,145 booking hari ini</p>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-border p-1 text-xs font-medium shadow-sm">
                <button className="rounded-full bg-white px-4 py-1.5 shadow-sm border border-border font-bold text-foreground">Hari</button>
                <button className="rounded-full px-4 py-1.5 text-muted-foreground hover:bg-muted/50">Minggu</button>
                <button className="rounded-full px-4 py-1.5 text-muted-foreground hover:bg-muted/50">Bulan</button>
              </div>
            </div>
            <div className="mt-8 flex items-end justify-between gap-2 h-48 border-b border-border pb-4">
               {[10, 20, 30, 45, 50, 60, 70, 90, 100, 80, 50, 40].map((h, i) => (
                  <div key={i} className="w-full relative flex flex-col justify-end group h-full">
                    <div style={{ height: `${h}%` }} className={cx("w-full rounded-t-md", h > 80 ? "bg-gradient-to-t from-[#ea580c] to-[#fd8444]" : "bg-[#f25f22]/30 group-hover:bg-[#f25f22]/50 transition-colors")} />
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center text-[10px] font-semibold text-muted-foreground">{i + 8}a</span>
                  </div>
               ))}
            </div>
          </div>

          {/* Most Popular */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-foreground">{role === "admin" ? "Venue" : "Lapangan"} Terpopuler</h3>
                <p className="mt-1 text-xs text-muted-foreground">Peringkat berdasarkan jumlah booking bulan ini</p>
              </div>
              <button className="text-xs font-bold text-[#f25f22] flex items-center gap-1 hover:underline">Lihat semua <ChevronRight className="h-3 w-3" /></button>
            </div>
            <div className="space-y-6">
              {[
                { name: "Padel Arena - Court 1", sub: "Kebayoran Baru", count: 412, color: "bg-gradient-to-br from-orange-400 to-red-500", w: "w-full" },
                { name: "Elite Tennis SCBD", sub: "Sudirman", count: 389, color: "bg-gradient-to-br from-emerald-400 to-teal-500", w: "w-[90%]" },
                { name: "Metro Futsal Hub", sub: "Senopati", count: 356, color: "bg-gradient-to-br from-amber-400 to-orange-500", w: "w-[85%]" },
                { name: "Vantage Padel", sub: "Kemang", count: 321, color: "bg-gradient-to-br from-pink-400 to-rose-500", w: "w-[75%]" },
                { name: "Urban Drive Range", sub: "Setiabudi", count: 298, color: "bg-gradient-to-br from-blue-400 to-indigo-500", w: "w-[70%]" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <span className="w-5 text-xs text-muted-foreground font-semibold">0{i + 1}</span>
                  <div className={cx("h-10 w-10 shrink-0 rounded-xl shadow-sm", item.color)} />
                  <div className="w-48 min-w-0">
                    <p className="truncate font-bold text-foreground">{item.name}</p>
                    <p className="truncate text-xs font-medium text-muted-foreground">{item.sub}</p>
                  </div>
                  <div className="hidden sm:block">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">Sports</span>
                  </div>
                  <div className="flex-1 px-4">
                    <div className="h-2 w-full rounded-full bg-orange-50">
                      <div className={cx("h-full rounded-full bg-[#f25f22]", item.w)} />
                    </div>
                  </div>
                  <div className="w-16 text-right font-bold text-foreground flex items-center justify-end gap-2">
                    {item.count} <TrendingUp className="h-3 w-3 text-emerald-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Revenue by Source */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground">Sumber Pendapatan</h3>
                <p className="mt-1 text-xs text-muted-foreground">Bulan ini • Semua channel</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-600">+8.7%</span>
            </div>
            
            <div className="my-10 flex justify-center">
              <div className="relative h-40 w-40 rounded-full border-[16px] border-[#f25f22] border-r-[#3b82f6] border-b-[#8b5cf6] border-l-[#f97316]">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold text-muted-foreground">Total Pendapatan</span>
                  <span className="text-xl font-black">Rp 800M</span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {[
                { label: "Sewa Lapangan", pct: "60.3%", val: "Rp 482M", color: "bg-[#f97316]" },
                { label: "Membership", pct: "21.0%", val: "Rp 168M", color: "bg-[#fb923c]" },
                { label: "Kantin & FnB", pct: "11.6%", val: "Rp 94M", color: "bg-[#3b82f6]" },
                { label: "Event/Turnamen", pct: "7.0%", val: "Rp 56M", color: "bg-[#8b5cf6]" },
              ].map((src, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className={cx("h-8 w-1.5 rounded-full", src.color)} />
                    <div>
                      <p className="font-bold text-foreground">{src.label}</p>
                      <p className="text-[10px] font-medium text-muted-foreground">{src.pct} of total</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground">{src.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Items */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-foreground">Tugas Aktif</h3>
                <p className="mt-1 text-xs text-muted-foreground">Perlu penyelesaian • 280 item</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-orange-200 bg-orange-50 text-[#f25f22]">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-[#fd8444] to-[#f25f22] p-6 text-white shadow-md">
              <p className="text-xs font-semibold text-white/90">Menunggu Pembayaran</p>
              <p className="mt-1 text-3xl font-black">12 Booking</p>
              <div className="mt-6 flex items-center justify-between text-[10px]">
                <div>
                  <p className="font-bold">Hari ini</p>
                  <p className="font-medium text-white/80">8 booking</p>
                </div>
                <div>
                  <p className="font-bold">Besok</p>
                  <p className="font-medium text-white/80">3 booking</p>
                </div>
                <div>
                  <p className="font-bold">Minggu ini</p>
                  <p className="font-medium text-white/80">1 booking</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-white/20 flex overflow-hidden">
                <div className="h-full bg-white w-[70%]" />
                <div className="h-full bg-white/70 w-[20%]" />
                <div className="h-full bg-white/40 w-[10%]" />
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center justify-between text-xs font-bold text-foreground mb-4">
                <span>Konfirmasi Manual</span>
                <button className="text-[#f25f22] flex items-center gap-1 hover:underline"><Megaphone className="h-3 w-3" /> Ingatkan</button>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 text-xs font-bold text-[#f25f22]">AR</div>
                  <div>
                    <p className="font-bold text-foreground">Andi Rahman</p>
                    <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Padel Arena, 19:00</p>
                  </div>
                </div>
                <span className="font-bold text-foreground">Rp 1.25M</span>
              </div>
            </div>
          </div>
        </div>
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
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 p-6 text-white shadow-md lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-300">{label}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight lg:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-emerald-100 lg:text-base">{body}</p>
        </div>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
        >
          <Plus className="h-4 w-4" />
          {action}
        </button>
      </div>
    </section>
  )
}

export function StatsGrid({ stats }: { stats: StatCard[] }) {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        const isPrimary = i === 0
        const isDown = i === 2
        return (
          <article key={stat.label} className={cx("relative overflow-hidden rounded-3xl p-6 shadow-sm border", isPrimary ? "border-transparent bg-gradient-to-br from-[#fd8444] to-[#ea580c] text-white" : "border-border bg-white")}>
            <div className="flex items-start justify-between">
              <div className={cx("grid h-10 w-10 place-items-center rounded-xl", isPrimary ? "bg-white/20 text-white" : "bg-orange-50 border border-orange-100 text-[#ea580c]")}>
                {stat.icon && <stat.icon className="h-5 w-5" />}
              </div>
              <div className={cx("flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold shadow-sm", isPrimary ? "bg-white/20 text-white" : isDown ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                <TrendingUp className={cx("h-3 w-3", isDown && "rotate-180")} />
                {isDown ? "-3.2%" : "+12.4%"}
              </div>
            </div>
            <p className={cx("mt-6 text-xs font-semibold", isPrimary ? "text-white/90" : "text-muted-foreground")}>{stat.label}</p>
            <h3 className={cx("mt-1 text-3xl font-black tracking-tight", isPrimary ? "text-white" : "text-foreground")}>{stat.value}</h3>
            <p className={cx("mt-1 text-[10px] font-medium", isPrimary ? "text-white/80" : "text-muted-foreground")}>{stat.helper}</p>
            <div className="absolute bottom-0 left-0 right-0 h-16 w-full opacity-60">
              <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-full w-full">
                <path d={isDown ? "M0,5 Q25,20 50,10 T100,20" : "M0,20 Q25,5 50,15 T100,5"} fill="none" stroke={isPrimary ? "rgba(255,255,255,0.5)" : "url(#grad)"} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
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
    onAction(`${action}: ${item?.primary ?? config.entityName}`)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{config.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{config.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => trigger("Tambah")}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              {config.createLabel}
            </button>
            <button type="button" onClick={() => onAction("Aksi massal")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/50">
              <SlidersHorizontal className="h-4 w-4" />
              Aksi Massal
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <label className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Cari ${config.entityName}...`}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <button type="button" onClick={() => onAction("Filter aktif")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/50">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button type="button" onClick={() => onAction("Export data")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-white px-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/50">
            <FileText className="h-4 w-4" />
            Export
          </button>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-5 py-3">
            <p className="text-sm text-muted-foreground">{filteredRows.length} data ditemukan</p>
          </div>
          <div className="divide-y divide-border">
            {filteredRows.map((item) => (
              <article key={item.id} className="grid gap-3 px-5 py-4 hover:bg-muted/30 transition-colors lg:grid-cols-[minmax(260px,1fr)_140px_150px_auto] lg:items-center">
                <button type="button" onClick={() => trigger("Detail", item)} className="flex min-w-0 items-center gap-3 text-left hover:opacity-80 transition-opacity">
                  {item.image ? (
                    <img src={item.image} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-sm" />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm">
                      <Database className="h-5 w-5" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight text-foreground">{item.primary}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.secondary}</span>
                  </span>
                </button>
                <p className="text-sm text-muted-foreground truncate">{item.meta}</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.metric}</p>
                  <div className="mt-1">
                    <StatusBadge label={item.status} tone={item.statusTone} />
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <IconButton label="Edit" icon={Edit3} onClick={() => trigger("Edit", item)} />
                  <IconButton label="Arsip" icon={LockKeyhole} onClick={() => trigger("Arsip", item)} />
                  <IconButton label="Hapus" icon={Trash2} danger onClick={() => trigger("Hapus", item)} />
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
    <aside className="rounded-2xl border border-border bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:h-fit">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left">
        <span>
          <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Detail</span>
          <span className="mt-1 block text-lg font-semibold">{selected.primary}</span>
        </span>
        <ChevronRight className={cx("h-5 w-5 text-[#8f979c] transition", open && "rotate-90")} />
      </button>
      {open && (
        <div className="mt-6 space-y-4">
          {config.formFields.map((field) => (
            <label key={field.label} className="block">
              <span className="text-xs font-medium text-muted-foreground">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea className="mt-1.5 min-h-20 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500" placeholder={field.placeholder} />
              ) : (
                <input
                  type={field.type === "number" ? "number" : "text"}
                  className="mt-1.5 h-9 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  placeholder={field.placeholder}
                />
              )}
            </label>
          ))}
          <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold leading-relaxed text-primary">
            {config.helper}
          </div>
          <button
            type="button"
            onClick={() => onAction(`Simpan ${config.entityName}`)}
            className="h-9 w-full rounded-lg bg-emerald-600 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Simpan
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
    <section className="min-w-0 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        <button type="button" onClick={() => onAction("Queue filter ready")} className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition hover:bg-muted/50">
          Latest
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((item) => (
          <button key={item.id} type="button" onClick={() => onAction(`Open ${item.id}`)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-transparent bg-muted/50 p-4 text-left transition hover:border-border hover:bg-white hover:shadow-sm">
            <span className="min-w-0">
              <span className="block truncate font-semibold text-foreground">{item.primary}</span>
              <span className="block truncate text-sm text-muted-foreground">{item.secondary}</span>
            </span>
            <span className="text-right">
              <span className="block font-semibold text-foreground">{item.metric}</span>
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
    <section className="min-w-0 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span className="text-sm text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
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
      <section className="rounded-3xl bg-white p-6 shadow-sm lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{role} settings</p>
        <h2 className="mt-3 text-4xl font-semibold tracking-[-0.07em] lg:text-5xl">Settings & Access Control</h2>
        <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-muted-foreground">
          Settings UI is prepared for role-based permissions, server validation, audit logging, and Drizzle-backed persistence.
        </p>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        {sections.map(([title, body], index) => (
          <article key={title} className="rounded-[28px] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dcfff6] text-primary">
                {index === 0 ? <UserCog className="h-6 w-6" /> : index === 1 ? <ShieldCheck className="h-6 w-6" /> : index === 2 ? <Settings className="h-6 w-6" /> : <Database className="h-6 w-6" />}
              </span>
              <button type="button" onClick={() => onAction(`Open ${title} settings`)} className="rounded-full bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Configure
              </button>
            </div>
            <h3 className="mt-5 text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-muted-foreground">{body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span className={cx("mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", toneBadge(tone))}>
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
        danger ? "bg-[#ffe9ec] text-[#c92034] hover:bg-[#ffd9df]" : "bg-muted text-[#5f666a] hover:bg-[#dcfff6] hover:text-primary",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function toneBg(tone: StatusTone) {
  if (tone === "green") return "bg-[#dcfff6] text-primary"
  if (tone === "yellow") return "bg-[#fff2c9] text-[#8a6f00]"
  if (tone === "red") return "bg-[#ffe0e5] text-[#c92034]"
  if (tone === "blue") return "bg-[#e3f0ff] text-[#2263b7]"
  return "bg-muted text-muted-foreground"
}

function toneBadge(tone: StatusTone) {
  if (tone === "green") return "bg-[#dcfff6] text-primary"
  if (tone === "yellow") return "bg-[#fff2c9] text-[#8a6f00]"
  if (tone === "red") return "bg-[#ffe0e5] text-[#c92034]"
  if (tone === "blue") return "bg-[#e3f0ff] text-[#2263b7]"
  return "bg-muted text-muted-foreground"
}

function getMerchantResources(rows: typeof merchantRows): Record<Exclude<MerchantSection, "overview" | "settings" | "pos" | "verification">, ResourceConfig> { return { venues: { ...merchantResources.venues, rows: rows.venues }, slots: { ...merchantResources.slots, rows: rows.slots }, bookings: { ...merchantResources.bookings, rows: rows.bookings }, finance: { ...merchantResources.finance, rows: rows.finance }, promotions: { ...merchantResources.promotions, rows: rows.promotions }, customers: { ...merchantResources.customers, rows: rows.customers }, reviews: { ...merchantResources.reviews, rows: rows.reviews } } }
function getAdminResources(rows: typeof adminRows): Record<Exclude<AdminSection, "overview" | "settings" | "users" | "venues" | "bookings" | "payments" | "finance" | "merchants" | "banners" | "reports">, ResourceConfig> { return { content: { ...adminResources.content, rows: rows.content } } }


function useOpsDashboard(role: SportcationOpsRole) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // ponytail: hit the API service instead of current origin, send cookies for auth
    fetch(`${role === "merchant" ? "/api/merchant/dashboard" : "/api/admin/dashboard"}`, { credentials: "include" })
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






