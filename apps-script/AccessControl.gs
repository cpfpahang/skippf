/**
 * Kawalan akses yang digunakan oleh Statistik CPF Pahang 2026, Versi 2.
 * Selaraskan fungsi ini dengan Code.gs dalam projek Google Apps Script.
 */
function normPic_(s) {
  return String(s || '').toUpperCase().trim().replace(/\s+/g, ' ');
}

function splitPic_(s) {
  return String(s || '').split(/[\/,;]+/).map(normPic_).filter(String);
}

function agihanPics_(s) {
  return String(s || '').split(';').map(function (t) {
    return normPic_(String(t).split('=')[0]);
  }).filter(String);
}

function canEdit_(user, rowPic, rowAgihan) {
  if (user.peranan === 'ADMIN') return true;
  if (user.peranan !== 'PIC') return false;

  var mine = [];
  (user.pics || []).forEach(function (p) {
    mine = mine.concat(splitPic_(p));
  });

  var assigned = splitPic_(rowPic).concat(agihanPics_(rowAgihan));
  return assigned.some(function (p) {
    return mine.indexOf(p) >= 0;
  });
}

