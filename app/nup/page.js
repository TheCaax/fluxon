"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import AnimatedBg from "@/components/AnimatedBg";
import { useState, useRef } from "react";
import { composeNUp } from "@/libs/nup";
import { toast } from "sonner";
import Footer from "@/components/Footer";

const PRESETS = [
  { value: "10", label: "10-up (2 × 5)", rows: 5, cols: 2 },
  { value: "9", label: "9-up (3 × 3)", rows: 3, cols: 3 },
  { value: "6", label: "6-up (2 × 3)", rows: 3, cols: 2 },
  { value: "4", label: "4-up (2 × 2)", rows: 2, cols: 2 },
//   { value: "custom", label: "Custom", rows: null, cols: null },
];

export default function Nup() {
  const [files, setFiles] = useState([]);
  const [preset, setPreset] = useState("10");
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(2);
  const [paper, setPaper] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [outerMargin, setOuterMargin] = useState(5);
  const [innerMargin, setInnerMargin] = useState(1);
  const [showBorder, setShowBorder] = useState(true);
  const [dpi, setDpi] = useState(180);
  const [outputName, setOutputName] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [processing, setProcessing] = useState(false);

  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${
      ["B", "KB", "MB", "GB"][i]
    }`;
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info(`${newFiles.length} new files found!`)
  };

  const moveFile = (idx, direction) => {
    const newFiles = [...files];
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= files.length) return;
    [newFiles[idx], newFiles[newIdx]] = [newFiles[newIdx], newFiles[idx]];
    setFiles(newFiles);
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handlePresetChange = (value) => {
    setPreset(value);
    const selected = PRESETS.find((p) => p.value === value);
    if (selected && selected.rows) {
      setRows(selected.rows);
      setCols(selected.cols);
    }
  };

  const handleCompose = async () => {
    if (!files.length) {
      alert("Please select PDF files first");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setStatus("Starting...");

    try {
      const result = await composeNUp(
        {
          files,
          rows: Math.max(1, parseInt(rows) || 1),
          cols: Math.max(1, parseInt(cols) || 1),
          outerMarginMM: Math.max(0, parseFloat(outerMargin) || 0),
          innerMarginMM: Math.max(0, parseFloat(innerMargin) || 0),
          showBorder,
          dpi: Math.max(72, parseInt(dpi) || 150),
          paper,
          orientation,
          outputName: outputName.replace(/\s+/g, "_") || "nup_compose_output",
        },
        ({ status, progress }) => {
          setStatus(status);
          setProgress(progress);
        }
      );

      // Auto download
      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.filename;
      link.click();

      setTimeout(() => URL.revokeObjectURL(result.url), 10000);

      toast.success(
        `Successfully composed ${
          files.length
        } files!`
      );

      setTimeout(() => {
        setFiles([]);
        setProgress(0);
        setStatus("Idle");
        setOutputName("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
      setStatus("Error");
    } finally {
      setProcessing(false);
    }
  };

  const pagesPerSheet = Math.max(
    1,
    (parseInt(rows) || 1) * (parseInt(cols) || 1)
  );
  return (
    <>
    <title>Compose - Make your pdf printer-friendly | Fluxon</title>
      <Navbar />
      <AnimatedBg />
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.2 }}
        className="text-center mt-30"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="rounded-2xl p-6">
            <div className="flex items-center justify-center flex-col">
              <div>
                <h1 className="text-4xl font-bold mb-1 bg-linear-to-r from-cyan-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                  Compose Into Sheets
                </h1>
                <p className="text-sm text-gray-400">
                  Place multiple PDF pages per sheet with custom layouts
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
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                Select PDF files
              </label>

              <select
                value={preset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="'w-full px-2 py-2.5 bg-gray-900/95 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-sky-400 transition-colors [&>option]:bg-gray-900 [&>option]:text-gray-300"
              >
                {PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-3">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-white/2 border border-white/5 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-linear-to-br from-sky-400/10 to-blue-500/10 rounded-lg flex items-center justify-center text-sky-400 font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => moveFile(idx, "up")}
                        disabled={idx === 0}
                        className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveFile(idx, "down")}
                        disabled={idx === files.length - 1}
                        className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeFile(idx)}
                        className="px-2 py-1 text-red-400 hover:text-red-300 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Rows</label>
                <input
                  type="number"
                  min="1"
                  readOnly
                  value={rows}
                  onChange={(e) => {
                    setRows(e.target.value);
                    setPreset("custom");
                  }}
                  className="w-full px-4 py-2.5 bg-white/2 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-white transition-colors cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Columns
                </label>
                <input
                  type="number"
                  min="1"
                  readOnly
                  value={cols}
                  onChange={(e) => {
                    setCols(e.target.value);
                    setPreset("custom");
                  }}
                  className="w-full px-4 py-2.5 bg-white/2 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-white transition-colors cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Pages/Sheet
                </label>
                <input
                  type="number"
                  value={pagesPerSheet}
                  readOnly
                  className="w-full px-4 py-2.5 bg-white/2 border border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Paper & Orientation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Paper Size
                </label>
                <select
                  value={paper}
                  onChange={(e) => setPaper(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/2 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-sky-400 transition-colors [&>option]:bg-gray-900 [&>option]:text-gray-300"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/2 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-sky-400 transition-colors [&>option]:bg-gray-900 [&>option]:text-gray-300"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            {/* Margins */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Outer margin (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={outerMargin}
                  onChange={(e) => setOuterMargin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/2 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Inner margin (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  value={innerMargin}
                  onChange={(e) => setInnerMargin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/2 border border-white/10 rounded-xl text-gray-300 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showBorder}
                    onChange={(e) => setShowBorder(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-white/10 bg-white/2 checked:bg-sky-400 checked:border-sky-400 transition-colors"
                  />
                  <span className="text-sm text-gray-400">Show borders</span>
                </label>
              </div>
            </div>

            {/* DPI & Output Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  DPI (Quality): {dpi}
                </label>
                <input
                  type="range"
                  min="72"
                  max="300"
                  value={dpi}
                  onChange={(e) => setDpi(e.target.value)}
                  className="range-sky appearance-none w-full bg-transparent"
                />
              <p className="mt-2 text-xs text-gray-500">
              💡 Memory usage increases with higher DPI.
            </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Output filename
                </label>
                <input
                  type="text"
                  value={outputName}
                  onChange={(e) => setOutputName(e.target.value)}
                  placeholder="New Filename"
                  className="w-full px-4 py-2.5 bg-white/2 border border-white/10 rounded-xl text-gray-300 placeholder-gray-600 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCompose}
              disabled={processing || files.length === 0}
              className="w-full px-6 py-3 bg-linear-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-gray-950 disabled:text-gray-400 font-bold rounded-xl transition-all shadow-lg shadow-sky-500/20 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Compose & Download"}
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
              <li>Select PDFs (all pages from all files are used in order)</li>
              <li>Choose preset (10-up), or set rows & cols manually</li>
              <li>Set outer & inner margins (in mm) and DPI for quality</li>
              <li>
                Click Compose & Download – the PDF will be generated client-side
              </li>
            </ol>
            <p className="mt-4 text-xs text-gray-500">
              Tip: For very large inputs, increase DPI carefully (memory grows).
              This runs completely in your browser.
            </p>
          </div>
        </div>
      </motion.div>
      <Footer bridge={'A client-side initiative for you'} name={'Compose'}/>
    </>
  );
}
