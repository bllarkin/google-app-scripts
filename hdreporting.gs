// Pull out the script properties that have the authentication information in them
const scriptProperties = PropertiesService.getScriptProperties();

function myFunction() {
  const baseURL = scriptProperties.getProperty("BASE_URL");

  // Authenticate to TDX to retrieve bearer token
  const authURL = baseURL + "/TDWebAPI/api/auth/";

  const authCreds = {
    "username": scriptProperties.getProperty("USERNAME"),
    "password": scriptProperties.getProperty("PASSWORD")
  };

  const authOptions = {
    "method": "POST",
    "Content-type": "application/json",
    "charset": "utf-8",
    "payload": authCreds
  };

  // Retrieve bearer token
  let bearer = "Bearer " + UrlFetchApp.fetch(authURL, authOptions).getContentText();
  
  // Build TDX connection info
  const reportID = 344;
  const withData = true;
  const dataSort = '';
  const dataURL = baseURL + "/TDWebApi/api/reports/" + reportID + "?withData=" + withData + "&dataSortExpression=" + dataSort;

  let dataOptions = {
    "headers": {
      "Authorization": bearer
    },
    "method": "get"
  };

  // Parse the response and extract the headers and the content
  let dataResponse = JSON.parse(UrlFetchApp.fetch(dataURL, dataOptions).getContentText());
  dataHeaders = dataResponse.DisplayedColumns;
  dataContent = dataResponse.DataRows;

  // Put report info into sheet
  // Clear all content from the sheet
  let currentSheet = SpreadsheetApp.getActive().getSheetByName("TDX_Data").clearContents();

  // Insert new content into the sheet
  // Put headers into a new array
  var headerColumns = [];
  for (var headerNum = 0; headerNum < dataHeaders.length; headerNum++) {
    headerColumns.push(dataHeaders[headerNum].HeaderText);
  }

  // Append the header row to the sheet
  currentSheet.appendRow(headerColumns);

  // Insert data into sheet
  // Used bracket notation due to the hypens in the property name
  for (var rowNum = 0; rowNum < dataContent.length; rowNum++){
    currentSheet.appendRow([dataContent[rowNum]["ClosedDate"],dataContent[rowNum]["ResponsibleGroupName"],dataContent[rowNum]["ServiceName"],dataContent[rowNum]["ServiceOfferingName"]]);
  }
}
