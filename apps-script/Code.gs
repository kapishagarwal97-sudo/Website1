/**
 * TRYB — personality test → Google Sheets
 *
 * Deploy this as a Web App (Deploy ▸ New deployment ▸ Web app):
 *   Execute as:       Me
 *   Who has access:   Anyone
 * Then paste the /exec URL into SHEET_ENDPOINT in personality-test.html.
 *
 * Columns are created from the payload the first time a response arrives, and
 * matched by header name after that — so adding or reordering questions in the
 * form never scrambles existing rows. New questions simply add new columns.
 */

var SHEET_NAME = 'Responses';

/** Optional. Leave '' to use the spreadsheet this script is bound to. */
var SPREADSHEET_ID = '';

/** Must match SUBMIT_TOKEN in personality-test.html. Keeps casual bots out. */
var SUBMIT_TOKEN = 'tryb-2026';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);                      // two people finishing at once must not collide
  try {
    var body = JSON.parse(e.postData.contents);

    if (SUBMIT_TOKEN && body.token !== SUBMIT_TOKEN) return json({ ok: false, error: 'bad token' });
    if (body.website) return json({ ok: true });   // honeypot filled → silently drop

    appendRow(flatten(body));
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Lets you confirm the deployment is live by opening the /exec URL in a browser. */
function doGet() {
  return json({ ok: true, service: 'tryb-personality-test' });
}

/**
 * Payload → a flat {header: value} record, in the order the columns should read.
 */
function flatten(body) {
  var row = {};
  row['Submitted at']  = new Date();          // server clock, not the visitor's
  row['Name']          = body.name  || '';
  row['Email']         = body.email || '';
  row['Phone']         = body.phone || '';
  row['City']          = body.city  || '';

  (body.answers || []).forEach(function (a) {
    // Sheets treats a leading =, +, - or @ as a formula, and option labels can
    // start with one, so those are quoted defensively.
    var v = a.answer;
    if (typeof v === 'string' && /^[=+\-@]/.test(v)) v = "'" + v;

    // Two questions worded identically would otherwise share one column.
    var header = a.question;
    if (row.hasOwnProperty(header)) header = a.question + ' (' + a.id + ')';
    row[header] = (v === null || v === undefined) ? '—' : v;
  });

  row['Unanswered (timed out)'] = body.timedOut || 0;
  row['Time taken (s)']         = body.durationSeconds || '';
  return row;
}

function appendRow(row) {
  var ss    = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID)
                             : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  var lastCol  = sheet.getLastColumn();
  var headers  = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var isNew    = headers.length === 0;

  // Add a column for anything we have not seen before.
  Object.keys(row).forEach(function (key) {
    if (headers.indexOf(key) === -1) headers.push(key);
  });

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (isNew) {
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var values = headers.map(function (h) {
    return row.hasOwnProperty(h) ? row[h] : '';
  });
  sheet.appendRow(values);
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
