# SOP Operasional Sportcation

> **Ponytail Note:** SOP ini dirancang seringkas dan seefisien mungkin (YAGNI - *You Aren't Gonna Need It*). Hanya fokus pada alur yang sistem saat ini dukung secara spesifik dan membutuhkan campur tangan manusia (Admin/Manajemen). Segala hal yang sudah diotomatisasi oleh sistem tidak perlu dimasukkan ke SOP manual.

## 1. Verifikasi Merchant (Mitra)
**Trigger:** Merchant baru mendaftar dan mengunggah dokumen legalitas (KTP/NPWP).
**PIC:** Admin Operasional
**Langkah:**
1. Buka Dashboard Admin -> menu **Daftar Merchant**.
2. Filter status ke `pending`.
3. Verifikasi silang dokumen KTP dan NPWP dengan nama/data entitas pendaftar.
4. Klik **Approve** jika valid (status berubah menjadi `active`). 
5. Klik **Reject** dengan menyertakan alasan penolakan jika dokumen buram atau tidak valid.
*SLA (Service Level Agreement): Maksimal 1x24 jam sejak dokumen diunggah.*

## 2. Pencairan Dana (Withdrawal) Merchant
**Trigger:** Merchant mengajukan *withdrawal* (pencairan dana) dari saldo *Wallet* mereka (masuk antrean dengan status `pending`).
**PIC:** Admin Finance
**Langkah:**
1. Buka Dashboard Admin -> menu **Pencairan Dana (Withdrawals)**.
2. Verifikasi nominal pengajuan; sistem sudah memastikan nominal tidak melebihi `availableBalance`, namun tetap lakukan *sanity check*.
3. Lakukan transfer manual (atau via Corporate Banking) ke rekening Merchant yang terdaftar.
4. Setelah dana berhasil ditransfer, klik **Mark as Processed** pada sistem agar mutasi *ledger* tercatat dan status *withdrawal* selesai.
*SLA: Maksimal 2x24 jam pada hari kerja.*

## 3. Resolusi Sengketa (Resell & Auction Marketplace)
**Trigger:** Pembeli melaporkan kendala (contoh: tidak dapat menggunakan lapangan dari tiket *resell* atau menang lelang tetapi lapangan tutup).
**PIC:** Admin Customer Support
**Langkah:**
1. Terima laporan via jalur komunikasi eksternal (Email/WhatsApp CS).
2. Verifikasi kode *Booking* (awalan `BKG-`) atau status pembayaran di Dashboard Admin.
3. Konfirmasi silang dengan pihak Merchant terkait.
4. Jika Merchant terbukti gagal memenuhi layanan (*fraud* atau kelalaian), Admin secara manual melakukan *Refund* kepada pembeli, dan dapat menangguhkan akun Merchant (Suspend) dari sistem.

## 4. Eskalasi Error Sistem / Downtime
**Trigger:** Pemantauan Vercel (Logs) menunjukkan lonjakan error 500, atau Payment Gateway gagal mengirimkan *Webhook*.
**PIC:** Lead Developer / IT
**Langkah:**
1. Lacak *Root Cause* pada Vercel Logs.
2. Jika *Bug* menghalangi transaksi (Blocker), segera kerjakan *Hotfix*. Praktik terbaik: Cari akar masalah (Root Cause), perbaiki di titik fungsi yang dipanggil bersama (shared function), bukan *patch* di satu titik panggil saja.
3. *Rollback* atau *Revert Commit* di GitHub jika perbaikan memakan waktu lebih dari 15 menit agar aplikasi kembali beroperasi.
4. Berikan kompensasi (jika diperlukan) kepada *user* yang transaksinya menggantung.

## 5. Sinkronisasi Data Master
**Trigger:** Penambahan cabang olahraga baru atau fasilitas baru.
**PIC:** Admin Konten
**Langkah:**
1. Jangan membuat perubahan skema DB jika hanya data statis. Gunakan *seed data* atau panel konfigurasi sistem jika sudah ada.
2. Hindari *hardcode* pada *frontend* (kecuali untuk MVP di mana *hardcode* 1 baris lebih efisien daripada membuat 3 tabel baru di database).
