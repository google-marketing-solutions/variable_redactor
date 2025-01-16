// Copyright 2023, Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
* return the amount of milliseconds required to sleep
* @return{number} amount of milliseconds to wait.
* @private
*/
function getMillisecondsToSleep_(){
  return 4000;
}
/**
 * Tries to retrieve the folder Id of folder with the provided name. If it
 * doesn't exist, it creates the folder and returns the folder Id.
 * @param{string} folderName: Nome of target folder
 * @param{string} basePath: Path to with the following structure:
 * accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}
 * @return{number} the id of the folder with the provided name
 * @private
 */
function createOrObtainFolderId_(folderName, basePath) {
  const existingFolders =
      TagManager.Accounts.Containers.Workspaces.Folders.list(
          basePath, {fields: 'folder(name,folderId)'});
  // Search for the folder with the given name
  if (!!existingFolders && !!existingFolders.folder) {
    for (const folder of existingFolders.folder) {
      if (folder.name === folderName) {
        customLog_(`Retrieved folder with id ${folder.folderId}`);
        return folder.folderId;
      }
    }
  }
  // Create the folder since it doesn't exist
  const createNewFolder =
      TagManager.Accounts.Containers.Workspaces.Folders.create(
          {name: folderName}, basePath);
  customLog_(`Created folder with id ${createNewFolder.folderId}`);
  return createNewFolder.folderId;
}
/**
 * Retrieves from the configuration sheet the value of the base path. If it
 * doesn't exist, it alerts the user via alert and throws an exception
 * @return{string} the base path provided in the configuration sheet
 * @private
 */
function getBasePath_() {
  const spreadsheet =
      SpreadsheetApp.getActive().getSheetByName('Configuration');
  const gtmURL = spreadsheet.getRange(1, 3).getValue();
  const res = gtmURL.replace('https://tagmanager.google.com/#/container/', '');
  if (!res) {
    alert(
        'Please insert the value of "GTM URL to web workspace" in the configuration tag before proceed!');
    throw (
        'Please insert the value of "GTM URL to web workspace" in the configuration tag before proceed!');
  }
  return res;
}
/**
 * Tries to retrieve the template Id of template with the name 'Redactor'. If
 * it doesn't exist, it creates the template and returns the template Id.
 * @param{string} basePath: Path to with the following structure:
 * accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}
 * @return{string} the sequence to identify the container:
 * cvt_CONTAINERID_TEMPLATEID
 * @private
 */
