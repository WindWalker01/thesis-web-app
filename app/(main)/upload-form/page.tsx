"use client";

import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/blocks/navbar";
import { useState, useRef, useCallback } from "react";
import {
  CloudUpload,
  ImageUp,
  X,
  AlertTriangle,
  FileImage,
  CheckCircle2,
  PenLine,
  ImageIcon,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { label: "Digital Painting", img: "/landing-page-elements/starry-night.png"   },
  { label: "Photography",      img: "/landing-page-elements/photography.png"    },
  { label: "Illustration",     img: "/landing-page-elements/digital-art.png"    },
  { label: "Graphic Design",   img: "/landing-page-elements/graphic-design.png" },
  { label: "AI Art",           img: "/landing-page-elements/ai-image.png"       },
  { label: "NFT",              img: "/landing-page-elements/art.png"            },
] as const;

const SUPPORTED_FORMATS = ["PNG", "JPG", "TIFF", "SVG", "AI", "PSD"];

export default function UploadFormPage() {
  const [title, setTitle]               = useState("");
  const [category, setCategory]         = useState("");
  const [description, setDescription]   = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [dragOver, setDragOver]         = useState(false);
  const [file, setFile]                 = useState<File | null>(null);
  const [preview, setPreview]           = useState<string | null>(null);
  const fileInputRef                    = useRef<HTMLInputElement>(null);

  const acceptFile = useCallback((f: File) => {
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) acceptFile(dropped);
  }, [acceptFile]);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) acceptFile(picked);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectedCat = CATEGORIES.find((c) => c.label === category) ?? null;
  const isReady     = title.trim() && category && description.trim() && file;

  return (
    <main className="min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">

      <NavBar />

      {/* Top accent bar */}
      <div className="h-1 w-full pt-16 bg-gradient-to-r from-blue-600 via-blue-400 to-orange-400" />

      {/* ── PAGE HEADER ── */}
      <div className="bg-slate-900 text-white px-6 sm:px-10 lg:px-16 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 border-l-2 border-orange-500 pl-4 mb-5">
            ArtForgeLab · Artwork Registration Module
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                Upload &amp; Register{" "}
                <span className="text-orange-400">Artwork</span>
              </h1>
              <p className="text-slate-400 mt-3 text-base md:text-lg max-w-2xl">
                Submit your digital artwork for blockchain registration. Your file will be
                cryptographically hashed and timestamped as proof of original authorship.
              </p>
            </div>
            {/* Stat chips */}
            <div className="flex gap-4 shrink-0">
              {[
                { label: "Protection", value: "pHash + Chain" },
                { label: "Formats",    value: "6 Supported"   },
              ].map((s) => (
                <div key={s.label} className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
                  <div className="text-base font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT — two-column desktop layout ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-10 xl:gap-14 items-start">

          {/* ════════════════════════════════════════
              LEFT COLUMN — Artwork File (2/5)
          ════════════════════════════════════════ */}
          <div className="w-full lg:w-2/5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Card header */}
              <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <ImageUp className="w-6 h-6 text-orange-500" />
                <span className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-widest">
                  Artwork File
                </span>
              </div>

              <div className="p-8 space-y-6">

                {/* Drop zone */}
                <AnimatePresence mode="wait">
                  {!file ? (
                    <motion.div
                      key="dropzone"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onDrop={onDrop}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-300
                        min-h-[380px]
                        ${dragOver
                          ? "border-orange-400 bg-orange-500/5 scale-[1.01]"
                          : "border-orange-400/40 hover:border-orange-400 hover:bg-orange-500/5"
                        }`}
                    >
                      <motion.div
                        animate={dragOver ? { scale: 1.15, rotate: -8 } : { scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}
                        className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center transition-colors duration-300
                          ${dragOver ? "bg-orange-500/20 border-orange-400" : "bg-orange-500/10 border-orange-500/20"}`}
                      >
                        <ImageUp className="w-12 h-12 text-orange-400" />
                      </motion.div>
                      <div className="text-center px-8">
                        <p className="font-black text-slate-800 dark:text-white text-xl mb-2">
                          {dragOver ? "Release to upload" : "Drag & drop your artwork here"}
                        </p>
                        <p className="text-base text-slate-500">
                          or{" "}
                          <span className="text-orange-500 font-semibold underline underline-offset-2">
                            browse files
                          </span>{" "}
                          from your device
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg,.tiff,.tif,.svg,.ai,.psd"
                        onChange={onFileInput}
                        className="hidden"
                      />
                    </motion.div>

                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-2xl border border-green-500/30 bg-green-500/5 overflow-hidden"
                    >
                      {preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={preview} alt="Preview" className="w-full max-h-96 object-contain bg-slate-100 dark:bg-slate-800 p-4" />
                      ) : (
                        <div className="w-full h-72 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                          <ImageIcon className="w-20 h-20 text-slate-400" />
                        </div>
                      )}
                      <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-slate-900">
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold truncate text-slate-800 dark:text-slate-200">{file.name}</p>
                          <p className="text-sm text-slate-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl text-base transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <CloudUpload className="w-6 h-6" />
                  {file ? "Replace File" : "Upload Artwork"}
                </button>

              </div>

              {/* Formats + disclaimer */}
              <div className="px-8 pb-8 space-y-5">
                <div className="flex justify-center">
                  <div className="bg-slate-900 border border-slate-700 rounded-full px-6 py-2.5 flex items-center gap-2 shadow-md">
                    <FileImage className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-sm text-slate-400 font-mono">
                      Supports&nbsp;
                      {SUPPORTED_FORMATS.map((fmt, i) => (
                        <span key={fmt}>
                          <span className="text-slate-200 font-semibold">{fmt}</span>
                          {i < SUPPORTED_FORMATS.length - 1 && <span className="text-slate-600"> · </span>}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Legal Disclaimer</p>
                      <p className="text-sm text-slate-400 leading-relaxed">
                        By uploading, you confirm this is your original work or that you hold
                        rights to register it under{" "}
                        <span className="text-slate-300 font-medium">R.A. 8293</span>.{" "}
                        <Link href="/terms-of-use" className="text-amber-400 hover:underline">Terms of Use</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ════════════════════════════════════════
              RIGHT COLUMN — Artwork Details (3/5)
          ════════════════════════════════════════ */}
          <div className="w-full lg:w-3/5 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Card header */}
              <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <PenLine className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-widest">
                  Artwork Details
                </span>
              </div>

              <div className="p-8 space-y-7">

                {/* Title */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Artwork Title <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Starry Night Reimagined with Futuristic Buildings"
                    className="w-full px-5 py-4 rounded-xl text-base
                               bg-slate-50 dark:bg-slate-800
                               border border-slate-200 dark:border-slate-700
                               focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                               placeholder:text-slate-400 transition-all"
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Category <span className="text-orange-400">*</span>
                  </label>
                  <div
                    className="relative"
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setTimeout(() => setCategoryOpen(false), 120);
                      }
                    }}
                  >
                    <motion.button
                      type="button"
                      onClick={() => setCategoryOpen(!categoryOpen)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full px-5 py-4 rounded-xl text-base text-left flex items-center justify-between gap-3
                                 bg-slate-50 dark:bg-slate-800 border transition-all
                                 ${categoryOpen
                                   ? "border-orange-400 ring-2 ring-orange-400"
                                   : "border-slate-200 dark:border-slate-700 hover:border-orange-400"
                                 }`}
                    >
                      <span className="flex items-center gap-3">
                        {selectedCat ? (
                          <>
                            <span className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700">
                              <Image src={selectedCat.img} alt={selectedCat.label} fill className="object-contain p-0.5" />
                            </span>
                            <span className="text-slate-900 dark:text-white font-medium">{selectedCat.label}</span>
                          </>
                        ) : (
                          <span className="text-slate-400">Select a category</span>
                        )}
                      </span>
                      <motion.div
                        animate={{ rotate: categoryOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                      </motion.div>
                    </motion.button>

                    <AnimatePresence>
                      {categoryOpen && (
                        <motion.ul
                          initial={{ opacity: 0, y: -8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.97 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="absolute top-[calc(100%+8px)] left-0 right-0 z-50
                                     bg-white dark:bg-slate-900
                                     border border-slate-200 dark:border-slate-700
                                     rounded-2xl shadow-2xl overflow-hidden"
                        >
                          <div className="grid grid-cols-2 gap-1.5 p-3">
                            {CATEGORIES.map((cat, idx) => (
                              <motion.li
                                key={cat.label}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04, duration: 0.15 }}
                              >
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.03 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => { setCategory(cat.label); setCategoryOpen(false); }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors
                                    ${category === cat.label
                                      ? "bg-orange-400/10 border border-orange-400/30 text-orange-500 font-semibold"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent"
                                    }`}
                                >
                                  <span className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700">
                                    <Image src={cat.img} alt={cat.label} fill className="object-contain p-1" />
                                  </span>
                                  <span className="text-left leading-tight">{cat.label}</span>
                                  {category === cat.label && (
                                    <motion.span
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="ml-auto w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center shrink-0"
                                    >
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 10 8">
                                        <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </motion.span>
                                  )}
                                </motion.button>
                              </motion.li>
                            ))}
                          </div>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Description <span className="text-orange-400">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your artwork — style, inspiration, medium, and the story behind the piece..."
                    rows={7}
                    maxLength={500}
                    className="w-full px-5 py-4 rounded-xl text-base resize-none
                               bg-slate-50 dark:bg-slate-800
                               border border-slate-200 dark:border-slate-700
                               focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
                               placeholder:text-slate-400 transition-all"
                  />
                  <p className={`text-sm text-right font-mono transition-colors
                    ${description.length >= 480 ? "text-orange-400" : "text-slate-400"}`}>
                    {description.length} / 500
                  </p>
                </div>

              </div>

              {/* Card footer */}
              <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex gap-4">
                  <Link
                    href="/"
                    className="flex-1 px-6 py-4 rounded-xl text-base font-semibold text-center
                               border border-slate-200 dark:border-slate-700
                               text-slate-600 dark:text-slate-400
                               hover:bg-white dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </Link>
                  {/* TODO: wire to upload + blockchain registration handler */}
                  <motion.button
                    type="button"
                    disabled={!isReady}
                    whileTap={isReady ? { scale: 0.97 } : {}}
                    className={`flex-[2] px-6 py-4 rounded-xl text-base font-bold
                                flex items-center justify-center gap-3 transition-all
                                ${isReady
                                  ? "bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white hover:scale-[1.02] shadow-lg shadow-orange-400/30 cursor-pointer"
                                  : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-40"
                                }`}
                  >
                    <CloudUpload className="w-5 h-5" />
                    Publish &amp; Protect
                  </motion.button>
                </div>
                <p className="text-sm text-slate-400 text-center">
                  <span className="text-orange-400">*</span> All fields and a file are required before publishing.
                </p>
              </div>

            </motion.div>
          </div>

        </div>
      </div>

    </main>
  );
}