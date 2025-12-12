// libs/merge.js
import { PDFDocument } from "pdf-lib";
import { getPDFJSLib, getJsPDF, ensureLibrariesLoaded } from "./version";

let pdfjsLib = null;
let jsPDF = null;

/**
 * Ensure libraries are loaded before use
 */
async function ensureMergeLibrariesLoaded() {
  if (!pdfjsLib || !jsPDF) {
    await ensureLibrariesLoaded();
    pdfjsLib = await getPDFJSLib();
    jsPDF = await getJsPDF();
  }
}

/**
 * Invert colors using canvas composite operation (more reliable than HSL)
 * This approach works better for PDF content
 * @param {ImageData} imageData - Canvas image data
 */
function invertColors(imageData) {
  const data = imageData.data;
  
  // Simple inversion: 255 - value for each RGB channel
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - data[i];     // Red
    data[i + 1] = 255 - data[i + 1]; // Green
    data[i + 2] = 255 - data[i + 2]; // Blue
    // Alpha channel (i + 3) remains unchanged
  }
}

/**
 * Invert a single PDF page using canvas
 * @param {PDFPageProxy} page - PDF.js page object
 * @param {number} scale - Render scale (quality)
 * @returns {Promise<string>} Data URL of inverted page
 */
async function invertPage(page, scale = 2.0) {
  const viewport = page.getViewport({
    scale: scale,
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

  // Fill background with white first (important for transparency handling)
  context.fillStyle = 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Render PDF page to canvas
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  // Get image data and invert colors
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  invertColors(imageData);
  context.putImageData(imageData, 0, 0);

  // Return as data URL
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Invert colors of a PDF file
 * @param {ArrayBuffer} pdfData - PDF file data
 * @returns {Promise<Blob>} Inverted PDF as blob
 */
async function invertPDF(pdfData) {
  await ensureMergeLibrariesLoaded();

  const pdfDoc = await pdfjsLib.getDocument({ 
    data: pdfData,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true
  }).promise;

  const totalPages = pdfDoc.numPages;
  let outputPdf = null;

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Determine orientation
    const orientation = viewport.width > viewport.height ? 'landscape' : 'portrait';
    
    // Invert the page
    const invertedImage = await invertPage(page, 2.0);
    
    // Create image element to get dimensions
    const img = new Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = invertedImage;
    });

    // Create or add page to PDF
    if (!outputPdf) {
      outputPdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [img.width, img.height],
      });
    } else {
      outputPdf.addPage([img.width, img.height], orientation);
    }

    outputPdf.setPage(outputPdf.getNumberOfPages());
    outputPdf.addImage(
      invertedImage,
      'JPEG',
      0,
      0,
      img.width,
      img.height
    );
  }

  pdfDoc.destroy();

  if (!outputPdf) {
    throw new Error('Failed to create inverted PDF');
  }

  return outputPdf.output('blob');
}

export class PDFMerger {
  /**
   * Merge multiple PDF files without color inversion
   * @param {Array} files - Array of file objects with {file, id}
   * @param {Function} onProgress - Progress callback (current, total, status)
   * @returns {Promise<Blob>}
   **/
  static async mergeWithoutInvert(files, onProgress) {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  /**
   * Merge PDFs with color inversion (invert first, then merge)
   * @param {Array} files - Array of file objects with {file, id}
   * @param {Function} onProgress - Progress callback (current, total, status, phase)
   * @returns {Promise<Blob>}
   */
  static async mergeWithInvert(files, onProgress) {
    try {
      await ensureMergeLibrariesLoaded();

      const invertedPdfs = [];
      const totalFiles = files.length;

      // PHASE 1: Invert each PDF (0-50%)
      for (let i = 0; i < totalFiles; i++) {
        const fileItem = files[i];
        
        onProgress?.(
          i * 50 / totalFiles,
          100,
          `Inverting colors: ${i + 1}/${totalFiles} files`,
          'invert'
        );

        const arrayBuffer = await fileItem.file.arrayBuffer();
        const invertedBlob = await invertPDF(arrayBuffer);
        const invertedPdf = await PDFDocument.load(
          await invertedBlob.arrayBuffer(),
          { ignoreEncryption: true }
        );
        
        invertedPdfs.push(invertedPdf);
      }

      // PHASE 2: Merge inverted PDFs (50-100%)
      onProgress?.(50, 100, 'Merging inverted PDFs...', 'merge');
      
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < invertedPdfs.length; i++) {
        const donorPdf = invertedPdfs[i];
        const copiedPages = await mergedPdf.copyPages(
          donorPdf,
          donorPdf.getPageIndices()
        );
        
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        const progress = 50 + ((i + 1) / invertedPdfs.length) * 50;
        onProgress?.(
          progress,
          100,
          `Merging: ${i + 1}/${invertedPdfs.length} files`,
          'merge'
        );
      }

      const pdfBytes = await mergedPdf.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      throw error;
    }
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

    try {
      if (invertColors) {
        return await PDFMerger.mergeWithInvert(files, onProgress);
      } else {
        return await PDFMerger.mergeWithoutInvert(files, (curr, total, status) => {
          // For non-inverted merge, calculate percentage
          const progress = (curr / total) * 100;
          onProgress?.(progress, 100, status, 'merge');
        });
      }
    } catch (error) {
      throw error;
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
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    throw error;
  }
}