function retrieveOrCreateTemplate_(basePath) {
  const templateName = 'Redactor';
  // Search for the Redactor template
  const response = TagManager.Accounts.Containers.Workspaces.Templates.list(
      basePath, {fields: 'template(templateId,containerId,name)'});
  if (!!response && !!response.template) {
    for (let template of response.template) {
      if (template.name === templateName) {
        customLog_(
            `Template = cvt_${template.containerId}_${template.templateId}`);
        return `cvt_${template.containerId}_${template.templateId}`;
      }
    }
  }
  // Creting Redactor custom template
  const newCustomTemplate =
      TagManager.Accounts.Containers.Workspaces.Templates.create(
          {
            templateData:
                '___INFO___\n\n{\n "type": "MACRO",\n "id": "cvt_temp_public_id",\n "version": 1,\n "securityGroups": [],\n "displayName": "' +
                templateName +
                '",\n "description": "Redact variables based on the Consent Status",\n "containerContexts": [\n "WEB"\n ]\n}\n\n\n___TEMPLATE_PARAMETERS___\n\n[\n {\n "type": "SELECT",\n "name": "redactor",\n "displayName": "Variable to redactor",\n "macrosInSelect": true,\n "selectItems": [],\n "simpleValueType": true\n },\n {\n "type": "SELECT",\n "name": "storage_type",\n "displayName": "Which consent mode storage to listen to?",\n "macrosInSelect": false,\n "selectItems": [\n {\n "value": "ad_storage",\n "displayValue": "ad_storage"\n },\n {\n "value": "analytics_storage",\n "displayValue": "analytics_storage"\n },\n {\n "value": "both",\n "displayValue": "Both ads and analytics storage"\n }\n ],\n "simpleValueType": true\n }\n]\n\n\n___SANDBOXED_JS_FOR_WEB_TEMPLATE___\n\n// Enter your template code here.\nconst log = require(\'logToConsole\');\nlog(\'data =\', data);\n\nconst isConsentGranted = require(\'isConsentGranted\');\n//const addConsentListener = require(\'addConsentListener\');\n\nif (data.storage_type == \'both\') {\n \n if (!isConsentGranted(\'ad_storage\') || !isConsentGranted(\'analytics_storage\')) {\n return \'\';\n } else { \n return data.redactor;\n }\n} else {\n if (!isConsentGranted(data.storage_type)){\n return \'\';\n } else { \n return data.redactor;\n }\n}\n\n\n___WEB_PERMISSIONS___\n\n[\n {\n "instance": {\n "key": {\n "publicId": "logging",\n "versionId": "1"\n },\n "param": [\n {\n "key": "environments",\n "value": {\n "type": 1,\n "string": "debug"\n }\n }\n ]\n },\n "isRequired": true\n },\n {\n "instance": {\n "key": {\n "publicId": "access_consent",\n "versionId": "1"\n },\n "param": [\n {\n "key": "consentTypes",\n "value": {\n "type": 2,\n "listItem": [\n {\n "type": 3,\n "mapKey": [\n {\n "type": 1,\n "string": "consentType"\n },\n {\n "type": 1,\n "string": "read"\n },\n {\n "type": 1,\n "string": "write"\n }\n ],\n "mapValue": [\n {\n "type": 1,\n "string": "ad_storage"\n },\n {\n "type": 8,\n "boolean": true\n },\n {\n "type": 8,\n "boolean": false\n }\n ]\n },\n {\n "type": 3,\n "mapKey": [\n {\n "type": 1,\n "string": "consentType"\n },\n {\n "type": 1,\n "string": "read"\n },\n {\n "type": 1,\n "string": "write"\n }\n ],\n "mapValue": [\n {\n "type": 1,\n "string": "analytics_storage"\n },\n {\n "type": 8,\n "boolean": true\n },\n {\n "type": 8,\n "boolean": false\n }\n ]\n }\n ]\n }\n }\n ]\n },\n "clientAnnotations": {\n "isEditedByUser": true\n },\n "isRequired": true\n }\n]\n\n\n___TESTS___\n\nscenarios: []\n\n\n___NOTES___\n\nCreated on 6/23/2022, 9:48:57 AM\n\n\n'
          },
          basePath);
  const templateId = newCustomTemplate.templateId;
  const templateContainer = newCustomTemplate.containerId;
  customLog_(`Template = cvt_${templateContainer}_${templateId}`);
  return `cvt_${templateContainer}_${templateId}`;
}
/**
 * Duplicate an existing variable (in the Redactor folder) and uses the
 * Redactor template: it redacts its content according to the user consent
 * status.
 * @param{string} variableName: Name of the variable to duplicate
 * @param{string} folderId: id of the folder where the variable has to be
 * created into.
 * @param{string} basePath: Path to with the following structure:
 * accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}
 * @param{string} variableTarget: where the variable is going to be stored.
 * Google Ads, GA4 or both
 * @param{string} template: Identifier for the template
 * @return{!object} Message that specifies if the creation process has been
 * successful or not.
 * @private
 */
function processVariable_(
    variableName, folderId, basePath, variableTarget, template) {
  let message = 'Processed';
  try {
    // Create a new variable name by appending "_redacted" to the original
    // name
    const newVariableName = variableName + '_redacted';
    // Create the new variable
    TagManager.Accounts.Containers.Workspaces.Variables.create(
        {
          name: newVariableName,
          type: `${template}`,
          parameter: [
            {
              'type': 'template',
              'key': 'storage_type',
              'value': `${variableTarget}`
            },
            {
              'type': 'template',
              'key': 'redactor',
              'value': `{{${variableName}}}`
            }
          ],
          formatValue: {},
          parentFolderId: `${folderId}`
        },
        basePath);
    customLog_(`Created variable ${newVariableName}`);
  } catch (e) {
    customLog_('Failed with error:', e);
    message = 'Error while creating the variable. Check for duplicates!';
  }
  return {message: message};
}

/**
* Sets for tags that don't need to be checked the value "waiting for processing" 
* in order to allow new executions of the flow.
* @private
*/
function updateNonToBeChekedTagStatus_(){
  const tagsSpreadsheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');

  const data = tagsSpreadsheet.getRange(
      2,
      1,
      tagsSpreadsheet.getLastRow(),
      3).getValues();

  for(let row = 0; row <tagsSpreadsheet.getLastRow(); row++) {

    if(data[row][2] === '' && data[row][0] !== '') {
      tagsSpreadsheet.getRange(
      row + 2,
      3).setValue('Waiting for processing');
    }
  }
}

/**
 * Iterates all flagged variables and creates their redacted duplicates. Once
 * all the variables have been processed, it removes the trigger used to resume
 * execution and notifies the user in the Configuration tab
 * @private
 */
