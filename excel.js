const XLSX = require('xlsx');

// Load the workbook
const workbook = XLSX.readFile('test.xlsx');

// Select the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Read the value from cell A1
const cellAddress = 'A1';
const cell = worksheet[cellAddress];
const cellValue = cell ? cell.v : undefined;

console.log(`The value in cell A1 is: ${cellValue}`);
