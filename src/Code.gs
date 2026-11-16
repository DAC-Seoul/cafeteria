/** 식단 보기 - Google Apps Script 서버 코드
 *  데이터는 내 드라이브의 'cafeteria_db.json' 파일에 저장됩니다. */
const DB_NAME = 'cafeteria_db.json';
const SECTIONS = ['companies', 'menus', 'orders', 'actual', 'admins', 'hol', 'cred', 'defaults'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('식단 보기')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .setFaviconUrl('https://dacpole.com/webapp/food/favicon-32.png');
}

function dbFile_(create) {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('DB_FILE_ID');
  if (id) { try { return DriveApp.getFileById(id); } catch (e) {} }
  if (!create) return null;
  const f = DriveApp.createFile(DB_NAME, '', MimeType.PLAIN_TEXT);
  props.setProperty('DB_FILE_ID', f.getId());
  return f;
}

/** 저장된 데이터를 JSON 문자열로 반환 (없으면 빈 문자열) */
function getDb() {
  const f = dbFile_(false);
  return f ? f.getBlob().getDataAsString('UTF-8') : '';
}

/** 변경 내용(ops)만 받아 서버 데이터에 반영 — 동시 저장 시 잠금 처리 */
function applyOps(ops) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const f = dbFile_(true);
    const t = f.getBlob().getDataAsString('UTF-8');
    const db = t ? JSON.parse(t) : { companies: ['A사', 'B사', 'C사', 'D사', 'E사', 'F사', 'G사'], menus: {}, orders: {}, actual: {} };
    (ops || []).forEach(function (o) {
      const p = o && o.p;
      if (!Array.isArray(p) || !p.length || SECTIONS.indexOf(p[0]) < 0) return;
      if (p.some(function (k) { return k === '__proto__' || k === 'constructor' || k === 'prototype'; })) return;
      let cur = db;
      for (let i = 0; i < p.length - 1; i++) {
        if (typeof cur[p[i]] !== 'object' || cur[p[i]] === null) cur[p[i]] = {};
        cur = cur[p[i]];
      }
      const last = p[p.length - 1];
      if (o.d) delete cur[last]; else cur[last] = o.v;
    });
    f.setContent(JSON.stringify(db));
    return true;
  } finally {
    lock.releaseLock();
  }
}

/** 마감(오후 5시)이 지난 날짜에 신청이 없는 입주사를 기본 인원으로 확정 (이미 있는 값은 건드리지 않음) */
function finalizeDefaults(dates) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const f = dbFile_(false);
    if (!f) return false;
    const t = f.getBlob().getDataAsString('UTF-8');
    if (!t) return false;
    const db = JSON.parse(t);
    const defs = db.defaults || {};
    const now = new Date();
    const today = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd');
    const tomorrow = Utilities.formatDate(new Date(now.getTime() + 86400000), 'Asia/Seoul', 'yyyy-MM-dd');
    const hour = parseInt(Utilities.formatDate(now, 'Asia/Seoul', 'H'), 10);
    let changed = false;
    db.orders = db.orders || {};
    (dates || []).forEach(function (d) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
      if (!(d <= today || (d === tomorrow && hour >= 17))) return; // 아직 마감 전이면 건너뜀
      (db.companies || []).forEach(function (c) {
        if (typeof defs[c] !== 'number') return;
        const o = db.orders[d] || {};
        if (o[c] === undefined) { o[c] = defs[c]; db.orders[d] = o; changed = true; }
      });
    });
    if (changed) f.setContent(JSON.stringify(db));
    return changed;
  } finally {
    lock.releaseLock();
  }
}