function processVariables_() {
  updateNonToBeChekedTagStatus_();
  updateProcessStatusOnConfigurationPage_('Begin variables processing');
  const basePath = getBasePath_();
  const folderId = createOrObtainFolderId_('Redactor', basePath);
  const template = retrieveOrCreateTemplate_(basePath);
  const spreadsheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Variables');
  const variables =
      spreadsheet.getRange(2, 1, spreadsheet.getLastRow(), 5).getValues();
  let row = 1;
  for (const variableData of variables) {
    row++;
    // 0 = name, 1 = id, 2 = to be processed, 3 = target, 4 = processed
    if (!variableData[0] || !variableData[1] || !variableData[2] ||
        variableData[2] === false || variableData[4] === 'Processed' ||
        variableData[4] ===
            'Error while creating the variable. Check for duplicates!') {
      continue;
    }
    const response = processVariable_(
        variableData[0], folderId, basePath, variableData[3], template);
    spreadsheet.getRange(row, 5).setValue(response.message);
    Utilities.sleep(
        getMillisecondsToSleep_());  // Wait in order not to trigger quota of calls per second
  }
  // Delete variables trigger since all variables have been processed
  deleteTargetTrigger_('processVariables_');
  customLog_('Completed variables processing');
  // Create the tags trigger
  processTagsTrigger_();
}
/**
 * Updates the Configuration tab by providing the new status.
 * @param{string} message: New status of the execution
 * @private
 */
function updateProcessStatusOnConfigurationPage_(message) {
  const spreadsheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Configuration');
  spreadsheet.getRange(3, 3).setValue(message);
  customLog_(message);
  SpreadsheetApp.flush();
}
/**
 * Schedules and runs the processing of all flagged variables.
 * @private
 */
function processVariablesTrigger_() {
  deleteTargetTrigger_('processVariables_');
  ScriptApp.newTrigger('processVariables_').timeBased().everyHours(2).create();
  processVariables_();
}
/**
 * Schedules and runs the analysis of all tags to identify those that need to be
 * checked.
 * @private
 */
function processTagsTrigger_() {
  deleteTargetTrigger_('processTags_');
  ScriptApp.newTrigger('processTags_').timeBased().everyHours(2).create();
  processTags_();
}
/**
 * Cleans up the Tags tab and then inserts into it all the tags of the account.
 * @param{string} basePath: Path to with the following structure:
 * accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}
 * @private
 */
function initTags_(basePath) {
  customLog_('Begin tags initialization');
  const spreadsheet = cleanAndGetSpreadsheet_('Tags');
  const response = TagManager.Accounts.Containers.Workspaces.Tags.list(
      basePath, {fields: 'tag(name,tagId)'});
  if (!!response && !!response.tag) {
    const tags = [];
    for (const tag of response.tag) {
      tags.push([`${tag.name}`, `${tag.tagId}`]);
    }
    spreadsheet.getRange(2, 1, tags.length, tags[0].length).setValues(tags);
    spreadsheet.getRange(2, 3, 1 + tags.length, 1).setBackground('white');
  }
  customLog_('All tags initialized');
  SpreadsheetApp.flush();
}
/**
 * For each tag in the account it checks if it contains at least one of the
 * processed variables. If so, it writes into the spreadsheet "Please check this
 * tag!" and sets the background color to #ffdc9b Once the excecution has been
 * compleated, it removes the trigger that invokes this function and notifies
 * the user in the Configuration tab.
 * @private
 */
function processTags_() {
  customLog_('Begin tags verification');
  const basePath = getBasePath_();
  const variablesSpreadsheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Variables');
  const variables =
      variablesSpreadsheet.getRange(2, 1, variablesSpreadsheet.getLastRow(), 5)
          .getValues();
  const variablesProcessed =
      variables.filter((data) => !!data[0] && data[4] === 'Processed')
          .map((data) => data[0]);  // The Set data structure for some unknown
                                    // reasons doesn't work...
  const tagsSpreadsheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
  const tags = tagsSpreadsheet.getRange(2, 1, tagsSpreadsheet.getLastRow(), 3)
                   .getValues();
  for (let index = 0; index < tags.length; index++) {
    if (!tags[index] || !tags[index][0] || !tags[index][1] ||
        tags[index][2] !== 'Waiting for processing') {
      continue;
    }
    const response = TagManager.Accounts.Containers.Workspaces.Tags.get(
        `${basePath}/tags/${parseInt(tags[index][1])}`);
    Utilities.sleep(getMillisecondsToSleep_());
    let message = '';
    if (!!response && !!response.parameter) {
      let parametersStringified = JSON.stringify(response.parameter);
      for (const variable of variablesProcessed) {
        if (parametersStringified.indexOf(`{{${variable}}}`) !== -1) {
          message = 'Please check this tag!';
          tagsSpreadsheet.getRange(index + 2, 3).setBackground('#ffdc9b');
          break;
        }
      }
    }
    tagsSpreadsheet.getRange(index + 2, 3).setValue(message);
  }
  SpreadsheetApp.flush();
  customLog_('All tags verified');
  deleteTargetTrigger_('processTags_');
  updateProcessStatusOnConfigurationPage_(
      'Execution completed. Please check the Tags sheet to see which Google Tags have to be checked on GTM.');
}
/**
 * Cleans up the Variables tab and then inserts into it all the variables of the
 * account.
 * @param{string} basePath: Path to with the following structure:
 * accounts/{account_id}/containers/{container_id}/workspaces/{workspace_id}
 * @private
 */
