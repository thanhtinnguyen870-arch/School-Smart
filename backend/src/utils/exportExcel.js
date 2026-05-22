import XLSX from "xlsx";

const borderStyle = {
  top: { style: "thin", color: { rgb: "334155" } },
  bottom: { style: "thin", color: { rgb: "334155" } },
  left: { style: "thin", color: { rgb: "334155" } },
  right: { style: "thin", color: { rgb: "334155" } }
};

const applyWorksheetStyle = (worksheet, rows, options = {}) => {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1");
  const headerFill = options.headerFill || "DBEAFE";

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellRef]) continue;

      worksheet[cellRef].s = {
        border: borderStyle,
        alignment: { vertical: "center", horizontal: row === 0 ? "center" : "left", wrapText: true },
        font: row === 0 ? { bold: true, color: { rgb: "0F172A" } } : { color: { rgb: "111827" } },
        fill: row === 0 ? { fgColor: { rgb: headerFill } } : undefined
      };
    }
  }

  worksheet["!cols"] = options.columns || Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.max(12, Math.min(34, key.length + 6))
  }));
  worksheet["!rows"] = [{ hpt: 24 }, ...rows.map(() => ({ hpt: 22 }))];
};

export const sendExcel = (res, rows, sheetName = "Report", fileName = "report.xlsx", options = {}) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  applyWorksheetStyle(worksheet, rows, options);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
};
