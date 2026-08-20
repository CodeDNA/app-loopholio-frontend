"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConnectionStatus } from "@/types/connection-status";
import { Spinner } from "@/components/ui/spinner";
import { SelectComponent } from "@/components/ui/custom/select-component";
import { TEXT_INPUT_TYPE } from "@/types/text-input-type.enum";
interface UploadAreaProps {
  onAnalyze: (text: string, isUrl: boolean, file?: File) => void;
  isLoading: boolean;
  backendStatus: ConnectionStatus;
}

const MAX_FILE_SIZE_MB = 5;
const MIN_TEXT_LENGTH = 100;
const MAX_TEXT_LENGTH = 50000;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const formatK = (num: number) => (num >= 1000 ? num / 1000 + "K" : num);

const FILE_SIZE_INSTRUCTION = `Max file size: ${MAX_FILE_SIZE_MB} MB | Text length: Min - ${MIN_TEXT_LENGTH}, Max - ${formatK(MAX_TEXT_LENGTH)}`;
const FILE_SIZE_ERROR_MESSAGE = `[ ERROR: Max file size exceeded! File must be smaller than ${MAX_FILE_SIZE_MB} Mb ]`;
const MAX_TEXT_LENGTH_ERROR = `[ ERROR: Max allowed text length: ${formatK(MAX_TEXT_LENGTH)} characters ]`;

