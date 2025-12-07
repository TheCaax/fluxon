// Initialize libraries once
const initLibraries = async () => {
  let pdfjsLib = null;
  let jsPDF = null;
  let loadingPromise = null;
  if (typeof window !== "undefined") {
    loadingPromise = Promise.all([
      // PDF.js (version 5.x) – load the browser ESM build
      import("pdfjs-dist/build/pdf.min.mjs")
        .then(async (module) => {
          pdfjsLib = module;

          // Set worker source to CDN for reliability
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs";
        })
        .catch(async (err) => {
          console.warn("Failed to load pdf.min.mjs, trying alternative:", err);
          // Fallback to regular build
          const module = await import("pdfjs-dist/build/pdf.mjs");
          pdfjsLib = module;
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs";
        }),

      import("jspdf").then((module) => {
        jsPDF = module.jsPDF;
      }),
    ]);
  }
  return loadingPromise;
};

export default initLibraries;
