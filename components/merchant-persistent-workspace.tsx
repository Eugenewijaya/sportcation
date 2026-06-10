"use client"

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Database,
  Edit3,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Store,
  Trash2,
  X,
} from "lucide-react"

type Resource = "venues" | "slots"
type Notice = { tone: "success" | "error"; message: string } | null

type Category = {
  id: string
  name: string
}

type Court = {
  id: string
  venueId: string
  venueName: string
  name: string
  surface: string | null
  status: string
}

type Venue = {
  id: string
  categoryId: string
  categoryName: string
  name: string
  description: string | null
  address: string
  city: string
  area: string | null
  priceFrom: number
  imageUrl: string | null
  status: "draft" | "review" | "published" | "rejected" | "archived"
  courts: Array<{ id: string; name: string; status: string }>
}

type Slot = {
  id: string
  venueId: string
  venueName: string
  courtId: string
  courtName: string
  slotDate: string
  startTime: string
  endTime: string
  price: number
  status: "available" | "booked" | "blocked" | "expired"
}

type VenueForm = {
  categoryId: string
  name: string
  description: string
  address: string
  city: string
  area: string
  priceFrom: string
  imageUrl: string
  status: Venue["status"]
  defaultCourtName: string
}

type SlotForm = {
  courtId: string
  slotDate: string
  startTime: string
  endTime: string
  price: string
  status: Slot["status"]
}

const emptyVenue: VenueForm = {
  categoryId: "",
  name: "",
  description: "",
  address: "",
  city: "Jakarta",
  area: "",
  priceFrom: "",
  imageUrl: "",
  status: "draft",
  defaultCourtName: "Court 01",
}

const emptySlot: SlotForm = {
  courtId: "",
  slotDate: new Date().toISOString().slice(0, 10),
  startTime: "08:00",
  endTime: "09:00",
  price: "",
  status: "available",
}

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
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

function fetchVenueWorkspaceData() {
  return Promise.all([apiRequest<Venue[]>("/api/venues"), apiRequest<Category[]>("/api/categories")])
}

function fetchSlotWorkspaceData() {
  return Promise.all([apiRequest<Slot[]>("/api/slots"), apiRequest<Court[]>("/api/courts")])
}

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)
}

export function MerchantPersistentWorkspace({
  resource,
  onAction,
}: {
  resource: Resource
  onAction: (message: string) => void
}) {
  return resource === "venues" ? <VenueWorkspace onAction={onAction} /> : <SlotWorkspace onAction={onAction} />
}

function VenueWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VenueForm>(emptyVenue)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [venueData, categoryData] = await fetchVenueWorkspaceData()
      setVenues(venueData)
      setCategories(categoryData)
      setForm((current) => ({ ...current, categoryId: current.categoryId || categoryData[0]?.id || "" }))
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data venue gagal dimuat." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchVenueWorkspaceData()
      .then(([venueData, categoryData]) => {
        if (!active) return
        setVenues(venueData)
        setCategories(categoryData)
        setForm((current) => ({ ...current, categoryId: current.categoryId || categoryData[0]?.id || "" }))
      })
      .catch((error: unknown) => {
        if (active) setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data venue gagal dimuat." })
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
    if (!value) return venues
    return venues.filter((venue) =>
      [venue.name, venue.categoryName, venue.city, venue.area, venue.status].filter(Boolean).join(" ").toLowerCase().includes(value),
    )
  }, [query, venues])

  function resetForm() {
    setEditingId(null)
    setForm({ ...emptyVenue, categoryId: categories[0]?.id || "" })
    setNotice(null)
  }

  function edit(venue: Venue) {
    setEditingId(venue.id)
    setForm({
      categoryId: venue.categoryId,
      name: venue.name,
      description: venue.description || "",
      address: venue.address,
      city: venue.city,
      area: venue.area || "",
      priceFrom: String(venue.priceFrom),
      imageUrl: venue.imageUrl || "",
      status: venue.status,
      defaultCourtName: venue.courts[0]?.name || "Court 01",
    })
    setNotice(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      await apiRequest(editingId ? `/api/venues/${editingId}` : "/api/venues", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          priceFrom: Number(form.priceFrom),
          ...(editingId ? { defaultCourtName: undefined } : {}),
        }),
      })
      const message = editingId ? "Venue berhasil diperbarui." : "Venue dan court awal berhasil dibuat."
      await load()
      resetForm()
      setNotice({ tone: "success", message })
      onAction(message)
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Venue gagal disimpan." })
    } finally {
      setSaving(false)
    }
  }

  async function remove(venue: Venue) {
    if (!window.confirm(`Hapus ${venue.name}? Venue yang sudah memiliki booking akan ditolak oleh server.`)) return
    try {
      await apiRequest(`/api/venues/${venue.id}`, { method: "DELETE" })
      const message = `${venue.name} berhasil dihapus.`
      if (editingId === venue.id) resetForm()
      await load()
      setNotice({ tone: "success", message })
      onAction(message)
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Venue gagal dihapus." })
    }
  }

  return (
    <PersistentShell
      eyebrow="Merchant database"
      title="Venue Catalog"
      subtitle="Venue, kategori, harga, status publikasi, dan court awal tersimpan di SQLite/libSQL."
      query={query}
      onQuery={setQuery}
      onRefresh={() => void load()}
      onCreate={resetForm}
      createLabel="New Venue"
      notice={notice}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ResourceList loading={loading} empty={!filtered.length} emptyLabel="Belum ada venue yang cocok.">
          {filtered.map((venue) => (
            <article key={venue.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(220px,1fr)_125px_auto] xl:items-center xl:px-6">
              <div className="flex min-w-0 items-center gap-4">
                {venue.imageUrl ? (
                  <img src={venue.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                ) : (
                  <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#dcfff6] text-[#007c61]">
                    <Store className="h-8 w-8" />
                  </span>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black">{venue.name}</h3>
                  <p className="mt-1 flex items-center gap-1 truncate text-sm font-semibold text-[#687073]">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {venue.area || venue.city}
                  </p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#9aa1a6]">{venue.categoryName} · {venue.courts.length} court</p>
                </div>
              </div>
              <div>
                <p className="text-lg font-black">{rupiah(venue.priceFrom)}<span className="text-xs text-[#8a9296]">/jam</span></p>
                <Status label={venue.status} />
              </div>
              <div className="flex gap-2">
                <IconAction label={`Edit ${venue.name}`} icon={Edit3} onClick={() => edit(venue)} />
                <IconAction label={`Hapus ${venue.name}`} icon={Trash2} danger onClick={() => void remove(venue)} />
              </div>
            </article>
          ))}
        </ResourceList>

        <form onSubmit={submit} className="h-fit rounded-[30px] bg-white p-6 shadow-sm xl:sticky xl:top-28">
          <FormTitle editing={Boolean(editingId)} entity="Venue" onReset={resetForm} />
          <div className="mt-6 space-y-4">
            <Field label="Venue name" required>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} placeholder="Padel Arena" />
            </Field>
            <Field label="Sport category" required>
              <Select value={form.categoryId} onChange={(value) => setForm({ ...form, categoryId: value })}>
                <option value="">Pilih kategori</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </Select>
            </Field>
            <Field label="Address" required>
              <textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className={`${inputClass} min-h-20 py-3`} placeholder="Alamat lengkap venue" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" required>
                <input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className={inputClass} />
              </Field>
              <Field label="Area">
                <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} className={inputClass} placeholder="Jakarta Selatan" />
              </Field>
            </div>
            <Field label="Base price" required>
              <input type="number" min="0" value={form.priceFrom} onChange={(event) => setForm({ ...form, priceFrom: event.target.value })} className={inputClass} placeholder="350000" />
            </Field>
            {!editingId && (
              <Field label="Initial court" required>
                <input value={form.defaultCourtName} onChange={(event) => setForm({ ...form, defaultCourtName: event.target.value })} className={inputClass} placeholder="Court 01" />
              </Field>
            )}
            <Field label="Image path / URL">
              <input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} className={inputClass} placeholder="/padel-court-modern.jpg" />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={`${inputClass} min-h-24 py-3`} placeholder="Deskripsi singkat venue" />
            </Field>
            <Field label="Publish status">
              <Select value={form.status} onChange={(value) => setForm({ ...form, status: value as Venue["status"] })}>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
            <SaveButton saving={saving} label={editingId ? "Update Venue" : "Create Venue"} />
          </div>
        </form>
      </div>
    </PersistentShell>
  )
}

function SlotWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [courts, setCourts] = useState<Court[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<SlotForm>(emptySlot)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [slotData, courtData] = await fetchSlotWorkspaceData()
      setSlots(slotData)
      setCourts(courtData)
      setForm((current) => ({ ...current, courtId: current.courtId || courtData[0]?.id || "" }))
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data slot gagal dimuat." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchSlotWorkspaceData()
      .then(([slotData, courtData]) => {
        if (!active) return
        setSlots(slotData)
        setCourts(courtData)
        setForm((current) => ({ ...current, courtId: current.courtId || courtData[0]?.id || "" }))
      })
      .catch((error: unknown) => {
        if (active) setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data slot gagal dimuat." })
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
    if (!value) return slots
    return slots.filter((slot) =>
      [slot.venueName, slot.courtName, slot.slotDate, slot.startTime, slot.status].join(" ").toLowerCase().includes(value),
    )
  }, [query, slots])

  function resetForm() {
    setEditingId(null)
    setForm({ ...emptySlot, courtId: courts[0]?.id || "" })
    setNotice(null)
  }

  function edit(slot: Slot) {
    setEditingId(slot.id)
    setForm({
      courtId: slot.courtId,
      slotDate: slot.slotDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      price: String(slot.price),
      status: slot.status,
    })
    setNotice(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setNotice(null)
    try {
      await apiRequest(editingId ? `/api/slots/${editingId}` : "/api/slots", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      })
      const message = editingId ? "Slot berhasil diperbarui." : "Slot berhasil dibuat."
      await load()
      resetForm()
      setNotice({ tone: "success", message })
      onAction(message)
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Slot gagal disimpan." })
    } finally {
      setSaving(false)
    }
  }

  async function remove(slot: Slot) {
    if (!window.confirm(`Hapus slot ${slot.courtName}, ${slot.slotDate} ${slot.startTime}?`)) return
    try {
      await apiRequest(`/api/slots/${slot.id}`, { method: "DELETE" })
      const message = "Slot berhasil dihapus."
      if (editingId === slot.id) resetForm()
      await load()
      setNotice({ tone: "success", message })
      onAction(message)
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Slot gagal dihapus." })
    }
  }

  return (
    <PersistentShell
      eyebrow="Merchant database"
      title="Slot Inventory"
      subtitle="Jadwal, harga, court, dan status slot disimpan secara persisten serta divalidasi untuk mencegah jadwal duplikat."
      query={query}
      onQuery={setQuery}
      onRefresh={() => void load()}
      onCreate={resetForm}
      createLabel="Create Slot"
      notice={notice}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ResourceList loading={loading} empty={!filtered.length} emptyLabel="Belum ada slot yang cocok.">
          {filtered.map((slot) => (
            <article key={slot.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(220px,1fr)_125px_auto] xl:items-center xl:px-6">
              <div className="flex min-w-0 items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#dcfff6] text-[#007c61]">
                  <CalendarClock className="h-7 w-7" />
                </span>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black">{slot.courtName}</h3>
                  <p className="mt-1 truncate text-sm font-semibold text-[#687073]">{slot.venueName}</p>
                  <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#9aa1a6]">{slot.slotDate} · {slot.startTime} - {slot.endTime}</p>
                </div>
              </div>
              <div>
                <p className="text-lg font-black">{rupiah(slot.price)}</p>
                <Status label={slot.status} />
              </div>
              <div className="flex gap-2">
                <IconAction label={`Edit slot ${slot.courtName}`} icon={Edit3} onClick={() => edit(slot)} />
                <IconAction label={`Hapus slot ${slot.courtName}`} icon={Trash2} danger onClick={() => void remove(slot)} />
              </div>
            </article>
          ))}
        </ResourceList>

        <form onSubmit={submit} className="h-fit rounded-[30px] bg-white p-6 shadow-sm xl:sticky xl:top-28">
          <FormTitle editing={Boolean(editingId)} entity="Slot" onReset={resetForm} />
          <div className="mt-6 space-y-4">
            <Field label="Court" required>
              <Select value={form.courtId} onChange={(value) => setForm({ ...form, courtId: value })}>
                <option value="">Pilih court</option>
                {courts.map((court) => <option key={court.id} value={court.id}>{court.venueName} - {court.name}</option>)}
              </Select>
            </Field>
            <Field label="Date" required>
              <input type="date" value={form.slotDate} onChange={(event) => setForm({ ...form, slotDate: event.target.value })} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start" required>
                <input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className={inputClass} />
              </Field>
              <Field label="End" required>
                <input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} className={inputClass} />
              </Field>
            </div>
            <Field label="Price" required>
              <input type="number" min="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className={inputClass} placeholder="350000" />
            </Field>
            <Field label="Availability">
              <Select value={form.status} onChange={(value) => setForm({ ...form, status: value as Slot["status"] })}>
                <option value="available">Available</option>
                <option value="blocked">Blocked</option>
                <option value="expired">Expired</option>
                {editingId && <option value="booked">Booked</option>}
              </Select>
            </Field>
            <SaveButton saving={saving} label={editingId ? "Update Slot" : "Create Slot"} />
          </div>
        </form>
      </div>
    </PersistentShell>
  )
}

