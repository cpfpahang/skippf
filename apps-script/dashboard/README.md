# Dashboard Bersepadu CPF Pahang — Apps Script

Sejak 15 Oktober 2026 dashboard tidak lagi dihoskan di GitHub Pages. `dashboard/index.html` dalam repo ini
hanya halaman pautan tanpa data yang membawa pengguna ke web app di bawah.

## Fail

- `Code.gs` — `doGet`, semakan akaun (email @moh.gov.my yang ada dalam tab `PENGGUNA` Sheet "WebApp Statistik CPF Pahang 2026"), bacaan Sheet di pelayan (`getDashboardRows`), cache 5 minit.
- `Dashboard.html` — antara muka dashboard. Data dimuat melalui `google.script.run`, bukan gviz.

## Deploy

1. Projek Apps Script baharu (akaun moh.gov.my), tambah `Code.gs` dan fail HTML bernama `Dashboard`.
2. Deploy → New deployment → Web app: **Execute as: Me**, **Who has access: Anyone within (organisasi)**.
3. Salin URL `/exec` ke `DASHBOARD_URL` dalam `dashboard/index.html`.
4. Tukar perkongsian kedua-dua Sheet daripada "Anyone with the link" kepada **Restricted** (atau organisasi sahaja).
   Skrip dijalankan sebagai pemilik, jadi dashboard masih boleh membaca Sheet.
5. Kemas kini kod kemudian: Deploy → Manage deployments → Edit → New version (URL kekal).

## Deployment semasa

- Projek: "Dashboard CPF Pahang 2026 (SKIPPF)", ID `1wqUAOTdgk_1Nn0B2K4UV3gw2rqE1iow-wmyeF0DxSWSGRx_0ofUu1-XF`
- Deployment ID: `AKfycbwUemeXt1rVgwcw_M8HsX-hLUxvMtsFEvzdbQYRJTSD5D9_RyDhwpGG-G0LXs48qjVc-g` (versi 3, 15 Okt 2026)
- Akses: email @moh.gov.my yang tersenarai dalam tab `PENGGUNA` Sheet "WebApp Statistik CPF Pahang 2026"
  (`1n_jP5uv1wcDSP7KmNukfQo1GiBCPgoMC4i_Jo1XZNSE`). Tambah pegawai di situ; berkuat kuasa dalam ≤5 minit.
- Bacaan Sheet melalui advanced service Sheets v4 supaya skop kekal `spreadsheets.readonly`.
