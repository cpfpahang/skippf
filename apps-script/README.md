# Statistik CPF Pahang 2026 — Apps Script

Folder ini merekodkan pembaikan kawalan akses yang diterbitkan sebagai Apps Script **Versi 2** pada 14 Ogos 2026.

## Kandungan

- `AccessControl.gs` — normalisasi nama PIC dan semakan kebenaran pada pelayan.
- `AccessControl.client.html` — paparan butang **Kemaskini** pada aplikasi.

## Peraturan akses

- `ADMIN` boleh mengemas kini semua rekod.
- `PIC` boleh mengemas kini rekod KPI/OBB/QAP apabila namanya tersenarai dalam medan PIC.
- Bagi SKU, `PIC` juga boleh mengemas kini rekod apabila namanya tersenarai dalam agihan SKU.
- Nama PIC boleh dipisahkan menggunakan `/`, koma atau `;`.
- Pengguna selain `ADMIN` dan `PIC` tidak diberikan akses kemas kini.

Deployment aktif menggunakan ID `AKfycbzTF6QjgGI-M2GHLEclFVdCdkWzOmQT_7U4SR0BUNPjHGmpE4Xj5KCEf63oPoHOoWuruQ`.

> Nota: Projek Apps Script masih sumber operasi utama. Folder ini ialah salinan kawalan akses untuk jejak versi GitHub dan perlu dikemas kini bersama setiap perubahan pada projek langsung.
