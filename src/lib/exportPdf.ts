"use client";

/**
 * Renders a report into a multi-page A4 PDF (html2canvas + jsPDF, loaded on demand).
 * Each direct child of `root` is captured separately so page breaks fall between blocks.
 */
export async function exportElementToPdf(root: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const gap = 4;
  const imgW = pageW - margin * 2;
  const bottom = pageH - margin - 4;
  let y = margin;
  let page = 1;

  const footer = () => {
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    pdf.text(`KiberQalqan analytics report - page ${page}`, margin, pageH - 3); // built-in PDF fonts have no Cyrillic
  };

  const blocks = Array.from(root.children) as HTMLElement[];
  for (const block of blocks) {
    const canvas = await html2canvas(block, { backgroundColor: "#0a0e20", scale: 2, useCORS: true, logging: false, windowWidth: Math.max(root.scrollWidth, 1100) });
    const pxPerMm = canvas.width / imgW;
    const totalH = canvas.height / pxPerMm;

    // block fits on the current page (or is small): place as a whole, else start a new page first
    if (y + totalH > bottom && y > margin && totalH <= bottom - margin) {
      footer();
      pdf.addPage();
      page += 1;
      y = margin;
    }

    // tall blocks (tables) are sliced across pages
    let offset = 0;
    while (offset < canvas.height) {
      const avail = Math.floor((bottom - y) * pxPerMm);
      if (avail < 40 * pxPerMm && y > margin) {
        footer();
        pdf.addPage();
        page += 1;
        y = margin;
        continue;
      }
      const h = Math.min(avail, canvas.height - offset);
      const slice = document.createElement("canvas");
      slice.width = canvas.width;
      slice.height = h;
      const ctx = slice.getContext("2d")!;
      ctx.fillStyle = "#0a0e20";
      ctx.fillRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, offset, canvas.width, h, 0, 0, canvas.width, h);
      pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", margin, y, imgW, h / pxPerMm);
      y += h / pxPerMm + gap;
      offset += h;
    }
  }
  footer();
  pdf.save(filename);
}