function initVariables_(basePath) {
  customLog_('Begin variables initialization');
  const spreadsheet = cleanAndGetSpreadsheet_('Variables');
  const response =
      TagManager.Accounts.Containers.Workspaces.Variables.list(basePath);
  if (!!response && !!response.variable) {
    const variables = [];
    for (const variable of response.variable) {
      variables.push([`${variable.name}`, `${variable.variableId}`]);
    }
    spreadsheet.getRange(2, 1, variables.length, variables[0].length)
        .setValues(variables);
    spreadsheet.getRange(2, 3, variables.length, 1).insertCheckboxes();
    const destinationRange = spreadsheet.getRange(2, 4, variables.length, 1);
    const rule = SpreadsheetApp.newDataValidation()
                     .requireValueInList(
                         ['both', 'ad_storage', 'analytics_storage'], true)
                     .build();
    const rules = destinationRange.getDataValidations();
    for (let i = 0; i < rules.length; i++) {
      for (let j = 0; j < rules[i].length; j++) {
        rules[i][j] = rule;
      }
    }
    destinationRange.setDataValidations(rules);
    destinationRange.setValue('both');
  }
  prepareForTagsProcessing_();
  customLog_('All variables initialized');
  SpreadsheetApp.flush();
}
/**
 * Initializes both the Tags and Variables tabs.
 * @private
 */
function initTagsAndVariables_() {
  const basePath = getBasePath_();
  initTags_(basePath);
  initVariables_(basePath);
  customLog_('Tags and Variables initialized');
  updateProcessStatusOnConfigurationPage_(
      'Go to Variables sheet, select the ones you want to redact and click on "Variable Redactor" -> "Process Selected Variables"');
}
/**
 * Function loops through all triggers and delete the trigger identified by
 * input handler function.
 * @param{string} handlerFunction: Name of the function that the trigger handles
 * @public
 */
function deleteTargetTrigger_(handlerFunction) {
  if (!!handlerFunction) {
    let triggers = ScriptApp.getProjectTriggers();
    for (let i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === handlerFunction) {
        ScriptApp.deleteTrigger(triggers[i]);
        break;
      }
    }
  }
}
/**
 * Removes all the content (from row 2 till the end of the document) of the
 * sheet having the given sheet name
 * @param{string} sheetName: Name of the sheet to clean
 * @return{!object} object spreadsheet that references to the given sheet name.
 * @private
 */
function cleanAndGetSpreadsheet_(sheetName) {
  const spreadsheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  spreadsheet
      .getRange(2, 1, spreadsheet.getLastRow(), spreadsheet.getLastColumn())
      .setValue('')
      .setBackground("white")
      .setFontColor("black");
  return spreadsheet;
}
/**
 * Cleans the status in the Tags sheet and updates it to 'Waiting for
 * processing'
 * @private
 */
function prepareForTagsProcessing_() {
  const tagsSpreadsheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tags');
  const tags = tagsSpreadsheet.getRange(2, 1, tagsSpreadsheet.getLastRow(), 1)
                   .getValues();
  let lastIndex = 1;
  for (let i = 0; i < tags.length; i++) {
    lastIndex += !!tags[i + 2] ? 1 : 0;
  }
  tagsSpreadsheet.getRange(2, 3, lastIndex, 1)
      .setValue('Waiting for processing');
}
/**
 * Function which builds the custom menu 'Collect GBP data' in the Trix and
 * creates (if missing) the sheets.
 * @param{?object} e: event, automatic input provided by the listener that
 * contains relevant information.
 * @public
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
      .createMenu('Variable Redactor')
      .addItem('Prepare Variables and Tags', 'initTagsAndVariables_')
      .addItem('Process Selected variables', 'processVariablesTrigger_')
      .addItem('Clean logs', 'deleteAllLogs')
      .addToUi();
}
/**
 * Appends a new entry (with timestamp) in the Log sheet.
 * @param{string} message: Message to print
 * @private
 */
function customLog_(message) {
  const logRow = [
    Utilities.formatDate(new Date(), 'Europe/Rome', 'yyyy-MM-dd HH:mm:ss'),
    message
  ];
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs').appendRow(
      logRow);
}
/**
 * Deletes all entries in the logs sheet
 * @private
 */
function deleteAllLogs() {
  const logsSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Logs');
  logsSheet.deleteRows(2,  logsSheet.getLastRow()-1);
}