function PersistentShell({
  eyebrow,
  title,
  subtitle,
  query,
  onQuery,
  onRefresh,
  onCreate,
  createLabel,
  notice,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  query: string
  onQuery: (value: string) => void
  onRefresh: () => void
  onCreate: () => void
  createLabel: string
  notice: Notice
  children: React.ReactNode
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
            <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-[#687073]">{subtitle}</p>
          </div>
          <button type="button" onClick={onCreate} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#008f71] to-[#49e7ba] px-5 text-sm font-black uppercase tracking-[0.12em] text-white">
            <Plus className="h-5 w-5" />
            {createLabel}
          </button>
        </div>
        <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex h-13 items-center gap-3 rounded-2xl bg-[#edf1f1] px-4">
            <Search className="h-5 w-5 text-[#798186]" />
            <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#9ca3a7]" />
          </label>
          <button type="button" onClick={onRefresh} title="Refresh database records" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#071413] px-5 text-sm font-black text-white">
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
        </div>
      </section>
      {notice && <NoticeBanner notice={notice} />}
      {children}
    </div>
  )
}

function ResourceList({ loading, empty, emptyLabel, children }: { loading: boolean; empty: boolean; emptyLabel: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
      {loading ? (
        <div className="grid min-h-72 place-items-center p-8 text-center">
          <div>
            <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[#008f71]" />
            <p className="mt-3 font-black">Loading database records...</p>
          </div>
        </div>
      ) : empty ? (
        <div className="grid min-h-72 place-items-center p-8 text-center">
          <div>
            <Database className="mx-auto h-10 w-10 text-[#9aa1a6]" />
            <p className="mt-3 font-black">{emptyLabel}</p>
            <p className="mt-1 text-sm font-semibold text-[#7d8589]">Gunakan form di samping untuk menambahkan data.</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#edf1f1]">{children}</div>
      )}
    </section>
  )
}

function NoticeBanner({ notice }: { notice: Exclude<Notice, null> }) {
  const Icon = notice.tone === "success" ? CheckCircle2 : AlertCircle
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${notice.tone === "success" ? "border-[#b8f3df] bg-[#eafff8] text-[#007c61]" : "border-[#ffd1d5] bg-[#fff0f1] text-[#c11f32]"}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      {notice.message}
    </div>
  )
}

function FormTitle({ editing, entity, onReset }: { editing: boolean; entity: string; onReset: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">{editing ? "Edit record" : "Create record"}</p>
        <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">{editing ? `Update ${entity}` : `New ${entity}`}</h3>
      </div>
      {editing && <IconAction label="Cancel edit" icon={X} onClick={onReset} />}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">{label}{required ? " *" : ""}</span>
      {children}
    </label>
  )
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <span className="relative mt-2 block">
      <select value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#747c80]" />
    </span>
  )
}

function SaveButton({ saving, label }: { saving: boolean; label: string }) {
  return (
    <button type="submit" disabled={saving} className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#008f71] to-[#49e7ba] text-sm font-black uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-60">
      {saving ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />}
      {saving ? "Saving..." : label}
    </button>
  )
}

function IconAction({ label, icon: Icon, danger, onClick }: { label: string; icon: typeof Edit3; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" title={label} aria-label={label} onClick={onClick} className={`grid h-10 w-10 place-items-center rounded-xl transition hover:-translate-y-0.5 ${danger ? "bg-[#fff0f1] text-[#c11f32]" : "bg-[#edf1f1] text-[#596165]"}`}>
      <Icon className="h-4.5 w-4.5" />
    </button>
  )
}

function Status({ label }: { label: string }) {
  const color = label === "published" || label === "available"
    ? "bg-[#dcfff6] text-[#007c61]"
    : label === "booked" || label === "review"
      ? "bg-[#e5efff] text-[#2c64a7]"
      : label === "rejected"
        ? "bg-[#fff0f1] text-[#c11f32]"
        : "bg-[#f1f2f2] text-[#646c70]"
  return <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.1em] ${color}`}>{label}</span>
}

const inputClass = "mt-2 h-12 w-full rounded-2xl border-0 bg-[#edf1f1] px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#49e7ba]"
