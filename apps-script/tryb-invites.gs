/**
 * TRYB — invite reservations → "Invites" tab
 * ------------------------------------------------------------------
 * This ADDS invite handling to your EXISTING Apps Script. It does not
 * change how personality submissions or leads are stored — for those
 * requests tryInvite_() returns null and your existing code runs
 * exactly as before. It only acts when the request is an invite.
 *
 * INSTALL — 3 steps:
 *
 *  1) Paste the whole tryInvite_() function below into your script
 *     (anywhere is fine — e.g. at the very bottom of the file).
 *
 *  2) Make this the FIRST line inside your existing doPost(e):
 *
 *         var __inv = tryInvite_(e); if (__inv) return __inv;
 *
 *  3) Deploy → Manage deployments → (edit the EXISTING deployment,
 *     the pencil icon) → Version: New version → Deploy.
 *     Keep the same /exec URL. (Saving the file is NOT enough — you
 *     must deploy a new version for the change to go live.)
 *
 * The invite pages POST this JSON (Content-Type text/plain):
 *   { token:"tryb-2026", type:"invite",
 *     event, when, amount, name, phone, submittedAt }
 *
 * NOTE: this uses SpreadsheetApp.getActiveSpreadsheet(), which works
 * when the script is bound to the Sheet (Extensions → Apps Script).
 * If your script is standalone and opens the sheet with
 * SpreadsheetApp.openById("..."), replace getActiveSpreadsheet()
 * below with that same openById("...") call.
 * ------------------------------------------------------------------
 */

function tryInvite_(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return null;                    // not JSON we recognise -> let your code handle it
  }

  if (!data || data.type !== "invite") return null;   // not an invite -> fall through untouched
  if (data.token !== "tryb-2026")      return null;   // wrong/missing token -> ignore

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("Invites");
    if (!sh) {
      sh = ss.insertSheet("Invites");
      sh.appendRow(["Timestamp", "Event", "When", "Amount", "Name", "Phone"]);
    }
    sh.appendRow([new Date(), data.event, data.when, data.amount, data.name, data.phone]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
