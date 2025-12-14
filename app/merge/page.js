"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import Footer from "@/components/Footer";
import {
  PDFMerger,
  generateId,
  formatFileSize,
  downloadBlob,
} from "@/libs/merge";
import { toast } from "sonner";
import { GradientInkBackground, MouseAnimation } from "@/components/Animation";

export default function Merge() {
  const [files, setFiles] = useState([]);
  const [invertColors, setInvertColors] = useState(false);
  const [outputName, setOutputName] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [currentPhase, setCurrentPhase] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    const pdfFiles = selectedFiles.filter((file) => {
      return file.type === "application/pdf" || file.name.endsWith(".pdf");
    });

    if (pdfFiles.length !== selectedFiles.length) {
      toast.error("Only PDF files are allowed!");
    }

    const newFiles = pdfFiles.map((file) => ({
      file,
      id: generateId(),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
    toast.info(`${pdfFiles.length} files selected!`);
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newFiles.length) return;

    [newFiles[index], newFiles[targetIndex]] = [
      newFiles[targetIndex],
      newFiles[index],
    ];
    setFiles(newFiles);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    toast.info('File Removed!')
  };

  const handleMerge = async () => {
    if (files.length === 0) {
      toast.error("Please add some PDF files first.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentPhase("");

    try {
      const blob = await PDFMerger.merge(files, {
        invertColors,
        onProgress: (current, total, statusMsg, phase) => {
          // Calculate progress percentage
          let percent;
          if (typeof current === "number" && typeof total === "number") {
            percent = Math.min(100, (current / total) * 100);
          } else {
            percent = current;
          }

          setProgress(percent);
          setStatus(statusMsg);
          setCurrentPhase(phase || "");
        },
      });

      const filename = (outputName || "merged_pdf").replace(/\s+/g, "_");
      const finalFilename = invertColors
        ? `${filename}_inverted.pdf`
        : `${filename}.pdf`;

      downloadBlob(blob, finalFilename);

      setProgress(100);
      setStatus(`Done — ${invertColors ? "inverted" : "merged"} file ready`);
      setCurrentPhase("");

      toast.success(
        `Successfully ${invertColors ? "merged and inverted" : "merged"} ${
          files.length
        } files!`
      );

      setTimeout(() => {
        setFiles([]);
        setProgress(0);
        setStatus("Idle");
        setOutputName("");
        setInvertColors(false);
        setCurrentPhase("");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 2000);
    } catch (error) {
      console.error("Merge error:", error);
      toast.error(`Error: ${error.message || "Processing failed"}`);
      setStatus("Error");
      setProgress(0);
      setCurrentPhase("");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
    <title>Merge - merge your pdfs into onefile | Fluxon</title>
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
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Header */}
          <header className="flex items-center justify-center flex-col gap-2">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-linear-to-r from-purple-500 via-green-500 to-red-500 bg-clip-text text-transparent">
                Merge & Color Inversion
              </h1>
              <p className="text-sm text-cyan-100 mt-1">
                Make sure that your files are not corrupt
              </p>
            </div>

            {/* Progress Circle */}
            <div className="w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <path
                  className="stroke-gray-800 fill-none stroke-[2.8]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`fill-none stroke-[2.8] rounded-full transition-all duration-300 ${
                    currentPhase === "invert"
                      ? "stroke-purple-400"
                      : "stroke-sky-300"
                  }`}
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text
                  x="18"
                  y="20.35"
                  className="text-[7px] fill-gray-400 text-center"
                  textAnchor="middle"
                >
                  {Math.round(progress)}%
                </text>
              </svg>
            </div>

            {/* Phase Indicator */}
            {currentPhase && (
              <div className="text-xs text-white">
                {currentPhase === "merge" && "Merging..."}
                {currentPhase === "invert" && "Inverting colors..."}
              </div>
            )}
          </header>

          {/* Main Panel */}
          <section className="p-5 text-left rounded-2xl backdrop-blur-md bg-linear-to-b from-white/2 to-white/1 border border-white/6 shadow-2xl">
            {/* File Input */}
            <label className="inline-block px-5 py-3.5 rounded-xl bg-linear-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-700 text-gray-950 cursor-pointer font-semibold mb-3 transition-all">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <span>Select PDF files</span>
            </label>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2.5 my-3">
                {files.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/1 border border-white/2"
                  >
                    {/* Index Badge */}
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-white/2 to-white/1 flex items-center justify-center font-bold text-gray-400">
                      {idx + 1}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold truncate"
                        title={item.file.name}
                      >
                        {item.file.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatFileSize(item.file.size)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => moveFile(idx, "up")}
                        disabled={idx === 0}
                        className="px-2 py-1.5 rounded-lg bg-transparent border border-white/3 text-gray-400 text-sm font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveFile(idx, "down")}
                        disabled={idx === files.length - 1}
                        className="px-2 py-1.5 rounded-lg bg-transparent border border-white/3 text-gray-400 text-sm font-semibold hover:-translate-y-0.5 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => removeFile(idx)}
                        className="px-2 py-1.5 rounded-lg bg-transparent border border-white/3 text-gray-400 text-sm font-semibold hover:-translate-y-0.5 transition-transform"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mt-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Invert Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invertColors}
                    onChange={(e) => setInvertColors(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Invert colors</span>
      
                </label>

                {/* Output Name */}
                <input
                  type="text"
                  value={outputName}
                  onChange={(e) => setOutputName(e.target.value)}
                  placeholder="New Filename"
                  className="px-2.5 py-2 rounded-lg bg-transparent border border-white/4 text-gray-400 text-sm outline-none focus:border-cyan-600 transition-colors"
                />
                <span className="text-sm text-red-300">(This may take time and memory)</span>
              </div>

              {/* Merge Button */}
              <button
                onClick={handleMerge}
                disabled={isProcessing || files.length === 0}
                className="px-5 py-2 rounded-xl bg-linear-to-r from-sky-300 to-blue-400 text-[#041023] font-semibold shadow-lg shadow-sky-300/8 hover:shadow-sky-300/12 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Merge & Download"}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2.5 bg-white/2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 ${
                    currentPhase === "invert"
                      ? "bg-linear-to-r from-purple-400 to-pink-400"
                      : "bg-linear-to-r from-sky-300 to-blue-400"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-400">{status}</div>
            </div>
          </section>

          {/* Info Panel */}
          <section className="text-left p-5 m-6 rounded-2xl backdrop-blur-md bg-linear-to-b from-white/2 to-white/1 border border-white/6 shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-emerald-500">Usages</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-400 text-sm">
              <li>
                Choose multiple PDFs (you can reorder with the Up / Down
                buttons).
              </li>
              <li>
                Choose whether to invert colors (black ↔ white, colors
                inverted).
              </li>
              <li>
                Click{" "}
                <strong className="text-blue-100">Merge & Download</strong>.
                Progress will show merge (0-100%), then inversion (0-100%) if
                enabled.
              </li>
              <li>
                Rename the output file if you want. The result will be
                downloaded automatically.
              </li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              Note: Inversion renders pages to images — it may be
              slower for large PDFs. Also make sure that your PDF is not corrupt.
            </p>
          </section>
        </div>
      </motion.div>
      <Footer bridge={"A workflow that makes things easier"} name={"Merge"} />
    </>
  );
}
