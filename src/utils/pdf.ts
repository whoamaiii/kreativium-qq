import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function makeIlpPdf(goals: any[], entries: any[]) {
  // Create a new PDF document
  const pdf = await PDFDocument.create();
  let currentPage = pdf.addPage([595, 842]); // A4 size
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  // Start position for drawing
  let y = 800;

  // Draw title
  currentPage.drawText('Individualized Learning Plan', {
    x: 50,
    y,
    size: 18,
    font,
  });
  y -= 40;

  // Draw goals section
  goals.forEach(g => {
    currentPage.drawText(`${g.title} – ${g.pct}%`, {
      x: 50,
      y,
      size: 12,
      font,
    });
    
    // Draw progress bar background
    currentPage.drawRectangle({
      x: 50,
      y: y - 8,
      width: 400,
      height: 6,
      color: rgb(0.3, 0.3, 0.6),
    });

    // Draw progress bar fill
    currentPage.drawRectangle({
      x: 50,
      y: y - 8,
      width: 4 * g.pct,
      height: 6,
      color: rgb(0.6, 0.2, 0.8),
    });

    y -= 25;
  });

  // Draw entries table
  if (entries.length > 0) {
    y -= 20;
    currentPage.drawText('Activity Log', {
      x: 50,
      y,
      size: 14,
      font,
    });
    y -= 30;

    // Table headers
    const headers = ['Activity', 'Subject', 'Status', 'Due Date'];
    const columnWidths = [200, 100, 100, 100];
    let x = 50;
    
    headers.forEach((header, i) => {
      currentPage.drawText(header, {
        x,
        y,
        size: 10,
        font,
      });
      x += columnWidths[i];
    });
    y -= 20;

    // Table rows
    entries.forEach(entry => {
      if (y < 50) {
        // Add new page if we're running out of space
        currentPage = pdf.addPage([595, 842]);
        y = 800;
      }

      x = 50;
      
      // Activity
      currentPage.drawText(entry.activity, {
        x,
        y,
        size: 10,
        font,
      });
      x += columnWidths[0];

      // Subject
      currentPage.drawText(entry.subject, {
        x,
        y,
        size: 10,
        font,
      });
      x += columnWidths[1];

      // Status
      currentPage.drawText(entry.status, {
        x,
        y,
        size: 10,
        font,
      });
      x += columnWidths[2];

      // Due Date
      if (entry.due) {
        currentPage.drawText(new Date(entry.due).toLocaleDateString(), {
          x,
          y,
          size: 10,
          font,
        });
      }

      y -= 20;
    });
  }

  // Save the PDF document
  const bytes = await pdf.save();
  return bytes;
}