export function UploadArea({
  onAnalyze,
  isLoading,
  backendStatus,
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [inputError, setInputError] = useState<string>("");
  const [isTextOrURL, setIsTextOrURL] = useState<TEXT_INPUT_TYPE>(
    TEXT_INPUT_TYPE.TEXT,
  );
  const [url, setUrl] = useState("");
  const items = [
    { value: TEXT_INPUT_TYPE.TEXT, label: "Text" },
    { value: TEXT_INPUT_TYPE.URL, label: "Url" },
  ];

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
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setInputError(FILE_SIZE_ERROR_MESSAGE);
    } else {
      setInputError("");
    }

    setFileName(file.name);
    setText("");
    setUrl("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!fileName) {
      setText(e.target.value);
    }
    if (
      isTextOrURL === TEXT_INPUT_TYPE.TEXT &&
      e.target.value.length > MAX_TEXT_LENGTH
    ) {
      setInputError(MAX_TEXT_LENGTH_ERROR);
    } else {
      setInputError("");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length) {
      setUrl(e.target.value);
    } else {
      setUrl("");
    }
  };

  const handleAnalyze = () => {
    // console.log("handle analyze: upload area");
    if (fileName) {
      if (fileInputRef.current?.files?.[0]) {
        onAnalyze("", false, fileInputRef.current.files[0]);
      }
    } else if (isTextOrURL === TEXT_INPUT_TYPE.TEXT && text.trim()) {
      onAnalyze(text, false);
    } else if (isTextOrURL === TEXT_INPUT_TYPE.URL && url.trim()) {
      onAnalyze(url, true);
    }
    setFileName(null);
    setText("");
    setUrl("");
  };

  useEffect(() => {
    if (url === "") {
      setInputError("");
      return;
    }

    const timer = setTimeout(() => {
      if (!isValidUrl(url)) {
        setInputError("Please enter a valid URL ex. https://google.com");
      } else {
        setInputError("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [url]);

  const isValidUrl = (str: string): boolean => {
    // * must contain '//' in the url
    if (!str.includes("//")) {
      return false;
    }

    // * check structure
    if (!URL.canParse(str)) {
      return false;
    }

    const url = new URL(str);

    // * accept only http and https protocol
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    const host = url.hostname;

    // * ensures there is at least one dot, and it isn't at the very start/end
    if (!host.includes(".") || host.startsWith(".") || host.endsWith(".")) {
      return false;
    }

    // * must contain atleast one '.' (two words)
    const parts = host.split(".");
    const tld = parts[parts.length - 1];
    if (tld.length < 2) {
      return false;
    }

    return true;
  };

  const nobackendcomponent =
    backendStatus == ConnectionStatus.DISCONNECTED ? (
      <div className="text-center font-mono border rounded-lg bg-red-500/20 border-red-500 p-5 m-5 text-red-500">
        <p className="font-bold">BACKEND ERROR!</p>
        <p className="font-semibold">
          Possibly due to cold start. It might take about 30 seconds to boot.
        </p>
        <p className="font-semibold">
          Please refresh the page or try after some time.
        </p>
        <p className="font-semibold">
          You can still view your old analyses(if present).
        </p>
      </div>
    ) : (
      <div className="font-mono text-xl border rounded-lg bg-gray-500/20 border-gray-500 p-5 m-5 text-white">
        <div className="flex text-muted-foreground justify-center items-center gap-4">
          <p>Connecting</p>
          <Spinner className="size-5" />
        </div>
      </div>
    );

  if (backendStatus != ConnectionStatus.CONNECTED) {
    return nobackendcomponent;
  }

  const hasContent = fileName || text.trim() || url;
  const inputClasses =
    "block box-border w-full h-10 bg-transparent px-4 py-2 text-sm leading-6 text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:opacity-50";

  return (
    <>
      <div className="flex items-center gap-0 rounded-2xl border border-border/50 bg-[#0f0f0f] hover:border-primary/50 transition-all duration-200 focus-within:border-primary/50 p-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {/* Plus button to upload files +-button*/}
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

        {/* Clear file button (if file selected) X-button*/}
        {fileName && (
          <button
            onClick={() => {
              setFileName(null);
              setInputError("");
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
          className={`flex-1 items-center justify-center transition-all duration-200 ${
            isDragging ? "bg-primary/5" : ""
          }`}
        >
          {isTextOrURL === TEXT_INPUT_TYPE.TEXT && (
            <textarea
              value={fileName ? `File: ${fileName}` : text}
              onChange={handleTextChange}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              placeholder="Type/paste text"
              disabled={isLoading}
              className={`${inputClasses} min-h-10 resize-none overflow-y-auto`}
            />
          )}
          {isTextOrURL === TEXT_INPUT_TYPE.URL && (
            <input
              value={fileName ? `File: ${fileName}` : url}
              onChange={handleUrlChange}
              type="url"
              className={inputClasses}
              placeholder="Type/paste Url"
            />
          )}
        </div>

        {/* Select component */}
        <div className="bg-transparent text-muted-foreground hover:text-teal-500 font-semibold mr-1">
          <SelectComponent
            selectedValue={isTextOrURL}
            items={items}
            onValueChange={(val: TEXT_INPUT_TYPE) => {
              if (val == TEXT_INPUT_TYPE.URL) {
                setText("");
                setFileName(null);
              } else {
                setUrl("");
              }
              setIsTextOrURL(val);
            }}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleAnalyze}
          disabled={
            !hasContent ||
            !!inputError ||
            (isTextOrURL == TEXT_INPUT_TYPE.TEXT &&
              !fileName &&
              text.length < MIN_TEXT_LENGTH)
          }
          className="h-10 px-4 bg-teal-500 hover:bg-teal-700 text-white font-semibold rounded-r-2xl transition-all shrink-0"
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

      <div className="flex justify-between items-centre">
        <div>
          <p className="p-2 text-sm text-foreground">{FILE_SIZE_INSTRUCTION}</p>
          {inputError && (
            <p className="p-2 text-red-500 font-medium">{inputError}</p>
          )}
        </div>
        <p
          className={cn(
            "pr-2",
            text.trim().length >= MIN_TEXT_LENGTH
              ? text.trim().length > MAX_TEXT_LENGTH
                ? "text-red-500"
                : "text-teal-500"
              : "text-zinc-700",
          )}
        >
          {text.trim().length}/
          {text.trim().length < MIN_TEXT_LENGTH
            ? MIN_TEXT_LENGTH
            : formatK(MAX_TEXT_LENGTH)}
        </p>
      </div>
    </>
  );
}
