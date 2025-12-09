// libs/merge.js
import { PDFDocument } from "pdf-lib";

let pdfjsLib = null;
let jsPDF = null;
let loadingPromise = null;

// Initialize libraries once
if (typeof window !== "undefined") {
  loadingPromise = Promise.all([
    // PDF.js (version 5.x) — load the browser ESM build
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

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Array} [h, s, l] where h is 0-360, s and l are 0-1
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [h * 360, s, l];
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {Array} [r, g, b] where values are 0-255
 */
function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Invert colors using HSL luminance inversion
 * This preserves hue and saturation while inverting brightness
 * Works universally for both dark and light backgrounds
 * @param {ImageData} imageData - Canvas image data
 */
function invertColorsHSL(imageData) {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Convert RGB to HSL
    const [h, s, l] = rgbToHsl(r, g, b);
    
    // Invert only the luminance (brightness)
    const invertedL = 1 - l;
    
    // Convert back to RGB
    const [newR, newG, newB] = hslToRgb(h, s, invertedL);
    
    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
    // Alpha channel (i + 3) remains unchanged
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
   * Merge PDFs and invert colors using HSL luminance inversion
   * Works universally for all PDF types (dark/light backgrounds)
   * @param {Array} files - Array of file objects with {file, id}
   * @param {Function} onProgress - Progress callback (current, total, status, phase)
   * @returns {Promise<Blob>}
   */
  static async mergeWithInvert(files, onProgress) {
    try {
      await ensureLibrariesLoaded();

      // PHASE 1: Merge (0-100%)
      onProgress?.(0, files.length, 'Merging PDFs...', 'merge');
      
      const mergedBlob = await PDFMerger.mergeWithoutInvert(files, (curr, total, status) => {
        onProgress?.(curr, total, status, 'merge');
      });

      // PHASE 2: Inversion (0-100%)
      onProgress?.(0, 100, 'Starting universal color inversion...', 'invert');

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

        // Apply HSL-based color inversion (universal for all PDF types)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        invertColorsHSL(imageData);
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
          canvas.toDataURL('image/jpeg', 0.95),
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