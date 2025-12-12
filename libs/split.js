// libs/split.js
import initLibraries, { getPDFJSLib, getJsPDF, VERSION } from './version';

let pdfjsLib = null;
let jsPDF = null;

/**
 * Initialize PDF.js for split operations
 */
async function ensurePDFJSInitialized() {
  if (!pdfjsLib || !jsPDF) {
    await initLibraries();
    pdfjsLib = await getPDFJSLib();
    jsPDF = await getJsPDF();
  }
  return pdfjsLib;
}

// Common function to validate and load PDF
async function loadPDF(file) {
  const pdfjs = await ensurePDFJSInitialized();
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    }).promise;
    
    return pdf;
  } catch (error) {
    console.error('Error loading PDF:', error);
    throw new Error(`Failed to load PDF: ${error.message}`);
  }
}

// Clean up resources
function cleanupResources(pdf, canvases = []) {
  try {
    if (pdf && typeof pdf.destroy === 'function') {
      pdf.destroy();
    }
  } catch (error) {
    console.warn('Error destroying PDF:', error);
  }
  
  // Remove canvases from DOM
  canvases.forEach(canvas => {
    try {
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    } catch (error) {
      console.warn('Error removing canvas:', error);
    }
  });
}

/**
 * Render PDF page to canvas
 */
async function renderPageToCanvas(page, scale = 2.0) {
  const viewport = page.getViewport({ scale });
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.display = 'none'; // Hide from DOM
  
  // Add to DOM for rendering (required for some PDF.js operations)
  if (document.body) {
    document.body.appendChild(canvas);
  }
  
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Fill with white background to handle transparent PDFs
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  try {
    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;
  } catch (renderError) {
    console.error('Error rendering page:', renderError);
    throw new Error(`Failed to render page: ${renderError.message}`);
  }
  
  return { canvas, viewport };
}

/**
 * Create PDF from canvas
 */
function createPDFFromCanvas(canvas, viewport) {
  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  
  const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation: orientation,
    unit: 'px',
    format: [viewport.width, viewport.height],
    compress: true
  });
  
  pdf.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
  return pdf;
}

/**
 * Split PDF into individual pages
 */
export const splitPDF = async (file, onProgress) => {
  let pdf = null;
  const canvases = [];
  
  try {
    onProgress?.({ status: 'Loading PDF...', progress: 10 });
    
    // Load PDF
    pdf = await loadPDF(file);
    const totalPages = pdf.numPages;
    
    if (!totalPages || totalPages === 0) {
      throw new Error('No pages found in PDF');
    }
    
    onProgress?.({ status: `Splitting ${totalPages} pages...`, progress: 20 });
    
    const results = [];
    
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        // Get page
        const page = await pdf.getPage(pageNum);
        
        // Render to canvas
        const { canvas, viewport } = await renderPageToCanvas(page, 2.0);
        canvases.push(canvas);
        
        // Create PDF from canvas
        const pagePDF = createPDFFromCanvas(canvas, viewport);
        const blob = pagePDF.output('blob');
        
        results.push({
          blob,
          filename: `page_${pageNum}.pdf`,
          pageNum
        });
        
        // Update progress
        const progress = 20 + Math.round((pageNum / totalPages) * 70);
        onProgress?.({
          status: `Processed page ${pageNum}/${totalPages}`,
          progress
        });
        
        // Small delay to prevent blocking UI (only for large files)
        if (pageNum % 5 === 0 && totalPages > 10) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      } catch (pageError) {
        console.error(`Error processing page ${pageNum}:`, pageError);
        throw new Error(`Failed to process page ${pageNum}: ${pageError.message}`);
      }
    }
    
    onProgress?.({ status: 'Complete!', progress: 100 });
    return results;
    
  } catch (error) {
    console.error('Error in splitPDF:', error);
    throw error;
  } finally {
    cleanupResources(pdf, canvases);
  }
};

/**
 * Split PDF by page ranges
 */
