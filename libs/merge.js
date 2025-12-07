// libs/merge.js
import { PDFDocument } from "pdf-lib";

let pdfjsLib = null;
let jsPDF = null;
let loadingPromise = null;

// Initialize libraries once
if (typeof window !== "undefined") {
  loadingPromise = Promise.all([
    // PDF.js (version 5.x) – load the browser ESM build
    import("pdfjs-dist/build/pdf.min.mjs").then(async (module) => {
      pdfjsLib = module;
      
      // Set worker source to CDN for reliability
      pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs';
    }).catch(async (err) => {
      console.warn("Failed to load pdf.min.mjs, trying alternative:", err);
      // Fallback to regular build
      const module = await import("pdfjs-dist/build/pdf.mjs");
      pdfjsLib = module;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs';
    }),
    
    import("jspdf").then((module) => {
      jsPDF = module.jsPDF;
    })
  ]);
}

/**
 * Ensure libraries are loaded before use
 */
async function ensureLibrariesLoaded() {
  if (loadingPromise) {
    await loadingPromise;
  }
  
  if (!pdfjsLib || !jsPDF) {
    throw new Error('PDF libraries failed to load. Please refresh and try again.');
  }
}

export class PDFMerger {
  /**
   * Merge multiple PDF files without color inversion
   * @param {Array} files - Array of file objects with {file, id}
   * @param {Function} onProgress - Progress callback (current, total, status)
   * @returns {Promise<Blob>}
  **/
  static async mergeWithoutInvert(files, onProgress) {
    onProgress?.(0, files.length, 'Starting merge...');
    
    const mergedPdf = await PDFDocument.create();
    let processed = 0;

    for (const fileItem of files) {
      const arrayBuffer = await fileItem.file.arrayBuffer();
      const donorPdf = await PDFDocument.load(arrayBuffer, { 
        ignoreEncryption: true 
      });
      
      const copiedPages = await mergedPdf.copyPages(
        donorPdf,
        donorPdf.getPageIndices()
      );
      
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      
      processed++;
      onProgress?.(
        processed,
        files.length,
        `Merging: ${processed}/${files.length} files`
      );
    }

    const pdfBytes = await mergedPdf.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  /**
   * Merge PDFs and invert colors (renders pages to images)
   * @param {Array} files - Array of file objects with {file, id}
   * @param {Function} onProgress - Progress callback (current, total, status, phase)
   * @returns {Promise<Blob>}
   */
  static async mergeWithInvert(files, onProgress) {
    await ensureLibrariesLoaded();

    // PHASE 1: Merge (0-100%)
    onProgress?.(0, files.length, 'Merging PDFs...', 'merge');
    
    const mergedBlob = await PDFMerger.mergeWithoutInvert(files, (curr, total, status) => {
      onProgress?.(curr, total, status, 'merge');
    });

    // PHASE 2: Inversion (0-100%)
    onProgress?.(0, 100, 'Starting color inversion...', 'invert');

    // Load merged PDF for rendering
    const mergedData = await mergedBlob.arrayBuffer();
    const pdfDoc = await pdfjsLib.getDocument({ 
      data: mergedData,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    }).promise;

    const totalPages = pdfDoc.numPages;

    let outPdf = null;
    const renderScale = 3.0; // High quality rendering

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      
      // Create viewport with rotation
      const viewport = page.getViewport({
        scale: renderScale,
        rotation: page.rotate,
      });

      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Invert colors
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];       // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
        // Alpha channel (i + 3) remains unchanged
      }
      
      context.putImageData(imageData, 0, 0);

      // Determine orientation
      const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';

      // Create or add page to PDF
      if (!outPdf) {
        outPdf = new jsPDF({
          orientation,
          unit: 'pt',
          format: [canvas.width, canvas.height],
        });
      } else {
        outPdf.addPage([canvas.width, canvas.height], orientation);
      }

      outPdf.setPage(outPdf.getNumberOfPages());
      outPdf.addImage(
        canvas.toDataURL('image/jpeg', 0.9),
        'JPEG',
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Calculate progress percentage for inversion phase
      const inversionProgress = (pageNum / totalPages) * 100;
      onProgress?.(
        inversionProgress, 
        100, 
        `Inverting colors: ${pageNum}/${totalPages} pages`, 
        'invert'
      );
    }

    pdfDoc.destroy();

    if (!outPdf) {
      throw new Error('Failed to create output PDF');
    }

    return outPdf.output('blob');
  }

  /**
   * Main merge function that chooses the appropriate method
   * @param {Array} files - Array of file objects with {file, id}
   * @param {Object} options - Options object
   * @param {boolean} options.invertColors - Whether to invert colors
   * @param {Function} options.onProgress - Progress callback (current, total, status, phase)
   * @returns {Promise<Blob>}
   */
  static async merge(files, options = {}) {
    const { invertColors = false, onProgress } = options;

    if (files.length === 0) {
      throw new Error('No files provided for merging');
    }

    if (invertColors) {
      return PDFMerger.mergeWithInvert(files, onProgress);
    } else {
      return PDFMerger.mergeWithoutInvert(files, (curr, total, status) => {
        // For non-inverted merge, calculate percentage
        const progress = (curr / total) * 100;
        onProgress?.(progress, 100, status, 'merge');
      });
    }
  }
}

// Utility functions

/**
 * Generate a random unique ID
 * @returns {string}
 */
export function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Format file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(1);
  
  return `${size} ${units[i]}`;
}

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename to save as
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}