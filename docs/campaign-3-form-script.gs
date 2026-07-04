/**
 * Campaign 3 — Google Apps Script form-submit handler.
 *
 * Form: "Sai Story x Student ID Registration Form (UK & IRE)"
 * Posts each submission as JSON to the CRM's public Campaign 3 endpoint.
 *
 * SETUP (one time):
 *   1. Open the Google Form → ⋮ menu → "Script editor".
 *   2. Paste this whole file.
 *   3. Left sidebar → Triggers (clock icon) → Add Trigger:
 *        - Function: onFormSubmit
 *        - Event source: From form
 *        - Event type: On form submit
 *   4. Save & authorize when prompted.
 *
 * The respondent's Google account email is sent as top-level `email`; the CRM
 * controller stores it as studentEmail (studentEmail || email). Required fields
 * on the CRM side are studentName + email + studentMobile.
 *
 * Question titles are matched AFTER trimming whitespace, so trailing spaces in
 * the form (e.g. "Degree Field. ") don't have to be reproduced exactly here.
 */

// Same host the other campaigns use (production Render backend).
// For local testing swap to: "http://localhost:4000/api/campaign-3/public"
var CAMPAIGN_3_ENDPOINT = "https://crm-backend-4rq2.onrender.com/api/campaign-3/public";

// Exact Google Form question titles → CRM field keys.
// Keys are compared against the trimmed question title (see onFormSubmit).
var CAMPAIGN_3_KEY_MAPPING = {
  "Student Name": "studentName",
  "Student Mobile Number": "studentMobile",
  "Parent Name": "parentName",
  "Parent Mobile Number": "parentMobile",
  "Parent Occupation": "parentOccupation",
  "Preferred Country": "preferredCountry",
  "Preferred Intake": "preferredIntake",
  "Highest Qualification": "currentQualification",
  "Degree Name": "course",
  "Degree Field.": "degreeField",
  "Education completion Year": "completionYear",
  "Percentage": "percentage",
  "Consultation Mode": "mode",
  "Detailed Remarks (Describe your expectations, current scenario and doubts in detail.)": "remarks"
  // Note: the form's own "Email" question is captured via getRespondentEmail()
  // and sent as the top-level `email` field below.
};

function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  var payloadData = {
    "email": formResponse.getRespondentEmail()
  };

  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    // Trim so trailing spaces/periods in the form title still match the mapping.
    var questionTitle = itemResponse.getItem().getTitle().trim();
    var answer = itemResponse.getResponse();
    var jsonKey = CAMPAIGN_3_KEY_MAPPING[questionTitle] || questionTitle;
    payloadData[jsonKey] = answer;
  }

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payloadData),
    "muteHttpExceptions": true
  };

  try {
    var response = UrlFetchApp.fetch(CAMPAIGN_3_ENDPOINT, options);
    Logger.log("Campaign 3 response: " + response.getResponseCode() + " " + response.getContentText());
  } catch (error) {
    Logger.log("Campaign 3 error: " + error.toString());
  }
}
