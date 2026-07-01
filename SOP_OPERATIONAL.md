# SOP Operasional & Bisnis Sportcation (Advanced Edition)

Dokumen ini adalah *Standard Operating Procedure* (SOP) komprehensif yang menjabarkan tanggung jawab dan alur kerja spesifik dari masing-masing *Role* yang terlibat dalam ekosistem Sportcation.

---

## 1. Pembagian Peran & Tanggung Jawab (*Roles & Responsibilities*)

### A. Manajemen / Super Admin
- **Tanggung Jawab:** Mengambil keputusan strategis bisnis, menetapkan *Platform Fee* atau komisi, menyetujui anggaran promosi, dan memantau KPI utama (GMV, *Active Merchants*, *User Retention*).

### B. Admin Operasional (Ops)
- **Tanggung Jawab:** *Quality Control* atas entitas yang bergabung. Memverifikasi dokumen merchant baru, melakukan *takedown* venue atau listing yang melanggar ketentuan, serta memberikan sanksi pada akun *fraud*.

### C. Admin Finance (Keuangan)
- **Tanggung Jawab:** Menjaga likuiditas arus kas. Mengeksekusi penarikan dana (*withdrawal*) dari merchant, memproses *refund* manual ke *customer*, dan melakukan rekonsiliasi data *payment gateway* (Bayar.gg) terhadap mutasi bank perusahaan.

### D. Admin Customer Service (CS)
- **Tanggung Jawab:** Gardu terdepan komunikasi (*frontliner*). Menangani komplain *customer*, membantu kesulitan teknis merchant, serta menjadi jembatan awal dalam proses resolusi sengketa (*dispute resolution*).

### E. Tim IT / Developer
- **Tanggung Jawab:** Memastikan *uptime* sistem 99.9%. Menangani ekskalasi *bug* dari tim CS, memantau server (*Vercel*), dan menjaga keandalan database (*Turso/SQLite*).

---

## 2. Alur Operasional Spesifik per Ekosistem

### 2.1. Alur *Onboarding* & Manajemen Merchant
*Melibatkan: Merchant & Admin Ops*

1. **Registrasi Merchant:** Merchant mengisi formulir pendaftaran dan mengunggah dokumen legalitas (KTP/NPWP pemilik atau entitas usaha).
2. **Review Admin Ops (SLA 1x24 Jam):**
   - **Jadwal Kerja:** Pengecekan *dashboard* dilakukan secara *batch* pada pk 09:00 dan pk 14:00 WIB.
   - **Validasi:** Pencocokan NIK, pengecekan visibilitas foto, silang-cek nama dengan rekening bank yang nantinya didaftarkan.
   - **Approve:** Klik setuju, sistem mengirim email *Welcome* otomatis ke Merchant.
   - **Reject:** Klik tolak WAJIB mencantumkan alasan (misal: "Foto KTP terpotong") agar merchant bisa *re-submit*.
3. **Audit Berkala:** Tiap akhir bulan, Admin Ops mengekspor data *Rating Venue*. Merchant dengan *rating* di bawah 3.0 selama dua bulan berturut-turut akan diberikan Surat Peringatan (SP) hingga suspensi akun.

### 2.2. Resolusi Sengketa Transaksi (Lapangan Tutup / Gagal Tersedia)
*Melibatkan: Customer, CS, Admin Ops, Admin Finance*

1. **Laporan Masuk (SLA < 12 Jam):** Customer melapor via WhatsApp/Email kepada CS dengan melampirkan Kode Booking (`BKG-XXX`) dan bukti (contoh: foto lapangan tutup).
2. **Investigasi CS:**
   - CS segera menghubungi *Person In Charge* (PIC) Merchant terkait untuk meminta klarifikasi.
   - Jika merchant mengakui kelalaian (dobel *booking* manual/lapangan tutup), CS membekukan sementara dana *pending* merchant untuk transaksi ini.
3. **Proses Refund (SLA 1x24 Jam Kerja):**
   - CS melempar tiket ke Admin Finance dengan status `APPROVED_REFUND`.
   - Admin Finance mentransfer manual dana (dipotong/tidak dipotong *platform fee*, sesuai kebijakan) ke rekening *customer*.
   - Finance mengonfirmasi mutasi berhasil, dan mengunggah bukti ke dalam tiket laporan.
