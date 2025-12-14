"use client";

import { pdfToImages, getPageCount, convertPageRanges, downloadAsZip } from "@/libs/imaging";
import { GradientInkBackground, MouseAnimation } from "@/components/Animation";
import Navbar from "@/components/Navbar";
import { useState, useRef } from "react";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Imaging() {
  const [file, setFile] = useState(null);
  const [conversionMode, setConversionMode] = useState("all"); // 'all', 'ranges'
  const [ranges, setRanges] = useState("1-5");
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(95);
  const [scale, setScale] = useState(2.0);
  const [totalPages, setTotalPages] = useState(0);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [processing, setProcessing] = useState(false);
  const [outputPrefix, setOutputPrefix] = useState("");

  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${
      ["B", "KB", "MB", "GB"][i]
    }`;
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Get page count using the shared library
    try {
      const pageCount = await getPageCount(selectedFile);
      setTotalPages(pageCount);
    } catch (err) {
      console.error("Error reading PDF:", err);
      toast.error("Error reading PDF file");
    }
    toast.success(`${e.target.files?.[0].name} file uploaded!`)
  };

  const resetForm = () => {
    setTimeout(() => {
      setFile(null);
      setTotalPages(0);
      setProgress(0);
      setStatus("Idle");
      setProcessing(false);
      setOutputPrefix('pages');
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 2500);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select a PDF file first");
      return;
    }

    if (!totalPages || totalPages === 0) {
      toast.error("Please wait for the PDF to load completely");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setStatus("Starting...");

    toast.info('Processing...')

    try {
      let results = [];

      const options = {
        format,
        quality: quality / 100,
        scale,
        prefix: outputPrefix.replace(/\s+/g, "_") || "page",
      };

      if (conversionMode === "all") {
        results = await pdfToImages(file, options, ({ status, progress }) => {
          setStatus(status);
          setProgress(progress);
        });
      } else if (conversionMode === "ranges") {
        if (!ranges.trim()) {
          throw new Error("Please specify page ranges");
        }
        results = await convertPageRanges(
          file,
          ranges,
          options,
          ({ status, progress }) => {
            setStatus(status);
            setProgress(progress);
          }
        );
      }

      // Download all images as ZIP
      setStatus("Downloading images...");
      const prefix = outputPrefix.replace(/\s+/g, "_") || "images";
      const zipName = `${prefix}.zip`;
      await downloadAsZip(results, zipName, ({ status, progress }) => {
        setStatus(status);
        setProgress(progress);
      });
      setStatus(`Complete! ZIP file downloaded with ${results.length} image(s)`);
      setProgress(100);

      // Reset form after delay
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
      setStatus("Error");
      setProcessing(false);
    }
  };

  const getDPI = () => Math.round(72 * scale);

  return (
    <>
    <title>Imaging - convert pdfs to images for your need | Fluxon</title>
      <Navbar />
      <GradientInkBackground/>
      <MouseAnimation/>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className="text-center mt-30"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-center flex-col">
              <div>
                <h1 className="text-4xl font-bold mb-1 bg-linear-to-r from-red-400 via-green-400 to-blue-600 bg-clip-text text-transparent">
                  Convert to Image
                </h1>
                <p className="text-sm text-gray-400">
                  Convert PDF pages to high-quality images
                </p>
              </div>

              {/* Circular Progress */}
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="rgb(15 23 42)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="rgb(125 211 252)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 2.01}, 201`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-gray-400 font-medium">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Controls */}
          <div className="backdrop-blur-xl bg-white/2 border border-white/5 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* File Selection */}
            <div className="flex items-center gap-4 flex-wrap">
              <label className="px-5 py-2.5 bg-linear-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 text-gray-950 font-semibold rounded-xl cursor-pointer transition-all shadow-lg shadow-sky-500/20">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                Select PDF file
              </label>

              {file && (
                <div className="flex-1 min-w-0 px-4 py-2.5 bg-white/2 border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-linear-to-br from-sky-400/10 to-blue-500/10 rounded-lg flex items-center justify-center text-sky-400 text-xs font-bold">
                      PDF
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {totalPages} pages
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFile(null);
                        setTotalPages(0);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="px-2 py-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Conversion Mode */}
            <div>
              <label className="block text-sm text-gray-400 mb-3">
                Pages to convert
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => setConversionMode("all")}
                  className={`px-4 py-3 rounded-xl border transition-all ${
                    conversionMode === "all"
                      ? "bg-sky-400/10 border-sky-400 text-sky-400"
                      : "bg-white/2 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div className="font-semibold">All pages</div>
                  <div className="text-xs mt-1 opacity-80">
                    Convert entire PDF
                  </div>
                </button>

                <button
                  onClick={() => setConversionMode("ranges")}
                  className={`px-4 py-3 rounded-xl border transition-all ${
                    conversionMode === "ranges"
                      ? "bg-sky-400/10 border-sky-400 text-sky-400"
                      : "bg-white/2 border-white/10 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <div className="font-semibold">Specific pages</div>
                  <div className="text-xs mt-1 opacity-80">
                    Choose page ranges
                  </div>
                </button>
              </div>
            </div>

            {/* Range Input */}
            {conversionMode === "ranges" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Page ranges (e.g., 1-3, 5, 7-10)
                </label>
                <input
                  type="text"
                  value={ranges}
                  onChange={(e) => setRanges(e.target.value)}
                  placeholder="1-3, 5, 7-10"
                  className="w-full px-4 py-2.5 bg-gray-900/95 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-sky-400 transition-colors [&>option]:bg-gray-900 [&>option]:text-gray-300"
                />
              </div>
            )}

            {/* Format & Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Image format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-900/95 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-sky-400 transition-colors [&>option]:bg-gray-900 [&>option]:text-gray-300"
                >
                  <option value="png">PNG (Lossless)</option>
                  <option value="jpeg">JPEG (Compressed)</option>
                  <option value="webp">WebP (Modern)</option>
                </select>
              </div>

              {(format === "jpeg" || format === "webp") && (
                <div className="mt-2">
                  <label className="block text-sm text-gray-400 mb-2">
                    Quality: {quality}%
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="range-sky appearance-none w-full bg-transparent"
                  />
                </div>
              )}
            </div>

            {/* Scale/DPI */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Resolution: {getDPI()} DPI (Scale: {scale.toFixed(1)}x)
              </label>
              <input
                type="range"
                min="1"
                max="4"
                step="0.5"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="range-sky appearance-none w-full bg-transparent"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>72 DPI (Low)</span>
                <span>144 DPI (Medium)</span>
                <span>288 DPI (High)</span>
              </div>
            </div>

            {/* Output Prefix */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Filename
              </label>
              <input
                type="text"
                value={outputPrefix}
                onChange={(e) => setOutputPrefix(e.target.value)}
                placeholder="New Filename"
                className="w-full px-4 py-2.5 bg-gray-900/95 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-sky-400 transition-colors"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleConvert}
              disabled={processing || !file}
              className="w-full px-6 py-3 bg-linear-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-gray-950 disabled:text-gray-400 font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {processing ? "Converting..." : "Convert & Download"}
            </button>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-2 bg-white/2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-sky-400 to-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 text-center">{status}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-left backdrop-blur-xl bg-white/2 border border-white/5 rounded-2xl p-6 m-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-emerald-500 mb-4">
              Usages
            </h3>
            <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
              <li>Select a PDF file to convert</li>
              <li>Choose to convert all pages or specific ranges</li>
              <li>
                Select image format:
                <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-xs">
                  <li>
                    <strong>PNG:</strong> Best quality, larger file size
                    (lossless)
                  </li>
                  <li>
                    <strong>JPEG:</strong> Good quality, smaller file size
                    (adjustable quality)
                  </li>
                  <li>
                    <strong>WebP:</strong> Modern format, best compression
                    (adjustable quality)
                  </li>
                </ul>
              </li>
              <li>
                Adjust resolution (DPI) - higher values give better quality but
                larger files
              </li>
              <li>Add optional filename prefix for organized downloads</li>
              <li>
                Click Convert & Download - images will download automatically
              </li>
            </ol>
            <p className="mt-4 text-xs text-gray-500">
              Tip: For text-heavy PDFs, use PNG at 2x scale (144 DPI). For
              photos, JPEG at 90% quality works well.
            </p>
          </div>
        </div>
      </motion.div>
      <Footer name={'Imaging'} bridge={'Few features but relevant'}/>
    </>
  );
}
