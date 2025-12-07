import initLibraries from "./version";
import jsPDF from "jspdf";

// Paper sizes in mm
const PAPER_MM = {
  A4: [210, 297],
  Letter: [215.9, 279.4]
};

// Convert mm to pixels using DPI
const mmToPx = (mm, dpi) => Math.round(mm * (dpi / 25.4));

// Collect all pages from PDF files
const collectAllPages = async (files) => {
  const pages = [];
  for (const file of files) {
    const arr = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: arr }).promise;
    pages.push({ doc, numPages: doc.numPages });
  }
  return pages;
};

// Main composition function
export const composeNUp = async (config, onProgress) => {
  await initLibraries();

  const {
    files,
    rows,
    cols,
    outerMarginMM,
    innerMarginMM,
    showBorder,
    dpi,
    paper,
    orientation,
    outputName
  } = config;

  if (!files.length) throw new Error('No files selected');

  const pagesPerSheet = rows * cols;
  
  onProgress({ status: 'Loading documents...', progress: 5 });

  // Calculate sheet dimensions
  const [pw_mm, ph_mm] = PAPER_MM[paper];
  let [sheetW_mm, sheetH_mm] = orientation === 'landscape' 
    ? [ph_mm, pw_mm] 
    : [pw_mm, ph_mm];

  const sheetW_px = mmToPx(sheetW_mm, dpi);
  const sheetH_px = mmToPx(sheetH_mm, dpi);
  const outerMargin_px = mmToPx(outerMarginMM, dpi);
  const innerMargin_px = mmToPx(innerMarginMM, dpi);

  const printableW = sheetW_px - 2 * outerMargin_px;
  const printableH = sheetH_px - 2 * outerMargin_px;
  const thumbW = Math.floor((printableW - (cols - 1) * innerMargin_px) / cols);
  const thumbH = Math.floor((printableH - (rows - 1) * innerMargin_px) / rows);

  // Collect pages
  const pageDocs = await collectAllPages(files);
  const totalPages = pageDocs.reduce((s, p) => s + p.numPages, 0);
  
  if (!totalPages) throw new Error('No pages found');

  onProgress({ status: 'Rendering pages...', progress: 10 });

  // Render all pages to images
  const pageImages = [];
  let processed = 0;

  for (const entry of pageDocs) {
    for (let p = 1; p <= entry.numPages; p++) {
      const page = await entry.doc.getPage(p);
      const baseVp = page.getViewport({ scale: 1 });
      const scale = Math.min(thumbW / baseVp.width, thumbH / baseVp.height, 2.5);
      const vp = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(vp.width);
      canvas.height = Math.round(vp.height);
      const ctx = canvas.getContext('2d');
      
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      pageImages.push({ dataUrl, w: canvas.width, h: canvas.height });
      processed++;
      
      const pct = 10 + Math.round((processed / totalPages) * 50);
      onProgress({ 
        status: `Rendered ${processed}/${totalPages} pages`, 
        progress: pct 
      });
      
      await new Promise(r => setTimeout(r, 5));
    }
    entry.doc.destroy();
  }

  // Compose sheets
  onProgress({ status: 'Composing sheets...', progress: 60 });

  const sheetCount = Math.ceil(pageImages.length / pagesPerSheet);
  let outPdf = null;
  let placed = 0;

  for (let s = 0; s < sheetCount; s++) {
    if (!outPdf) {
      outPdf = new jsPDF({ unit: 'px', format: [sheetW_px, sheetH_px] });
    } else {
      outPdf.addPage([sheetW_px, sheetH_px]);
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = s * pagesPerSheet + r * cols + c;
        if (idx >= pageImages.length) break;

        const img = pageImages[idx];
        const x = outerMargin_px + c * (thumbW + innerMargin_px);
        const y = outerMargin_px + r * (thumbH + innerMargin_px);

        const scaleFit = Math.min(thumbW / img.w, thumbH / img.h);
        const drawW = Math.round(img.w * scaleFit);
        const drawH = Math.round(img.h * scaleFit);
        const offsetX = x + Math.round((thumbW - drawW) / 2);
        const offsetY = y + Math.round((thumbH - drawH) / 2);

        outPdf.addImage(img.dataUrl, 'JPEG', offsetX, offsetY, drawW, drawH, undefined, 'FAST');

        if (showBorder) {
          outPdf.setLineWidth(1);
          outPdf.setDrawColor(200, 200, 200);
          outPdf.rect(x + 0.5, y + 0.5, thumbW - 1, thumbH - 1);
        }

        placed++;
        const pct = 60 + Math.round((placed / pageImages.length) * 35);
        onProgress({ 
          status: `Placed ${placed}/${pageImages.length} thumbnails`, 
          progress: pct 
        });
      }
    }
    await new Promise(r => setTimeout(r, 8));
  }

  // Finalize
  onProgress({ status: 'Finalizing PDF...', progress: 98 });
  
  const blob = outPdf.output('blob');
  const url = URL.createObjectURL(blob);
  const filename = outputName ? `${outputName}.pdf` : 'nup_output.pdf';

  onProgress({ status: 'Complete!', progress: 100 });

  return { url, filename, blob };
};