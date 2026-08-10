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

/** The TRYB responses spreadsheet. Set explicitly so this works whether the
 *  script is bound to the sheet or standalone.
 *  https://docs.google.com/spreadsheets/d/1CSyC-AzOQF5TmWXx-cL6Scdhb-BogUxfIB-d5SilP0o/edit */
var SPREADSHEET_ID = '1CSyC-AzOQF5TmWXx-cL6Scdhb-BogUxfIB-d5SilP0o';

/** Newest response first: each one is inserted at row 2, directly under the
 *  headers, so the latest is always the row you see. Set false to append. */
var NEWEST_FIRST = true;

/** Must match SUBMIT_TOKEN in personality-test.html. Keeps casual bots out. */
var SUBMIT_TOKEN = 'tryb-2026';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);                      // two people finishing at once must not collide
  try {
    var body = JSON.parse(e.postData.contents);

    if (SUBMIT_TOKEN && body.token !== SUBMIT_TOKEN) return json({ ok: false, error: 'bad token' });
    if (body.website) return json({ ok: true });   // honeypot filled → silently drop

    // A beacon fired when someone closes the page part-way through.
    if (body.type === 'dropoff') {
      recordProgress(body, false);
      return json({ ok: true });
    }

    appendRow(flatten(body));
    recordProgress(body, true);            // close the loop: this session finished
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

  (body.answers || []).forEach(function (a) {
    // Sheets evaluates a leading =, + or -, so those are quoted defensively.
    // '@' is deliberately NOT escaped: Sheets does not treat it as a formula,
    // and every Instagram handle starts with one.
    var v = a.answer;
    if (typeof v === 'string' && /^[=+\-]/.test(v)) v = "'" + v;

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

  if (NEWEST_FIRST) {
    sheet.insertRowAfter(1);                        // push older responses down
    sheet.getRange(2, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ===============================================================
 * Funnel — where people leave
 * =============================================================== */

var FUNNEL_SHEET = 'Funnel log';

/**
 * One row per visitor, updated in place as they get further. `completed`
 * is set when their finished response arrives, so the same row shows both
 * how far they got and whether they made it.
 */
function recordProgress(body, completed) {
  if (!body.session) return;

  var ss    = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID)
                             : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(FUNNEL_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(FUNNEL_SHEET);
    var head = sheet.getRange(1, 1, 1, 12);
    head.setValues([[
      'Session', 'First seen', 'Last seen', 'Left at (step)', 'Question id',
      'Question they stopped on', 'Section', 'Answered', 'Of', 'Seconds',
      'Completed', 'Device'
    ]]);
    head.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var device = /Mobi|Android|iPhone|iPad/.test(body.ua || '') ? 'Mobile' : 'Desktop';
  var now    = new Date();

  // Find this visitor's existing row, if any.
  var last = sheet.getLastRow();
  var ids  = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues() : [];
  var at   = -1;
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === body.session) { at = i + 2; break; }
  }

  var row = [
    body.session, now, now,
    body.lastStep === undefined ? '' : body.lastStep,
    body.lastQuestionId || (completed ? 'done' : ''),
    body.lastQuestion   || (completed ? 'Finished' : ''),
    body.section        || '',
    body.answered === undefined ? (body.answers ? body.answers.length : '') : body.answered,
    body.total || (body.answers ? body.answers.length : ''),
    body.seconds || body.durationSeconds || '',
    completed ? 'yes' : 'no',
    device
  ];

  if (at === -1) {
    sheet.appendRow(row);
  } else {
    var existing = sheet.getRange(at, 1, 1, 12).getValues()[0];
    row[1] = existing[1] || now;                      // keep the original first-seen
    if (existing[10] === 'yes') row[10] = 'yes';      // a completion is never undone
    sheet.getRange(at, 1, 1, 12).setValues([row]);
  }
}

/**
 * Run this from the Apps Script editor (Run ▸ buildFunnel) to write a
 * "Funnel" tab: how many people reached each question, and how many stopped
 * there. Re-run any time; it rebuilds from scratch.
 */
function buildFunnel() {
  var ss    = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID)
                             : SpreadsheetApp.getActiveSpreadsheet();
  var log   = ss.getSheetByName(FUNNEL_SHEET);
  if (!log || log.getLastRow() < 2) return;

  var rows  = log.getRange(2, 1, log.getLastRow() - 1, 12).getValues();
  var stops = {}, order = {}, sections = {}, total = rows.length, completed = 0;

  rows.forEach(function (r) {
    if (r[10] === 'yes') { completed++; return; }     // finishers stopped nowhere
    var key = r[5] || 'Unknown';
    stops[key]    = (stops[key] || 0) + 1;
    order[key]    = r[3];
    sections[key] = r[6];
  });

  // This rebuilds its tab from scratch, so never clear a sheet that is not ours:
  // if something called "Funnel" already exists with other content, write beside it.
  var HEAD = 'Question they stopped on';
  var name = 'Funnel';
  var out  = ss.getSheetByName(name);
  if (out && out.getLastRow() > 0 && out.getRange(1, 1).getValue() !== HEAD) {
    name = 'TRYB funnel';
    out  = ss.getSheetByName(name);
  }
  if (!out) out = ss.insertSheet(name);
  out.clear();
  var fhead = out.getRange(1, 1, 1, 4);
  fhead.setValues([['Question they stopped on', 'Section', 'People who stopped here', '% of visitors']]);
  fhead.setFontWeight('bold');
  out.setFrozenRows(1);

  var keys = Object.keys(stops).sort(function (a, b) { return order[a] - order[b]; });
  var data = keys.map(function (k) {
    return [k, sections[k], stops[k], total ? (stops[k] / total) : 0];
  });
  data.push(['— FINISHED —', '', completed, total ? completed / total : 0]);

  if (data.length) {
    out.getRange(2, 1, data.length, 4).setValues(data);
    out.getRange(2, 4, data.length, 1).setNumberFormat('0.0%');
  }
  out.autoResizeColumns(1, 4);
}
