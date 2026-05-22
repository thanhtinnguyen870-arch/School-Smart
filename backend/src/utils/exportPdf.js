import PDFDocument from "pdfkit";

export const sendPdf = (res, title, rows) => {
  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);
  doc.fontSize(18).text(title);
  doc.moveDown();
  rows.forEach((row) => doc.fontSize(10).text(JSON.stringify(row)));
  doc.end();
};
