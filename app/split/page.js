"use client";

import { useState, useRef } from "react";
import { splitPDF, splitByRanges, downloadAsZip } from "@/libs/split";
import { motion } from "framer-motion";
import AnimatedBg from "@/components/AnimatedBg";
import Navbar from "@/components/Navbar";
import { toast } from 'sonner';
import Footer from "@/components/Footer";
import StarTwinkle from "@/components/StarTwinkle";

export default function SplitPage() {
  const [file, setFile] = useState(null);
  const [splitMode, setSplitMode] = useState("all"); // 'all', 'ranges', 'interval'
  const [ranges, setRanges] = useState("1-3, 5, 7-10");
  const [interval, setInterval] = useState(1);
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
    toast.success(`Pdf selected!`)

    // Get page count
    try {
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs";

      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);
      pdf.destroy();
    } catch (err) {
      console.error("Error reading PDF:", err);
    }
  };

  const parseRanges = (rangeString, maxPages) => {
    const ranges = [];
    const parts = rangeString.split(",").map((s) => s.trim());

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map((s) => parseInt(s.trim()));
        if (!isNaN(start) && !isNaN(end) && start >= 1 && end >= start) {
          ranges.push({
            start: Math.max(1, start),
            end: maxPages > 0 ? Math.min(maxPages, end) : end,
          });
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page) && page >= 1) {
          ranges.push({ start: page, end: page });
        }
      }
    }

    return ranges;
  };

  const generateIntervalRanges = (totalPages, interval) => {
    const ranges = [];
    for (let i = 1; i <= totalPages; i += interval) {
      ranges.push({ start: i, end: Math.min(i + interval - 1, totalPages) });
    }
    return ranges;
  };

  const resetForm = () => {
    setTimeout(() => {
      setFile(null);
      setTotalPages(0);
      setProgress(0);
      setStatus("Idle");
      setRanges('1-3, 5, 7-10');
      setProcessing(false);
      setOutputPrefix("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 2500);
  };

  const handleSplit = async () => {
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
    toast.success('Processing...')

    try {
      let results = [];

      if (splitMode === "all") {
        // Split into individual pages
        results = await splitPDF(file, ({ status, progress }) => {
          setStatus(status);
          setProgress(progress);
        });
      } else if (splitMode === "ranges") {
        // Split by ranges
        const parsedRanges = parseRanges(ranges, totalPages);
        if (!parsedRanges.length) {
          throw new Error("Invalid ranges specified");
        }
        results = await splitByRanges(
          file,
          parsedRanges,
          ({ status, progress }) => {
            setStatus(status);
            setProgress(progress);
          }
        );
      } else if (splitMode === "interval") {
        // Split by interval
        const intervalNum = Math.max(1, parseInt(interval) || 1);
        const intervalRanges = generateIntervalRanges(totalPages, intervalNum);
        results = await splitByRanges(
          file,
          intervalRanges,
          ({ status, progress }) => {
            setStatus(status);
            setProgress(progress);
          }
        );
      }

      // Download all files as ZIP
      setStatus("Downloading files...");
      const prefix = outputPrefix ? outputPrefix.replace(/\s+/g, "_") : "";
      const zipName = prefix ? `${prefix}_split_pdfs.zip` : "split_pdfs.zip";
      await downloadAsZip(results, zipName, ({ status, progress }) => {
        setStatus(status);
        setProgress(progress);
      });
      setStatus(`Complete! ZIP file downloaded with ${results.length} file(s)`);
      setProgress(100);

      // Reset form after delay - ONLY call after success
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error(`Error: ${err.message}`);
      setStatus("Error");
      setProcessing(false);
    }
  };

  return (
    <>
    <title>Split - cut pdfs into pieces | Fluxon</title>
    <Navbar/>
    <AnimatedBg/>
    <StarTwinkle/>
    <motion.div initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }} className="mt-20 min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-2xl p-6">
          <div className="flex items-center justify-center flex-col text-center">
            <div>
              <h1 className="text-4xl font-bold mb-1 bg-linear-to-r from-red-900 via-green-400 to-blue-800 bg-clip-text text-transparent">
                Split PDF
                </h1>
              <p className="text-sm text-gray-400">
                Split PDF into multiple files by pages or ranges
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
                  stroke="rgb(40 50 70)"
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
                      if (fileInputRef.current) fileInputRef.current.value = "";
                      toast.success('File Removed!')
                    }}
                    className="px-2 py-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Split Mode Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-3">
              Split mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setSplitMode("all")}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  splitMode === "all"
                    ? "bg-sky-400/10 border-sky-400 text-sky-400"
                    : "bg-white/2 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <div className="font-semibold">All pages</div>
                <div className="text-xs mt-1 opacity-80">
                  Split into individual pages
                </div>
              </button>

              <button
                onClick={() => setSplitMode("ranges")}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  splitMode === "ranges"
                    ? "bg-sky-400/10 border-sky-400 text-sky-400"
                    : "bg-white/2 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <div className="font-semibold">By ranges</div>
                <div className="text-xs mt-1 opacity-80">
                  Specify page ranges
                </div>
              </button>

              <button
                onClick={() => setSplitMode("interval")}
                className={`px-4 py-3 rounded-xl border transition-all ${
                  splitMode === "interval"
                    ? "bg-sky-400/10 border-sky-400 text-sky-400"
                    : "bg-white/2 border-white/10 text-gray-400 hover:border-white/20"
                }`}
              >
                <div className="font-semibold">By interval</div>
                <div className="text-xs mt-1 opacity-80">Every N pages</div>
              </button>
            </div>
          </div>

          {/* Mode-specific controls */}
          {splitMode === "ranges" && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Page ranges (e.g., 1-3, 5, 7-10)
              </label>
              <input
                type="text"
                value={ranges}
                onChange={(e) => setRanges(e.target.value)}
                placeholder="1-3, 5, 7-10"
                className="w-full px-4 py-2.5 bg-gray-900/95 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-sky-400 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                Separate ranges with commas. Use dash for ranges (1-5), or
                single numbers (7)
              </p>
            </div>
          )}

          {splitMode === "interval" && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Pages per file
              </label>
              <input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900/95 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-sky-400 transition-colors"
              />
              <p className="text-xs text-gray-500 mt-2">
                Split every {interval} page(s){" "}
                {totalPages > 0 &&
                  `• Will create ~${Math.ceil(
                    totalPages / Math.max(1, parseInt(interval) || 1)
                  )} files`}
              </p>
            </div>
          )}

          {/* Output filename prefix */}
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
            onClick={handleSplit}
            disabled={processing || !file}
            className="w-full px-6 py-3 bg-linear-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-gray-950 disabled:text-gray-400 font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {processing ? "Processing..." : "Split & Download"}
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
        <div className="backdrop-blur-xl bg-white/2 border border-white/5 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-emerald-500 mb-4">Usages</h3>
          <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
            <li>Select a PDF file to split</li>
            <li>
              Choose split mode:
              <ul className="ml-6 mt-1 space-y-1 list-disc list-inside text-xs">
                <li>
                  <strong>All pages:</strong> Creates one file per page
                </li>
                <li>
                  <strong>By ranges:</strong> Specify which pages to extract
                  (e.g., 1-3, 5, 7-10)
                </li>
                <li>
                  <strong>By interval:</strong> Split every N pages into
                  separate files
                </li>
              </ul>
            </li>
            <li>Add an optional filename prefix for organized downloads</li>
            <li>Click Split & Download – files will download automatically</li>
          </ol>
          <p className="mt-4 text-xs text-gray-500">
            Note: Multiple files will download sequentially. The form will reset
            automatically after completion.
          </p>
        </div>
      </div>
    </motion.div>
    <Footer bridge={'Minimal features, Minimized hassle'} name={'Split'}/>
    </>
  );
}
