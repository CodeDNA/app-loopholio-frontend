"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface UploadAreaProps {
  onAnalyze: (file: File, text: string) => void;
  isLoading: boolean;
}

export function UploadArea({ onAnalyze, isLoading }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(file.type)) {
      alert(
        "Please upload a PDF, Word document, text file, or image (PNG, JPG)",
      );
      return;
    }
    setFileName(file.name);
    setText("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    console.log("handle analyze: upload area");
    if (fileInputRef.current?.files?.[0]) {
      onAnalyze(fileInputRef.current.files[0], "");
    } else if (text.trim()) {
      const textFile = new File([text], "pasted-text.txt", {
        type: "text/plain",
      });
      onAnalyze(textFile, text);
    }
    setFileName(null);
    fileInputRef.current = null;
    setText("");
  };

  const hasContent = fileName || text.trim();

  return (
    <div className="flex items-center gap-0 rounded-2xl border border-border/50 bg-[#0f0f0f] hover:border-primary/50 transition-all duration-200 focus-within:border-primary/50">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,image/png,image/jpeg,image/jpg"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />

      {/* Plus button to upload files */}
      {!fileName && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="group h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-muted-foreground hover:bg-emerald-500 transition-all disabled:opacity-50"
          title="Upload PDF, Word document, text file, or image"
        >
          <svg
            className="w-5 h-5 text-emerald-400 group-hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      )}

      {/* Clear file button (if file selected) */}
      {fileName && (
        <button
          onClick={() => {
            setFileName(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          disabled={isLoading}
          className="group h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors text-muted-foreground hover:bg-red-500 disabled:opacity-50"
          title="Clear file"
        >
          <svg
            className="w-5 h-5 text-red-400 group-hover:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Textarea - 1 line, scrollable */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex-1 transition-all duration-200 ${
          isDragging ? "bg-primary/5" : ""
        }`}
      >
        <textarea
          value={fileName ? `File: ${fileName}` : text}
          onChange={(e) => !fileName && setText(e.target.value)}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          placeholder="Paste ToS text or drag & drop a document..."
          disabled={isLoading}
          className="w-full h-10 bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none disabled:opacity-50 overflow-y-auto"
          style={{ lineHeight: "1.5rem" }}
        />
      </div>

      {/* Send button */}
      <Button
        onClick={handleAnalyze}
        disabled={!hasContent || isLoading}
        className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-r-2xl transition-all shrink-0"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin"></span>
          </span>
        ) : (
          "Send"
        )}
      </Button>
    </div>
  );
}
