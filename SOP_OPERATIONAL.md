# SOP Operasional & Prosedural Detail Sportcation

Dokumen ini adalah panduan prosedural langkah demi langkah (SOP) komprehensif. Dokumen ini wajib dipatuhi oleh seluruh jajaran staf (Operasional, Customer Service, Keuangan, Manajemen, dan IT) guna menjamin kelancaran, keamanan, dan keandalan operasional *marketplace* penyewaan fasilitas olahraga Sportcation.

---

## Bab 1: Prosedur Pendaftaran & Verifikasi Merchant (Mitra)
**Tujuan**: Memastikan hanya entitas legal, pemilik asli, atau individu tervalidasi yang dapat membuka penyewaan lapangan di platform Sportcation guna meminimalisir penipuan (*fraud*).
**PIC Utama**: Admin Operasional (Ops)

**Prosedur Eksekusi**:
1. **Registrasi**: Merchant mengisi data awal (Nama, Email, Password, NIK/NPWP entitas) melalui portal *Merchant Registration*.
2. **Monitoring Harian**: Admin Ops wajib membuka URL Dashboard Admin `(tab Verifikasi Merchant)` minimal 2 (dua) kali sehari (Pukul 09:00 WIB dan 14:00 WIB).
3. **Pengecekan Dokumen**:
   - Klik ID/Nama Merchant yang berstatus `pending_verification`.
   - Lakukan pencocokan (silang-cek) antara data teks yang di-input dengan file foto KTP/NPWP yang diunggah.
   - Periksa konsistensi Nama Akun dengan Nama Rekening Bank yang digunakan.
4. **Validasi & Keputusan**:
   - **Kondisi Valid**: Jika foto tajam, terbaca jelas, dan data cocok -> Admin menekan tombol **`Approve`**. Sistem otomatis mengubah status menjadi `active` dan mengirimkan notifikasi *email/WhatsApp* sambutan.
   - **Kondisi Invalid**: Jika dokumen buram, palsu, atau nama tidak sinkron -> Admin menekan tombol **`Reject`**. *Wajib* mengisi kolom catatan alasan spesifik (misal: "Foto KTP terpotong, mohon unggah ulang").
   - **Kondisi Mencurigakan**: Hubungi nomor telepon pendaftar untuk verifikasi lisan singkat sebelum mengambil keputusan.

---

## Bab 2: Prosedur Pengelolaan Ketersediaan Lapangan (Oleh Merchant)
**Tujuan**: Menjaga integritas jadwal (ketersediaan) secara *real-time* dan menghindari insiden bentrok pesanan (*double booking*).
**PIC Utama**: Merchant (Diawasi oleh Admin Ops)

**Prosedur Eksekusi**:
1. **Pengaturan Awal Venue**: Merchant yang telah tervalidasi wajib masuk ke menu `My Venues`, menekan `Add Venue`, lalu melengkapi Foto HD, Deskripsi, Fasilitas (Parkir, Toilet, dll), serta Peraturan Khusus Lapangan.
2. **Pengaturan Blok Waktu (*Time-Slots*)**:
   - Merchant mengatur slot ketersediaan (contoh: blok per jam 08:00 - 09:00).
   - Merchant diwajibkan melakukan penyesuaian harga (contoh: tarif *Peak Hour* sore hari dibandingkan tarif *Regular* pagi hari).
3. **Tindakan Darurat Penutupan (Maintenance/Cuaca Buruk)**:
   - Jika lapangan terendam banjir atau sedang diperbaiki, merchant **WAJIB SECARA AKTIF** masuk ke kalender dan melakukan `Block Slot` sebelum dibeli pelanggan.
   - Jika slot sudah terlanjur dibayar, merchant **WAJIB** segera melapor ke CS Sportcation untuk inisiasi pembatalan dan masuk ke dalam sanksi denda performa (SP1).

---

## Bab 3: Prosedur Transaksi & Pembayaran Otomatis
**Tujuan**: Melayani alur transaksi secara *end-to-end* yang kedap kesalahan.
**PIC Utama**: Automasi Sistem IT & Payment Gateway (Bayar.gg)

**Prosedur Eksekusi**:
1. **Booking (*Locking*)**: Customer memilih slot jadwal lalu klik `Book`. Sistem mengunci jadwal tersebut selama 15 menit (status *pending/locked*) agar tidak bisa dipesan orang lain.
2. **Invoicing**: Sistem mengirim payload *invoice* ke *Payment Gateway* Bayar.gg. QRIS/Virtual Account langsung tertampil kepada customer.
3. **Konfirmasi Real-Time**: 
   - Jika customer membayar, *Webhook* Bayar.gg mengirim sinyal `SUCCESS`. Sistem langsung menerbitkan e-Tiket kepada *Customer* dan merilis jadwal ke Merchant.
4. **Kedaluwarsa (Expired)**:
   - Jika 15 menit berlalu tanpa pembayaran, server (lewat proses *Vercel Cron-Job* rutin `expire-pending`) secara otomatis akan menggugurkan transaksi tersebut dan jadwal lapangan dikembalikan sebagai *Available* di katalog publik.

---

## Bab 4: Prosedur Pembatalan, Refund, dan Resolusi Sengketa (Dispute)
**Tujuan**: Perlindungan finansial konsumen serta penegakan hukum anti-*fraud* pada merchant nakal.
**PIC Utama**: Admin Customer Service (CS) & Admin Finance

