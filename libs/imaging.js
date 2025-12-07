import initLibraries from './version';
// start

export const getPageCount = async (file) => {
  await initLibraries();
  
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  pdf.destroy();
  
  return pageCount;
};

// Convert PDF to images
export const pdfToImages = async (file, options, onProgress) => {
  await initLibraries();

  const {
    format = 'png', // 'png', 'jpeg', 'webp'
    quality = 0.95,  // 0-1 for jpeg/webp
    scale = 2.0,     // DPI multiplier
    pages = 'all',   // 'all' or array of page numbers
    prefix = 'page'
  } = options;

  onProgress({ status: 'Loading PDF...', progress: 10 });

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  if (!totalPages) throw new Error('No pages found in PDF');

  // Determine which pages to convert
  let pageList = [];
  if (pages === 'all') {
    pageList = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else if (Array.isArray(pages)) {
    pageList = pages.filter(p => p >= 1 && p <= totalPages);
  }

  if (!pageList.length) throw new Error('No valid pages to convert');

  onProgress({ status: 'Converting pages...', progress: 20 });

  const results = [];
  const mimeType = format === 'png' ? 'image/png' : 
                   format === 'jpeg' ? 'image/jpeg' : 
                   'image/webp';

  for (let i = 0; i < pageList.length; i++) {
    const pageNum = pageList[i];
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Render page to canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    // Set white background for better quality
    if (format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convert to blob
    const blob = await new Promise((resolve) => {
      if (format === 'png') {
        canvas.toBlob(resolve, mimeType);
      } else {
        canvas.toBlob(resolve, mimeType, quality);
      }
    });

    const extension = format === 'jpeg' ? 'jpg' : format;
    results.push({
      blob,
      filename: `${prefix}_${pageNum}.${extension}`,
      pageNum,
      width: canvas.width,
      height: canvas.height
    });

    const progress = 20 + Math.round(((i + 1) / pageList.length) * 70);
    onProgress({ 
      status: `Converted page ${i + 1}/${pageList.length}`, 
      progress 
    });

    await new Promise(r => setTimeout(r, 10));
  }

  pdf.destroy();
  onProgress({ status: 'Complete!', progress: 100 });

  return results;
};

// Convert specific page ranges
export const convertPageRanges = async (file, rangeString, options, onProgress) => {
  await initLibraries();

  // Parse ranges like "1-3, 5, 7-10"
  const pages = parseRanges(rangeString);
  
  return pdfToImages(file, { ...options, pages }, onProgress);
};

// Parse range string to array of page numbers
const parseRanges = (rangeString) => {
  const pages = new Set();
  const parts = rangeString.split(',').map(s => s.trim());

  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(s => parseInt(s.trim()));
      if (!isNaN(start) && !isNaN(end) && start >= 1 && end >= start) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      const page = parseInt(part);
      if (!isNaN(page) && page >= 1) {
        pages.add(page);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
};

// Download all images as ZIP
export const downloadAsZip = async (files, zipName = 'images.zip', onProgress) => {
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
          status: `Adding images to ZIP... (${i + 1}/${files.length})`,
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