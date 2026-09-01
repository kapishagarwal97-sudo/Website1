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

    // Email taken on the intro screen, before the first question.
    if (body.type === 'lead') {
      recordLead(body);
      return json({ ok: true });
    }

    // A beacon fired when someone closes the page part-way through.
    if (body.type === 'dropoff') {
      recordProgress(body, false);
      return json({ ok: true });
    }

    // A seat reservation from the standalone invite pages → its own tab.
    // Kept entirely separate from Responses/Emails/Funnel.
    if (body.type === 'invite') {
      recordInvite(body);
      return json({ ok: true });
    }

    // A page view from the invite pages → its own "Invite views" tab.
    // Fire-and-forget beacon; no personal data, just which page was opened.
    if (body.type === 'view') {
      recordView(body);
      return json({ ok: true });
    }

    // Guard: only a finished form has answers. Anything else reaching here is a
    // stray or mis-shaped POST, and must not land in Responses as a blank row.
    if (!body.answers || !body.answers.length) {
      return json({ ok: false, error: 'no answers in payload — not a submission' });
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

/** Bumped whenever this file changes, so opening /exec proves which version is
 *  actually deployed — a paste that was never redeployed shows the old value. */
var VERSION = '8 — leads + funnel + consent + invites + invite views';

/** Open the /exec URL in a browser to see what is live. */
function doGet() {
  return json({
    ok: true,
    service: 'tryb-personality-test',
    version: VERSION,
    handles: ['lead', 'dropoff', 'submission', 'invite', 'view']
  });
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
  // Consent is logged with the moment it was given, as opt-in records require.
  row['Consent — WhatsApp + email'] = body.consent ? 'yes' : 'no';
  row['Consent given at']           = body.consentAt ? new Date(body.consentAt) : '';

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

/* ===============================================================
 * Emails captured on the intro screen
 * =============================================================== */

var LEADS_SHEET = 'Emails';

/**
 * Written the moment someone starts the form, so an address is on record even
 * if they never reach the end. One row per visitor — restarting does not
 * duplicate them.
 */
function recordLead(body) {
  if (!body.email) return;

  var ss    = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID)
                             : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(LEADS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(LEADS_SHEET);
    var head = sheet.getRange(1, 1, 1, 3);
    head.setValues([['Started at', 'Email', 'Session']]);
    head.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  // Same visitor coming back should update, not pile up.
  var last = sheet.getLastRow();
  var ids  = last > 1 ? sheet.getRange(2, 3, last - 1, 1).getValues() : [];
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] && ids[i][0] === body.session) {
      sheet.getRange(i + 2, 1, 1, 3).setValues([[new Date(), body.email, body.session]]);
      return;
    }
  }
  sheet.insertRowAfter(1);                    // newest first, like Responses
  sheet.getRange(2, 1, 1, 3).setValues([[new Date(), body.email, body.session || '']]);
}

/* ===============================================================
 * Invite seat reservations
 * =============================================================== */

var INVITES_SHEET = 'Invites';

/**
 * One row per "Pay now" from the standalone invite pages. Captures the
 * intent to pay (name + Aadhaar) so you have the guest even if they drop off
 * at the payment step; Razorpay remains the record of who actually paid.
 * Writes only to the Invites tab — Responses/Emails/Funnel are untouched.
 */
function recordInvite(body) {
  var ss    = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID)
                             : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(INVITES_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(INVITES_SHEET);
    var head = sheet.getRange(1, 1, 1, 6);
    head.setValues([['Reserved at', 'Event', 'When', 'Amount', 'Name', 'Aadhaar']]);
    head.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  // Leading apostrophe keeps the 12-digit Aadhaar as exact text (never a number).
  var aadhaar = body.aadhaar ? "'" + String(body.aadhaar) : '';
  sheet.insertRowAfter(1);                    // newest first, like the other tabs
  sheet.getRange(2, 1, 1, 6).setValues([[
    new Date(),
    body.event  || '',
    body.when   || '',
    body.amount || '',
    body.name   || '',
    aadhaar
  ]]);
}

