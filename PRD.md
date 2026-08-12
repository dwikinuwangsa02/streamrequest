# Product Requirements Document (PRD)
**Nama Produk:** StreamRequest (Nama Sementara)
**Versi:** 1.0
**Platform:** Web Application (Next.js)
**Inspirasi UI/UX:** TipTap.gg

## 1. Ringkasan Produk (Product Overview)
**Tujuan Produk:** 
Membangun platform *media share* dan *song request* untuk *live streamer* di YouTube dan TikTok. Platform ini meningkatkan interaksi penonton dan membuka jalur monetisasi baru. Penonton dapat melakukan *request* gratis via komentar, atau *skip* antrian dengan cara berdonasi.

**Masalah yang Diselesaikan:**
* Streamer kesulitan mengatur antrian lagu manual.
* Penonton berbayar tidak mendapat prioritas otomatis.
* Sulitnya menggabungkan *request* dari YouTube/TikTok Live Chat dengan sistem Donasi dalam satu antrian (Queue) terpusat.

## 2. Target Pengguna (User Personas)
1. **Streamer (Admin/Host):** Membutuhkan *dashboard* yang bersih, mudah dinavigasi, dan sistem yang berjalan di *background* tanpa harus sering di-klik (hands-free) saat sedang *live*.
2. **Viewer (Penonton):** Ingin lagunya diputar. Bersedia membayar untuk *fast-track* atau berpartisipasi gratis melalui komentar.

## 3. Spesifikasi Fitur Utama (Core Features)

| Fitur | Deskripsi & Kriteria | Prioritas |
| :--- | :--- | :--- |
| **Integrasi Chat (Gratis)** | Membaca *live chat* YouTube/TikTok. Format: `!sr [judul/link]`. Lagu masuk ke antrian reguler (bawah). | Tinggi |
| **Integrasi Donasi (VIP)** | Menerima Webhook dari Saweria/Trakteer/Platform lain. Jika nominal >= batas minimum, lagu dari pesan donasi diletakkan di prioritas atas (Skip Queue). | Tinggi |
| **Dual Player (YouTube & Spotify)** | **YouTube:** Menggunakan Iframe API tersembunyi.<br>**Spotify:** Menggunakan Spotify Web Playback SDK atau Spotify API untuk mengontrol *playback* di akun Premium streamer. Streamer bisa *toggle* mau pakai *source* mana. | Tinggi |
| **Widget OBS (Overlay)** | Tampilan *transparent background* untuk OBS (`/widget/queue/[id]`). Menampilkan "Now Playing" dan "Up Next". Customizable (warna, ukuran font). | Tinggi |
| **Queue Management** | Dashboard untuk melihat antrian, hapus lagu, *pause/play*, *skip*, dan *ban* user/kata kunci tertentu. | Menengah |

## 4. Konsep UI/UX (Terinspirasi TipTap.gg)

Desain akan mengadaptasi gaya UI/UX dari platform seperti TipTap.gg yang sangat populer di kalangan *gamer/streamer* Indonesia: *modern, dark mode, dan gamified.*

### A. Tema & Visual
* **Dark Mode First:** Latar belakang dominan gelap (hitam keabu-abuan modern seperti `#121212` atau `#18181b`).
* **Aksen Warna (Neon/Vibrant):** Menggunakan warna aksen yang mencolok untuk tombol utama dan status (misal: Ungu Neon, Hijau Spotify `#1DB954`, atau Merah YouTube).
* **Card-Based Layout:** Konten dibungkus dalam *cards* dengan sudut membulat (*rounded corners* - `rounded-xl` atau `rounded-2xl` di Tailwind) dan bayangan tipis (*soft glow/shadow*).
* **Tipografi:** *Font* sans-serif yang bersih dan tebal untuk *heading* (seperti Inter atau Poppins).

### B. Layout Dashboard (Sisi Streamer)
* **Sidebar Kiri (Navigasi):** Ringkas dan menggunakan ikon (Queue, Settings, Widgets, History, Integrations).
* **Top Bar:** Menampilkan status koneksi (YouTube: Connected, Spotify: Connected, Webhook: Active) dengan indikator titik hijau (*green dot indicator*).
* **Main Content Area:**
  * **Queue List:** Daftar antrian lagu bergaya *list view*. Lagu dari donasi diberi *highlight* khusus (misal: *border* bersinar, ikon mahkota, warna latar berbeda).
  * **Mini Player (Floating Bottom Bar):** *Control bar* menempel di bawah layar (seperti web Spotify) berisi *Play/Pause, Skip, Volume*, dan indikator sumber audio (Logo YouTube atau Spotify).

### C. OBS Widget (Sisi Layar Live)
* **Animasi Transisi:** Saat lagu berganti, widget memudar (*fade out/in*) atau bergeser (*slide*) dengan mulus.
* **Tampilan Bersih (Lower Third):** Menampilkan Cover Album/Thumbnail melingkar, Judul Lagu, dan *marquee text* (teks berjalan) jika judul terlalu panjang.
* **Badge Khusus:** Jika di-request via donasi, muncul *badge* "👑 Requested by [Nama] - Rp 50.000".

## 5. Alur Pengguna (User Flow)
1. **Setup:** Streamer mendaftar -> Konek akun Spotify Premium & YouTube -> Atur harga *Skip Queue* -> Copy URL Webhook ke platform donasi (mis. Saweria) -> Copy URL Widget ke OBS.
2. **Live Session:** Streamer membiarkan tab *Dashboard* terbuka. Lagu diputar otomatis secara berurutan.
3. **Interaksi:** 
   - User A ketik `!sr Lagu X` di chat -> Masuk antrian bawah (Reguler).
   - User B donasi Rp20.000 via Saweria dengan pesan `!sr Lagu Y` -> Masuk prioritas teratas, diputar setelah lagu saat ini selesai.

## 6. Arsitektur & Teknologi (Tech Stack)
* **Frontend & API:** Next.js (App Router) + TypeScript.
* **UI Framework:** Tailwind CSS + Shadcn UI + Framer Motion (untuk animasi transisi OBS Widget yang *smooth*).
* **Database:** PostgreSQL (Neon.tech / Supabase) + Prisma ORM.
* **Real-time:** Supabase Realtime / Pusher (Untuk sinkronisasi instan antara Dashboard <-> OBS Widget <-> API Webhook).
* **Third Party APIs:** 
  - Spotify Web API (Playback Control)
  - YouTube Data API (Chat Listener & Video Data)

## 7. Hal Penting Terkait Spotify (Disclaimer)
* Sistem akan mengontrol akun Spotify streamer menggunakan otorisasi OAuth 2.0.
* Streamer **wajib** memiliki Spotify Premium agar API bisa memerintahkan *playback* (`/me/player/play`).
* Risiko DMCA/Copyright ditanggung penuh oleh streamer saat melakukan *live streaming*.
