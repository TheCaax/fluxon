// Version configuration
export const VERSION = '5.0.375';
export const WORKER_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VERSION}/pdf.worker.min.mjs`;

// Global library instances
let pdfjsLib = null;
let jsPDF = null;
let loadingPromise = null;

/**
 * Initialize PDF libraries once
 * This should be called before using any PDF operations
 */
const initLibraries = async () => {
  if (loadingPromise) {
    return loadingPromise;
  }

  if (typeof window !== "undefined") {
    loadingPromise = Promise.all([
      // PDF.js (version 5.0.375) – load the browser ESM build
      import("pdfjs-dist/build/pdf.min.mjs")
        .then(async (module) => {
          pdfjsLib = module;
          // Set worker source to CDN for reliability
          pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_CDN;
        })
        .catch(async (err) => {
          console.warn("Failed to load pdf.min.mjs, trying alternative:", err);
          // Fallback to regular build
          const module = await import("pdfjs-dist/build/pdf.mjs");
          pdfjsLib = module;
          pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_CDN;
        }),

      import("jspdf").then((module) => {
        jsPDF = module.jsPDF;
      }),
    ]);
  }

  return loadingPromise;
};

/**
 * Ensure libraries are loaded and return pdfjsLib instance
 */
export const getPDFJSLib = async () => {
  await initLibraries();
  if (!pdfjsLib) {
    throw new Error('PDF.js library failed to load. Please refresh and try again.');
  }
  return pdfjsLib;
};

/**
 * Ensure libraries are loaded and return jsPDF constructor
 */
export const getJsPDF = async () => {
  await initLibraries();
  if (!jsPDF) {
    throw new Error('jsPDF library failed to load. Please refresh and try again.');
  }
  return jsPDF;
};

/**
 * Ensure both libraries are loaded
 */
export const ensureLibrariesLoaded = async () => {
  await initLibraries();
  if (!pdfjsLib || !jsPDF) {
    throw new Error('PDF libraries failed to load. Please refresh and try again.');
  }
};

export default initLibraries;
