const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Extracts sheetId from the provided Google Sheets URL
 * @param {string} url - The URL of the Google Sheet
 * @returns {string} - The sheetId extracted from the URL
 */
function extractSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) {
    throw new Error("Invalid Google Sheets URL. Please provide a valid URL.");
  }
  return match[1];
}

/**
 * Fetches the headers from a Google Sheet.
 * @param {string} url - The URL of the Google Sheet
 * @returns {Array<string>} - An array of headers
 */
async function fetchGoogleSheetHeaders(url) {
  try {
    const sheetId = extractSheetId(url);
    const apiKey = process.env.GSHEETS_API_KEY;

    if (!apiKey) {
      throw new Error("Google Sheets API key is not set in process.env.GSHEETS_API_KEY");
    }

    // Google Sheets API endpoint
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;

    // Fetch data from the API
    const response = await axios.get(apiUrl);
    const { values } = response.data;

    if (!values || values.length === 0) {
      throw new Error("No data found in the sheet.");
    }

    // Extract headers
    const headers = values[0].map((header) => header.trim());

    return headers;
  } catch (error) {
    console.error("Error fetching Google Sheet headers:", error);
    return [];
  }
}


/**
 * Fetches all rows from a Google Sheet, filtering rows with invalid content.
 * @param {string} url - The URL of the Google Sheet
 * @returns {Array<Object>} - An array of rows as objects
 */
async function fetchGoogleSheetRows(url, nameColumn, phoneNumberColumn) {
  try {
    const sheetId = extractSheetId(url);
    const apiKey = process.env.GSHEETS_API_KEY;

    if (!apiKey) {
      throw new Error("Google Sheets API key is not set in process.env.GSHEETS_API_KEY");
    }

    // Google Sheets API endpoint
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;

    // Fetch data from the API
    const response = await axios.get(apiUrl);
    const { values } = response.data;

    if (!values || values.length === 0) {
      throw new Error("No data found in the sheet.");
    }

    // Extract headers
    const headers = values[0].map((header) => header.trim());

    // Find indices for the specified columns
    const nameIndex = headers.indexOf(nameColumn);
    const phoneNumberIndex = headers.indexOf(phoneNumberColumn);

    if (nameIndex === -1 || phoneNumberIndex === -1) {
      throw new Error("Specified column names not found in the sheet.");
    }

    // Extract name and phone number data
    const data = values.slice(1).map(row => ({
      name: row[nameIndex]?.trim() || "",
      phone_number: row[phoneNumberIndex]?.trim() || ""
    }));

    return data;
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    return [];
  }
}


fetchGoogleSheetRows("https://docs.google.com/spreadsheets/d/1gcKKzs3bDjoOfwAtvZ-etberaMlR5-Yyf6A5G2lQr60/edit?usp=sharing", "name", "phone number").then(json_res => {
  console.log(json_res);
});

/*
fetchGoogleSheetHeaders("https://docs.google.com/spreadsheets/d/1gcKKzs3bDjoOfwAtvZ-etberaMlR5-Yyf6A5G2lQr60/edit?usp=sharing").then(json_res => {
  console.log(json_res);
});
*/