4. **Penalti Merchant:** Admin Ops memotong *rating* merchant atau mengenakan denda saldo jika terjadi pelanggaran berat (*Term of Service violation*).

### 2.3. Settlement & Penarikan Dana (Withdrawal) Merchant
*Melibatkan: Merchant & Admin Finance*

1. **Pengajuan (Oleh Merchant):** Dana transaksi yang sudah selesai (booking *completed*) otomatis masuk ke *Available Balance*. Merchant mengajukan penarikan via menu *Finance* di *dashboard* mereka.
2. **Eksekusi Pembayaran (Oleh Admin Finance):**
   - **Jadwal Kerja:** *Cut-off* penarikan adalah pukul 14:00 WIB setiap hari kerja (Senin-Jumat).
   - Admin Finance masuk ke *Dashboard Admin* -> **Withdrawals**.
   - Mengekspor data berstatus `pending` ke format CSV untuk di-*upload* ke *Corporate Banking* (MCM/KlikBCA Bisnis) sebagai *Bulk Transfer*.
3. **Penyelesaian di Sistem:**
   - Setelah bank menyatakan *transfer success*, Admin Finance HARUS KEMBALI ke sistem Sportcation.
   - Mengubah status tiap pengajuan menjadi **Mark as Processed**. Hal ini sangat krusial agar saldo *wallet* merchant terpotong di *ledger* dan tidak terjadi dobel penarikan.
4. **Rekonsiliasi (Mingguan):** Setiap hari Jumat sore, Admin Finance mencocokkan total uang masuk di *Payment Gateway* (Bayar.gg) dengan nilai *gross* transaksi sukses di database.

### 2.4. Pemantauan & Eskalasi Error Sistem (*Incident Response*)
*Melibatkan: CS, Tim IT, Merchant/Customer*

1. **Deteksi Gangguan:** Laporan membludak di CS (contoh: "Saya tidak bisa klik Bayar", "Status pembayaran tidak *update*").
2. **Triage Level:** CS menaikkan laporan ke grup Slack/WhatsApp internal dengan tag `@Tim IT`.
   - *P1 (Blocker):* Pembayaran gagal total, sistem down. (SLA Respon < 30 menit).
   - *P2 (Major):* Satu bank tidak bisa dipakai, fitur spesifik bermasalah.
   - *P3 (Minor):* Typo, UI bergeser, error pada satu *user* spesifik.
3. **Investigasi IT:** IT mengecek *Vercel Logs* / *Error Monitoring*. Jika *Payment Gateway* mengalami gangguan (karena pihak ketiga), IT meminta Ops menaikkan *banner* pengumuman di aplikasi.
4. **Resolusi (Hotfix):** 
   - Sesuai kaidah *ponytail*, IT wajib menyelesaikan *root cause*. Jika perbaikan kompleks dan memakan waktu > 1 jam, IT wajib me-*revert* *deployment* (*rollback*) ke versi terakhir yang stabil.
5. **Post-Mortem:** Untuk insiden P1, Tim IT membuat laporan ringkas penyebab masalah dan langkah pencegahan agar tidak terulang.

### 2.5. Manajemen Pasar Sekunder (Resell & Auction)
*Melibatkan: Admin Ops & Customer*

1. **Moderasi Resell:** Admin Ops memantau daftar tiket yang di-resell. Jika terdapat indikasi pencucian uang (tiket dijual Rp10.000.000, padahal harga asli Rp100.000) atau penimbunan tiket, Admin Ops berhak melakukan *force cancel* pada tiket *resell* dan memperingatkan akun tersebut.
2. **Hit and Run Lelang (Auction):** 
   - Sistem sudah mengotomatisasi pelepasan (release) jika pemenang tidak membayar dalam batas waktu lewat *Vercel Cron Job*.
   - Jika seorang *user* terdeteksi menang lelang 3 kali dan tidak pernah membayar (indikasi *troll/bot*), Admin Ops melakukan *banned* akun pengguna secara permanen.