export const splitByRanges = async (file, ranges, onProgress) => {
  let pdf = null;
  const canvases = [];
  
  try {
    onProgress?.({ status: 'Loading PDF...', progress: 10 });
    
    // Load PDF
    pdf = await loadPDF(file);
    const totalPages = pdf.numPages;
    
    if (!totalPages || totalPages === 0) {
      throw new Error('No pages found in PDF');
    }
    
    // Validate ranges
    const validRanges = ranges.filter(range => 
      range.start >= 1 && 
      range.end <= totalPages && 
      range.start <= range.end
    );
    
    if (validRanges.length === 0) {
      throw new Error('No valid page ranges specified');
    }
    
    onProgress?.({ status: `Processing ${validRanges.length} range(s)...`, progress: 20 });
    
    const results = [];
    let processedRanges = 0;
    let totalProcessedPages = 0;
    const totalPagesToProcess = validRanges.reduce((sum, range) => 
      sum + (range.end - range.start + 1), 0
    );
    
    for (const range of validRanges) {
      try {
        const { start, end } = range;
        let rangePDF = null;
        
        for (let pageNum = start; pageNum <= end; pageNum++) {
          // Get page
          const page = await pdf.getPage(pageNum);
          
          // Render to canvas
          const { canvas, viewport } = await renderPageToCanvas(page, 2.0);
          canvases.push(canvas);
          
          // Create PDF from canvas
          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          
          if (!rangePDF) {
            // First page in range
            rangePDF = new jsPDF({
              orientation: viewport.width > viewport.height ? 'landscape' : 'portrait',
              unit: 'px',
              format: [viewport.width, viewport.height],
              compress: true
            });
            rangePDF.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
          } else {
            // Add page to existing PDF
            rangePDF.addPage([viewport.width, viewport.height], 
                            viewport.width > viewport.height ? 'landscape' : 'portrait');
            rangePDF.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
          }
          
          // Update progress
          totalProcessedPages++;
          const progress = 20 + Math.round((totalProcessedPages / totalPagesToProcess) * 70);
          onProgress?.({
            status: `Processing range ${processedRanges + 1}/${validRanges.length}, page ${pageNum}`,
            progress
          });
          
          // Small delay to prevent blocking UI
          if (totalProcessedPages % 5 === 0 && totalPagesToProcess > 10) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        
        // Save the range PDF
        if (rangePDF) {
          const blob = rangePDF.output('blob');
          const filename = start === end 
            ? `page_${start}.pdf` 
            : `pages_${start}-${end}.pdf`;
          
          results.push({
            blob,
            filename,
            range: `${start}-${end}`
          });
        }
        
        processedRanges++;
        
      } catch (rangeError) {
        console.error(`Error processing range ${range.start}-${range.end}:`, rangeError);
        throw new Error(`Failed to process range ${range.start}-${range.end}: ${rangeError.message}`);
      }
    }
    
    onProgress?.({ status: 'Complete!', progress: 100 });
    return results;
    
  } catch (error) {
    console.error('Error in splitByRanges:', error);
    throw error;
  } finally {
    cleanupResources(pdf, canvases);
  }
};

/**
 * Download all files as ZIP
 */
export const downloadAsZip = async (files, zipName = 'split_pdfs.zip', onProgress) => {
  try {
    // Dynamically import JSZip to reduce bundle size
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    
    onProgress?.({ 
      status: 'Preparing ZIP file...', 
      progress: 5 
    });
    
    // Add files to ZIP
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Add file with its data
      zip.file(file.filename, file.blob);
      
      // Update progress
      if (onProgress) {
        const progress = Math.round(((i + 1) / files.length) * 85) + 5;
        onProgress({
          status: `Adding ${file.filename} (${i + 1}/${files.length})`,
          progress
        });
      }
      
      // Small delay for large batches
      if (i % 10 === 0 && files.length > 20) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    onProgress?.({ 
      status: 'Generating ZIP...', 
      progress: 95 
    });
    
    // Generate ZIP blob
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // Create download link
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = zipName;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (cleanupError) {
        console.warn('Error during cleanup:', cleanupError);
      }
    }, 100);
    
    onProgress?.({ 
      status: 'Download complete!', 
      progress: 100 
    });
    
    return true;
    
  } catch (error) {
    console.error('Error creating ZIP:', error);
    throw new Error(`Failed to create ZIP file: ${error.message}`);
  }
};

// Utility function to get total pages of a PDF
export const getPDFPageCount = async (file) => {
  try {
    const pdfjs = await ensurePDFJSInitialized();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ 
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    }).promise;
    
    const pageCount = pdf.numPages;
    pdf.destroy();
    return pageCount;
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    throw new Error(`Failed to get PDF information: ${error.message}`);
  }
};