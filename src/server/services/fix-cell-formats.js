/*
--------------------------------------------------------------------------------
-                            fix-cell-formats.js
--------------------------------------------------------------------------------
  fixCellFormats() attempts to identify the cells in a sheet that contain
  dates or dollar amounts, and attempts to make them appear in Excel
  correctly formatted.
*/

module.exports = fixCellFormats;

function fixCellFormats(sheet) {
  const { columns, dateColumns, amountColumns } = getColumns(sheet);

  dateColumns.forEach(dateColumn => {
    let cellRefs = columns[dateColumn];
    cellRefs.forEach(cellRef => {
      if (sheet[cellRef].t === "n") {
        // this doesn't work, though according to
        //  https://github.com/SheetJS/sheetjs#number-formats
        // it should.
        // sheet[cellRef].z = 14;

        // see "Data Upload Service DataDictionary 09282020.xlsx"
        sheet[cellRef].z = "mm/dd/yyyy";

        // this also works, but more compute
        // sheet[cellRef].v = toJSDate(cell.v);
        // sheet[cellRef].t = "d";
      }
    });
  });

  amountColumns.forEach(amountColumn => {
    let cellRefs = columns[amountColumn];
    cellRefs.forEach(cellRef => {
      if (sheet[cellRef].t === "n") {
        // see "Data Upload Service DataDictionary 09282020.xlsx"
        sheet[cellRef].z = "#,##0.00;(#,##0.00)";
      }
    });
  });
  return sheet;
}

/* getColumns() scans the cells in a sheet and organizes them into
  columns, plus it tries to identify which columns contain dates
  */
function getColumns(sheet) {
  let columns = [];
  let dateColumns = [];
  let amountColumns = [];
  Object.keys(sheet).forEach(cellRef => {
    let rc = toRC(cellRef);
    if (rc) {
      if (!columns[rc.C]) {
        columns[rc.C] = [];
      }
      if (rc.R === 1) {
        let columnName = sheet[cellRef].v;
        if (isDateColumn(columnName)) {
          dateColumns.push(rc.C);
        } else if (isAmountColumn(columnName)) {
          amountColumns.push(rc.C);
        }
      }
      columns[rc.C].push(cellRef);
    }
  });

  return {
    columns: columns, // an array of arrays of cellRefs
    amountColumns: amountColumns, // an array of numeric column indexes
    dateColumns: dateColumns // an array of numeric column indexes
  };
}

/* isDateColumn() expects a string and returns true if the word "Date"
  appears in the string

  BUG! if a non-date column has Date in its title, or a column of dates
  does not have the word Date in its title
  */
function isDateColumn(columnName) {
  const rx = /\bDate\b/i;
  return Boolean(rx.exec(columnName));
}

/* isAmountColumn() expects a string and returns true if the word "Amount"
  appears in the string or the words "Current Quarter" begin the string

  BUG! if a non-amount column has Amount or Current Quarter in its title,
  or a column of amounts does not have them in its title
  */
function isAmountColumn(columnName) {
  if (/\bAmount\b/i.exec(columnName)) {
    return true;
  }
  if (/^Current Quarter\b/i.exec(columnName)) {
    return true;
  }
}

/*  toRC() converts an A1-style cellref to {R:0,C:0} or null if the
  argument is not a valid cellRef
  */
function toRC(cellRef) {
  let rx = /^([A-Z]{1,2})(\d+)$/;
  let r = rx.exec(cellRef);

  return r ? { R: Number(r[2]), C: toDecimal(r[1]) } : null;
}

/* toDecimal() converts an 'A' style column index to an integer column index
 */
function toDecimal(colRef) {
  if (!colRef || colRef.length > 3) {
    return null;
  }

  let rv = 0;
  for (let i = 0; i < colRef.length; i++) {
    rv = rv * 26 + colRef.charCodeAt(i) - 64;
  }
  return rv - 1;
}

/* toJSDate() converts an Excel date to a JS date
  Simple conversion because we are interested in date only, not time
  Subtract 1 from excelDate because Excel (wrongly) thinks 1900 is a leap year
  */
// function toJSDate(excelDate) {
//   // return new Date(0, 0, Math.floor(excelDate - 1)).valueOf;

//   let jsDate = new Date(0, 0, Math.floor(excelDate - 1));
//   return `${jsDate.getMonth() + 1}/${jsDate.getDate()}/${jsDate.getFullYear()}`;
// }

/*                                  *  *  *                                   */