**Prosedur Eksekusi**:
1. **Penerimaan Laporan**: Pelanggan yang datang ke lokasi namun lapangan tutup/dipakai orang lain wajib melapor via *Call Center* / WA CS maksimal H+1.
2. **Pembekuan Dana (*Hold Settlement*)**: 
   - CS masuk ke dasbor, mencari ID Booking (`BKG-XXX`).
   - CS segera menekan tombol/merubah status menjadi `DISPUTED`. Hal ini akan mencegah uang transaksi diteruskan ke saldo *Withdrawal* merchant.
3. **Investigasi & Mediasi (SLA 2x24 Jam)**:
   - CS menelepon pengelola lapangan (merchant). 
   - **Keputusan A (Merchant Terbukti Salah)**:
     - CS mengubah status tiket menjadi `APPROVED_REFUND`.
     - Admin Finance mentransfer 100% dana kembali secara manual ke rekening *Customer*.
     - CS mengunggah bukti transfer, dan Admin Ops mencatatkan teguran (Penalti/SP1) di riwayat merchant.
   - **Keputusan B (Customer Terbukti Salah / Telat Hadir)**:
     - CS menolak pengajuan Dispute. Status dikembalikan ke `Completed`, dana diteruskan menjadi hak merchant.

---

## Bab 5: Prosedur Pencairan Dana Pendapatan (Withdrawal) Merchant
**Tujuan**: Distribusi pendapatan (*settlement*) yang terpantau, direkonsiliasi, dan transparan.
**PIC Utama**: Admin Keuangan (Finance)

**Prosedur Eksekusi**:
1. **Pengajuan**: Merchant meminta pencairan dari menu `Finance` di portal mereka (saldo yang bisa ditarik adalah saldo transaksi yang sudah selesai lewat masa tenggang). Masuk ke antrean `pending_withdrawal`.
2. **Cut-Off Operasional**: Pukul 14:00 WIB (Senin - Jumat), Admin Finance membuka menu Dasbor Admin `Withdrawals`.
3. **Verifikasi Kas**: Finance mengunduh (export) data berformat CSV. Finance kemudian mencocokkan total pengajuan penarikan merchant dengan total uang kas yang mengendap di rekening giro perusahaan / Bayar.gg Settlement.
4. **Eksekusi Bulk Transfer**: Menggunakan fitur *Cash Management* (misal: KlikBCA Bisnis / MCM), Finance mengeksekusi transfer massal ke nomor rekening masing-masing merchant.
5. **Konfirmasi Final Sistem (Krusial)**: 
   - Setelah transfer dari bank berhasil, Admin Finance **WAJIB** masuk kembali ke sistem Sportcation.
   - Tekan tombol `Mark as Processed` untuk setiap antrean penarikan tersebut. (Sistem baru akan memotong angka saldo *ledger* merchant pada tahapan ini untuk menghindari utang fiktif).

---

## Bab 6: Prosedur Moderasi Pasar Sekunder (Lelang/Auction & Jual Ulang/Resell)
**Tujuan**: Mencegah *scalping* (calo tiket harga gila-gilaan) dan pembeli abal-abal (*bot/troll bidding*).
**PIC Utama**: Admin Operasional (Ops)

**Prosedur Eksekusi**:
1. **Moderasi Harga Resell**: 
   - Ops melakukan inspeksi harian pada halaman *Resell Marketplace*.
   - Standar Operasional: *Mark-up* harga maksimal diizinkan adalah **50% dari harga asli**.
   - Jika ditemukan tiket dijual dengan *mark-up* di atas 50%, Admin Ops langsung melakukan `Force Takedown` (penghapusan paksa listing) tanpa surat peringatan.
2. **Tindakan Anti-Bot (Lelang/Auction)**:
   - Apabila sistem mencatat seorang *user* berhasil menang lelang (tertinggi) **sebanyak 3 (tiga) kali berturut-turut pada lelang berbeda namun tidak pernah membayarnya hingga kadaluwarsa**, maka Admin Ops segera melakukan *Banned / Suspend Permanent* pada IP dan Akun pengguna tersebut demi menjaga kesehatan ekosistem penawaran lelang bagi pembeli asli.

---

## Bab 7: Prosedur Respons Insiden Keamanan & IT (Incident Response)
**Tujuan**: Menjamin *Service Level Agreement* uptime platform tetap 99.9%.
**PIC Utama**: Lead Developer & IT Infra

**Prosedur Eksekusi**:
1. **Triage Bencana (P1/Blocker)**: 
   - (Definisi Blocker: User sama sekali tidak bisa login, atau gagal masuk halaman *Checkout* massal).
   - IT menyetop semua kegiatan pengembangan fitur baru (Sprint ditunda). Seluruh tim difokuskan mencari *Root Cause* di Log Vercel atau *Database Monitor*.
2. **Prosedur Rollback Darurat (SLA 15 Menit)**:
   - Jika sumber error kode tidak dapat diperbaiki (*Hotfix*) dalam waktu 15 menit pengerjaan, Lead IT **WAJIB** melakukan perintah `git revert` ke versi terakhir yang stabil (hari sebelumnya).
   - Lakukan *Redeploy* instan di Vercel agar aplikasi bisa digunakan masyarakat kembali.
3. **Manajemen Krisis (Public Relations)**:
   - Jika *downtime* menyentuh 30 menit berturut-turut, Tim IT menginstruksikan Admin Ops untuk memasang *Maintenance Banner* di aplikasi dan mengirim email massal permohonan maaf ke Merchant aktif.
4. **Post-Mortem & Preventif**: Maksimal H+1 pasca bencana sistem, Tim IT wajib merilis dokumen *Post-Mortem* internal. Laporan berisi Kronologi Waktu Detik-per-Detik, *Root Cause Analysis*, Perbaikan Permanen, dan langkah pencegahan teknis ke depannya.
