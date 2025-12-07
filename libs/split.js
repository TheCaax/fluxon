import initLibraries from './version';
import jsPDF from 'jspdf';

// Split PDF into individual pages
export const splitPDF = async (file, onProgress) => {
  await initLibraries();

  onProgress({ status: 'Loading PDF...', progress: 10 });

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  if (!totalPages) throw new Error('No pages found in PDF');

  onProgress({ status: 'Splitting pages...', progress: 20 });

  const results = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2.0 });

    // Render page to canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Create new PDF with this page
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: viewport.width > viewport.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [viewport.width, viewport.height]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
    const blob = pdf.output('blob');

    results.push({
      blob,
      filename: `page_${pageNum}.pdf`,
      pageNum
    });

    const progress = 20 + Math.round((pageNum / totalPages) * 70);
    onProgress({ 
      status: `Split page ${pageNum}/${totalPages}`, 
      progress 
    });

    await new Promise(r => setTimeout(r, 10));
  }

  pdf.destroy();
  onProgress({ status: 'Complete!', progress: 100 });

  return results;
};

// Split PDF by page ranges
export const splitByRanges = async (file, ranges, onProgress) => {
  await initLibraries();

  onProgress({ status: 'Loading PDF...', progress: 10 });

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  if (!totalPages) throw new Error('No pages found in PDF');

  onProgress({ status: 'Processing ranges...', progress: 20 });

  const results = [];
  let processed = 0;
  const totalRanges = ranges.length;

  for (let rangeIdx = 0; rangeIdx < ranges.length; rangeIdx++) {
    const range = ranges[rangeIdx];
    const { start, end } = range;

    if (start < 1 || end > totalPages || start > end) {
      throw new Error(`Invalid range: ${start}-${end}`);
    }

    // Create new PDF for this range
    let newPdf = null;

    for (let pageNum = start; pageNum <= end; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport }).promise;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (!newPdf) {
        newPdf = new jsPDF({
          orientation: viewport.width > viewport.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [viewport.width, viewport.height]
        });
        newPdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
      } else {
        newPdf.addPage([viewport.width, viewport.height]);
        newPdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
      }

      processed++;
      const progress = 20 + Math.round((processed / ranges.reduce((sum, r) => sum + (r.end - r.start + 1), 0)) * 70);
      onProgress({ 
        status: `Processing range ${rangeIdx + 1}/${totalRanges}, page ${pageNum}`, 
        progress 
      });

      await new Promise(r => setTimeout(r, 10));
    }

    const blob = newPdf.output('blob');
    results.push({
      blob,
      filename: start === end ? `page_${start}.pdf` : `pages_${start}-${end}.pdf`,
      range: `${start}-${end}`
    });
  }

  pdf.destroy();
  onProgress({ status: 'Complete!', progress: 100 });

  return results;
};

// Download all files as ZIP
export const downloadAsZip = async (files, zipName = 'split_pdfs.zip', onProgress) => {
  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add files to zip
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      zip.file(file.filename, file.blob);
      
      if (onProgress) {
        const progress = Math.round((i / files.length) * 100);
        onProgress({
          status: `Adding files to ZIP... (${i + 1}/${files.length})`,
          progress
        });
      }
    }

    // Generate ZIP and download
    if (onProgress) {
      onProgress({
        status: 'Generating ZIP file...',
        progress: 95
      });
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipName;
    link.click();
    
    await new Promise(r => setTimeout(r, 100));
    URL.revokeObjectURL(url);

    if (onProgress) {
      onProgress({
        status: 'ZIP downloaded successfully!',
        progress: 100
      });
    }
  } catch (err) {
    console.error('Error creating ZIP:', err);
    throw new Error(`Failed to create ZIP: ${err.message}`);
  }
};