/* ===============================================================
 * Invite page views — who opened which page (funnel)
 * =============================================================== */

var VIEWS_SHEET = 'Invite views';

/**
 * One row per page load on any invite page. No personal data — just which
 * page, a random per-browser visitor id, the referrer and device. Lets you
 * see how many opened the invitations link and which events they opened.
 */
function recordView(body) {
  var ss    = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID)
                             : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(VIEWS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(VIEWS_SHEET);
    var head = sheet.getRange(1, 1, 1, 6);
    head.setValues([['Opened at', 'Page', 'Event', 'Referrer', 'Visitor', 'Device']]);
    head.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  var device = /Mobi|Android|iPhone|iPad/.test(body.ua || '') ? 'Mobile' : 'Desktop';
  sheet.insertRowAfter(1);                    // newest first
  sheet.getRange(2, 1, 1, 6).setValues([[
    new Date(),
    body.page     || '',
    body.event    || '',
    body.referrer || '(direct / from link)',
    body.session  || '',
    device
  ]]);
}

/**
 * Run this from the editor (Run ▸ buildInviteFunnel) to write an
 * "Invite funnel" tab: total views and unique visitors per page, so you can
 * see the drop-off from the invitations landing to each event. Re-run any time.
 */
function buildInviteFunnel() {
  var ss  = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID)
                           : SpreadsheetApp.getActiveSpreadsheet();
  var log = ss.getSheetByName(VIEWS_SHEET);
  if (!log || log.getLastRow() < 2) return;

  var rows  = log.getRange(2, 1, log.getLastRow() - 1, 6).getValues();
  var views = {}, uniq = {};
  rows.forEach(function (r) {
    var p = r[1] || '(unknown)';
    views[p] = (views[p] || 0) + 1;
    uniq[p]  = uniq[p] || {};
    if (r[4]) uniq[p][r[4]] = 1;
  });

  var order = ['invites', 'bowling', 'depot48', 'agama'];
  var label = {
    invites:  'Invitations (landing page)',
    bowling:  'Bowling & dinner — Yes Minister',
    depot48:  'Live music & dinner — Depot 48',
    agama:    'Board games & dinner — Agama'
  };
  var keys = order.filter(function (k) { return views[k]; })
    .concat(Object.keys(views).filter(function (k) { return order.indexOf(k) < 0; }));

  var out = ss.getSheetByName('Invite funnel') || ss.insertSheet('Invite funnel');
  out.clear();
  var head = out.getRange(1, 1, 1, 3);
  head.setValues([['Page', 'Total views', 'Unique visitors']]);
  head.setFontWeight('bold');
  out.setFrozenRows(1);

  var data = keys.map(function (k) {
    return [label[k] || k, views[k], Object.keys(uniq[k] || {}).length];
  });
  if (data.length) out.getRange(2, 1, data.length, 3).setValues(data);
  out.autoResizeColumns(1, 3);
}

/**
 * Run this once from the editor (Run ▸ setupSheets) to create the Emails and
 * Funnel log tabs with their headers straight away, instead of waiting for the
 * first visitor. Safe to run any time — it only ever adds a missing tab or a
 * missing header row, and never touches existing rows.
 */
function setupSheets() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID)
                          : SpreadsheetApp.getActiveSpreadsheet();

  var tabs = [
    { name: LEADS_SHEET,  head: ['Started at', 'Email', 'Session'] },
    { name: FUNNEL_SHEET, head: ['Session', 'First seen', 'Last seen', 'Left at (step)',
                                 'Question id', 'Question they stopped on', 'Section',
                                 'Answered', 'Of', 'Seconds', 'Completed', 'Device'] }
  ];

  tabs.forEach(function (t) {
    var sheet = ss.getSheetByName(t.name);
    if (!sheet) sheet = ss.insertSheet(t.name);
    if (sheet.getLastRow() === 0) {                  // only when genuinely empty
      var head = sheet.getRange(1, 1, 1, t.head.length);
      head.setValues([t.head]);
      head.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
}
