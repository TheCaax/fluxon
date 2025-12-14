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
   * FIXED: Merge PDFs with color inversion
   * KEY CHANGE: Merge FIRST, then invert (like HTML version)
   * @param {Array} files - Array of file objects with {file, id}
   * @param {Function} onProgress - Progress callback (current, total, status, phase)
   * @returns {Promise<Blob>}
   */
  static async mergeWithInvert(files, onProgress) {
    try {
      await ensureMergeLibrariesLoaded();

      // MERGE
      onProgress?.(0, files.length, 'Merging PDFs...', 'merge');
      
      const mergedBlob = await PDFMerger.mergeWithoutInvert(files, (curr, total, status) => {
        onProgress?.(curr, files.length + 100, status, 'merge');
      });

      // Render and invert the MERGED PDF
      onProgress?.(files.length, files.length + 100, 'Preparing to invert...', 'invert');
      
      const mergedData = await mergedBlob.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ 
        data: mergedData,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true
      }).promise;

      const totalPages = pdfDoc.numPages;
      let outputPdf = null;

      // Process each page of the merged PDF
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);

        // Use scale 3.5
        const viewport = page.getViewport({
          scale: 3.5,
          rotation: page.rotate,
        });

        // Create canvas for rendering
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Render PDF page to canvas
        await page.render({
          canvasContext: ctx,
          viewport: viewport,
        }).promise;

        // Invert colors directly on rendered canvas
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          d[i] = 255 - d[i];         // Red
          d[i + 1] = 255 - d[i + 1]; // Green
          d[i + 2] = 255 - d[i + 2]; // Blue
          // Alpha channel (d[i + 3]) remains unchanged
        }
        ctx.putImageData(imgData, 0, 0);

        // Determine orientation
        const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';

        // Create or add page to output PDF
        if (!outputPdf) {
          outputPdf = new jsPDF({
            orientation,
            unit: 'pt',
            format: [canvas.width, canvas.height],
          });
        } else {
          outputPdf.addPage([canvas.width, canvas.height], orientation);
        }

        outputPdf.setPage(outputPdf.getNumberOfPages());
        
        // FIXED: Use 0.9 quality
        outputPdf.addImage(
          canvas.toDataURL('image/jpeg', 0.9),
          'JPEG',
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Update progress
        const progress = files.length + pageNum;
        onProgress?.(
          progress,
          files.length + totalPages,
          `Inverted ${pageNum}/${totalPages} pages`,
          'invert'
        );
      }

      pdfDoc.destroy();

      if (!outputPdf) {
        throw new Error('Failed to create inverted PDF');
      }

      return outputPdf.output('blob');
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