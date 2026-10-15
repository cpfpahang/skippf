/**
 * Dashboard Bersepadu CPF Pahang 2026 — web app Apps Script.
 *
 * Deploy: Execute as "Me", Who has access "Anyone within <domain organisasi>".
 * Akses dikunci dua lapis: (1) tetapan deployment memaksa log masuk Google organisasi,
 * (2) setiap permintaan disemak di pelayan: hanya email @moh.gov.my yang tersenarai dalam tab PENGGUNA SKIPPF diterima.
 * Sheet sumber dibaca oleh pemilik skrip, jadi Sheet TIDAK perlu dikongsi "Anyone with the link".
 */
const DASH = {
  SHEET_ID_DATA: '1AdB2xXm6c2MaamHYvLzNtv_sWy4zo1wFn1-slfLNQPo', // KPI/QAP/OBB Outcome/OBB Output
  DATA_GID: 1394180751,                                         // tab cache dashboard
  SHEET_ID_PELAN: '1J-rHCU5CWA0U5T4-EXv1ouZrkbDuMsr76vQvdSDzhO4', // Pelan Tindakan (tab pertama)
  // Senarai pegawai CPF Pahang = tab PENGGUNA dalam Sheet "WebApp Statistik CPF Pahang 2026" (app SKIPPF).
  // Tambah pegawai baharu di situ (peranan VIEWER memadai) — tiada deploy semula diperlukan.
  SHEET_ID_PENGGUNA: '1n_jP5uv1wcDSP7KmNukfQo1GiBCPgoMC4i_Jo1XZNSE',
  TAB_PENGGUNA: 'PENGGUNA',
  DOMAIN: 'moh.gov.my',
  CACHE_SECONDS: 300
};

function doGet() {
  if (!akaunSah_()) {
    return HtmlService.createHtmlOutput(halamanDitolak_())
      .setTitle('Akses terhad | Dashboard CPF Pahang')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('Dashboard Bersepadu CPF Pahang 2026')
    .setFaviconUrl('https://cpfpahang.github.io/skippf/icon-192.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Dipanggil oleh klien melalui google.script.run. which = 'data' | 'pelan'. */
function getDashboardRows(which) {
  if (!akaunSah_()) throw new Error('Akses hanya untuk pegawai CPF Pahang.');
  if (which !== 'data' && which !== 'pelan') throw new Error('Sumber tidak dikenali.');

  const cache = CacheService.getScriptCache();
  const key = 'dash_rows_' + which;
  const hit = cache.get(key);
  if (hit) return JSON.parse(hit);

  const rows = which === 'data'
    ? barisSebagaiObjek_(bacaTab_(DASH.SHEET_ID_DATA, tajukIkutGid_(DASH.SHEET_ID_DATA, DASH.DATA_GID)))
    : barisSebagaiObjek_(bacaTab_(DASH.SHEET_ID_PELAN, tajukIkutGid_(DASH.SHEET_ID_PELAN, null)));

  const json = JSON.stringify(rows);
  if (json.length < 95000) cache.put(key, json, DASH.CACHE_SECONDS); // had 100KB CacheService
  return rows;
}

function akaunSah_() {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase().trim();
  if (!email.endsWith('@' + DASH.DOMAIN)) return false;
  return senaraiPegawai_().indexOf(email) >= 0;
}

/** Email pegawai CPF Pahang daripada tab PENGGUNA SKIPPF (cache 5 minit). */
function senaraiPegawai_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('dash_pegawai');
  if (hit) return JSON.parse(hit);
  const emails = barisSebagaiObjek_(bacaTab_(DASH.SHEET_ID_PENGGUNA, DASH.TAB_PENGGUNA))
    .map(function (r) { return String(r.emel || '').toLowerCase().trim(); })
    .filter(function (e) { return e; });
  cache.put('dash_pegawai', JSON.stringify(emails), DASH.CACHE_SECONDS);
  return emails;
}

/*
 * Bacaan melalui Sheets API (advanced service "Sheets", v4) supaya skop kekal spreadsheets.readonly.
 * SpreadsheetApp.openById memerlukan skop tulis penuh walaupun hanya membaca.
 */
function tajukIkutGid_(id, gid) {
  const props = Sheets.Spreadsheets.get(id, { fields: 'sheets.properties(sheetId,title)' }).sheets
    .map(function (sh) { return sh.properties; });
  const tab = gid === null ? props[0] : props.filter(function (p) { return p.sheetId === gid; })[0];
  if (!tab) throw new Error('Tab data dashboard tidak ditemui.');
  return tab.title;
}

function bacaTab_(id, tajuk) {
  const res = Sheets.Spreadsheets.Values.get(id, "'" + String(tajuk).replace(/'/g, "''") + "'", {
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING' // tarikh sebagai teks; google.script.run tidak menerima Date
  });
  return res.values || [];
}

/** Bentuk sama seperti hasil gviz terdahulu: baris 1 = label lajur, setiap baris = objek {label: nilai}. */
function barisSebagaiObjek_(values) {
  if (values.length < 2) return [];
  const cols = values[0].map(function (c) { return String(c).trim(); });
  const out = [];
  for (var r = 1; r < values.length; r++) {
    var o = {}, kosong = true;
    for (var c = 0; c < cols.length; c++) {
      if (!cols[c]) continue;
      var v = values[r][c];
      if (v === undefined || v === null) v = '';
      if (v !== '') kosong = false;
      o[cols[c]] = v;
    }
    if (!kosong) out.push(o);
  }
  return out;
}

function halamanDitolak_() {
  return '<!doctype html><html lang="ms"><head><meta charset="utf-8"><style>' +
    'body{margin:0;font:16px/1.6 "Segoe UI",Arial,sans-serif;background:#f4f7fb;color:#172b46;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box}' +
    '.k{max-width:440px;background:#fff;border:1px solid #dce5ee;border-radius:14px;padding:28px;border-top:4px solid #d13239}' +
    'h1{font-size:21px;color:#0a2a5b;margin:0 0 8px}p{color:#5b6c80;font-size:14px;margin:0 0 12px}' +
    'a{display:inline-block;background:#0a2a5b;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}' +
    '</style></head><body><div class="k"><h1>Akses terhad</h1>' +
    '<p>Dashboard ini hanya untuk pegawai Cawangan Penguatkuasa Farmasi Pahang yang log masuk dengan akaun rasmi <strong>@moh.gov.my</strong>.</p>' +
    '<p>Jika anda pegawai CPF Pahang, pastikan akaun rasmi dipilih. Jika masih ditolak, hubungi pentadbir SKIPPF untuk didaftarkan.</p>' +
    '<a href="https://accounts.google.com/AccountChooser" target="_top">Tukar akaun</a></div></body></html>';
}
