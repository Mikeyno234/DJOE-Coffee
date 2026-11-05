# ADR 0002: QRIS dan debit dikonfirmasi manual oleh kasir

Status: Diterima, 2026-11-05
Fase siklus hidup: Pengembangan (belum ada data produksi)

## Konteks

Kedai memakai QRIS statis dan mesin EDC tanpa integrasi gateway. Tidak ada
sistem pihak ketiga yang dapat memberi tahu aplikasi bahwa uang sudah masuk.
Status `pending` untuk metode ini tidak akan pernah berubah dan membuat order
tertahan tanpa jalan keluar di layar.

## Keputusan

- Pembayaran `qris` dan `debit` dicatat sebagai `succeeded` pada saat kasir
  menekan tombol konfirmasi, setelah memeriksa bukti bayar pelanggan.
- Nomor referensi opsional disimpan di `payments.manual_reference`.
- Setiap konfirmasi non-tunai menambah baris append-only di `payment_events`
  dengan tipe `manual_confirmed` (metode, referensi, jumlah).
- Prosedur `process_pos_checkout` hanya mendukung pembayaran yang langsung
  selesai. Status `pending`, `failed`, dan `expired` tetap ada di skema untuk
  alur gateway di masa depan, yang akan memakai fungsi terpisah.

## Konsekuensi

- Kesalahan konfirmasi oleh kasir tidak dapat dideteksi sistem. Mitigasi:
  jejak `payment_events` dan rekonsiliasi shift (belum dibangun).
- Belum ada pembatalan atau refund. Order yang terkonfirmasi karena salah
  ketuk belum dapat dibatalkan dari layar; ini harus dibangun bersama
  fitur shift dan kas sebelum dipakai di kedai.
- Atribusi kasir pada konfirmasi masih kosong sampai autentikasi dipindah ke
  Supabase Auth (`created_by` merujuk ke `profiles`).
- Bila gateway QRIS dinamis dipasang, konfirmasi manual dapat dimatikan per
  metode tanpa mengubah skema.
