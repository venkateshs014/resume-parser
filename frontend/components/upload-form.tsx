"use client";

import { FileText, Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadResume } from "@/lib/api";

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.type !== "application/pdf") {
      setError("Upload a PDF file.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadResume(file);
      router.push(`/resume/${response.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload resume</CardTitle>
        <CardDescription>PDF files are sent to the parser worker for asynchronous processing.</CardDescription>
      </CardHeader>
      <CardContent>
        <section
          aria-label="Resume PDF upload"
          className={`flex min-h-72 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors sm:p-10 ${
            isDragging ? "border-primary bg-muted" : "border-border"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files.item(0);
            if (file) {
              void handleFile(file);
            }
          }}
        >
          <input
            ref={inputRef}
            className="hidden"
            type="file"
            accept="application/pdf"
            onChange={(event) => {
              const file = event.target.files?.item(0);
              if (file) {
                void handleFile(file);
              }
            }}
          />
          <div className="flex max-w-sm flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
              ) : isDragging ? (
                <Upload className="h-6 w-6 text-primary" aria-hidden="true" />
              ) : (
                <FileText className="h-6 w-6 text-primary" aria-hidden="true" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-medium">Drop a PDF resume here</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">or browse for a file from your computer</p>
            </div>
            <Button type="button" onClick={() => inputRef.current?.click()} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Choose PDF"}
            </Button>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
