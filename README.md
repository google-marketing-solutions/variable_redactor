# Variable Redactor

## Challenge

Advance Consent Mode does not redact custom variables for unconsented requests.
Furthermore, it is a very long process to check all tags and redact individually
all variables.

## The solution

Variable Redactor is a solution that help to make variables consent aware in
Google Tag Manager. Using a semi automated process via the Google Tag manager
API it creates variables that, according to the user consent or lack thereof,
redact their own content.

Variable Redactor is based on a simple Sheets-based configuration UI to list and
create new variables. Those variables are created in a custom folder in order to
be revert back the changes if needed. The solution offers an automated flow to
create and use a custom template for redacting in the selected variables.
Lastly, the solution highlights which tags contain reference(s) to any of the
selected variables.

--------------------------------------------------------------------------------

## Setup

Make a copy of
[this spreadsheet template](https://docs.google.com/spreadsheets/d/1dAuaFqrDENfsVwjIbVwkbL1P4pxZDT0o8cfcSEOsL8A).

Open the configuration tab in your own spreadsheet and copy the GTM URL to web
workspace in the cell "C1".
![Copy the GTM URL of the workspace](images/variable_redactor_GTM_url.png)

When you first run the Variable Redactor tool, Google Sheets will require you to
authorize the usage of Apps Scripts within the sheet.
You will need to run selected option again afterwards.

![Authorization prompt](images/request_for_authorization.png)


![Authorize by clicking on Allow](images/authorize.png)

App Blocked issues are relevant for company policy restrictions and can be
avoided by [adding GCP project to the Spreadsheet](https://developers.google.com/apps-script/guides/cloud-platform-projects#standard)

Join the group [Variable Redactor Users](https://groups.google.com/g/variable_redactor_users)
for support.

## Run

On the top menu click on "Variable Redactor" -> "Prepare Variables and Tags"

Wait until the execution is completed. You can check the status in Configuration
sheet (look for the value 'Go to Variables sheet, select the ones you want to
redact and click on "Variable Redactor" -> "Process Selected Variables"').

Open the "Variables" sheet and check those that you want to make consent aware.

You can also decide if you want to target the "Ad Storage" , "Analytics Storage"
or both.

On the top menu click on "Variable Redactor" -> "Process selected Variables"

Wait until the execution is completed. You can check the status in Configuration
sheet (look for the value 'Completed variables processing').

You can now check on the "Tags" sheet which tags contain references to any of
the flagged variables and proceed to update those Tags in Google Tag Manager
with the new Variables.

## Disclaimers

**This is not an officially supported Google product.**

*Copyright 2023 Google LLC. This solution, including any related sample code or
data, is made available on an “as is,” “as available,” and “with all faults”
basis, solely for illustrative purposes, and without warranty or representation
of any kind. This solution is experimental, unsupported and provided solely for
your convenience. Your use of it is subject to your agreements with Google, as
applicable, and may constitute a beta feature as defined under those agreements.
To the extent that you make any data available to Google in connection with your
use of the solution, you represent and warrant that you have all necessary and
appropriate rights, consents and permissions to permit Google to use and process
that data. By using any portion of this solution, you acknowledge, assume and
accept all risks, known and unknown, associated with its usage, including with
respect to your deployment of any portion of this solution in your systems, or
usage in connection with your business, if at all.*
