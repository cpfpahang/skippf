# Notifikasi SKIPPF

Push kepada **semua pegawai yang pernah buka SKIPPF** (bukan PIC sahaja).

## Cara ia berfungsi

1. Launcher GitHub Pages (`index.html`) memasang service worker `sw.js`.
2. Ketika pegawai tekan **Buka SKIPPF**, pelayar minta kebenaran notifikasi.
3. `alerts.json` dikemas kini setiap hari Isnin–Jumaat 8:00 pagi (Malaysia) oleh GitHub Action.
4. Service worker paparkan notifikasi telefon kepada **setiap peranti** yang dah Allow — KPI PERHATIAN, sama untuk semua.

Tiada Firebase / FCM. Data amaran hanya id, peratus dan nama indikator (sudah awam di dashboard).

## Pasang

Sudah hidup selepas fail ini masuk `main` (GitHub Pages).

Pegawai perlu:

1. Buka https://cpfpahang.github.io/skippf/?home=1
2. Tekan **Allow** bila pelayar tanya notifikasi
3. (Android) Tambah pada Skrin utama supaya notifikasi lebih stabil

Ujian: tekan **Buka SKIPPF** sekali, kemudian semak `alerts.json`. Jika ada indikator PERHATIAN, notifikasi sepatutnya muncul.
