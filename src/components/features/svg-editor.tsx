'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Upload, FileText, Image as ImageIcon } from 'lucide-react';

interface SvgEditorProps {
  svgCode: string;
  onSvgCodeChange: (code: string) => void;
  onFileUpload: (file: File) => void;
}

export function SvgEditor({ svgCode, onSvgCodeChange, onFileUpload }: SvgEditorProps) {
  const t = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    onSvgCodeChange(newCode);
    setError(null);
  }, [onSvgCodeChange]);

  const handleFileUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      onFileUpload(file);
    } else {
      setError('Please select a valid SVG file');
    }
  }, [onFileUpload]);

  const downloadSvg = useCallback(() => {
    try {
      const blob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'edited.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download SVG');
    }
  }, [svgCode]);

  const downloadPng = useCallback(() => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas not supported');
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width || 400;
        canvas.height = img.height || 400;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      };
      
      img.onerror = () => setError('Failed to convert SVG to PNG');
      
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    } catch {
      setError('Failed to convert to PNG');
    }
  }, [svgCode]);

  const downloadJpg = useCallback(() => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Canvas not supported');
        return;
      }

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width || 400;
        canvas.height = img.height || 400;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }, 'image/jpeg', 0.9);
      };
      
      img.onerror = () => setError('Failed to convert SVG to JPG');
      
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    } catch {
      setError('Failed to convert to JPG');
    }
  }, [svgCode]);

  const isValidSvg = useCallback((code: string): boolean => {
    // Only validate on client side to avoid hydration mismatch
    if (!isMounted) return true;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(code, 'image/svg+xml');
      const parserError = doc.querySelector('parsererror');
      return !parserError;
    } catch {
      return false;
    }
  }, [isMounted]);

  const renderPreview = useCallback(() => {
    // Show loading state during hydration to avoid mismatch
    if (!isMounted) {
      return (
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="text-center text-muted-foreground">
            <p>Loading preview...</p>
          </div>
        </div>
      );
    }

    if (!svgCode.trim()) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-2" />
            <p>Enter SVG code to see preview</p>
          </div>
        </div>
      );
    }

    if (!isValidSvg(svgCode)) {
      return (
        <div className="flex items-center justify-center h-full text-destructive">
          <div className="text-center">
            <p>Invalid SVG code</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="w-full h-full flex items-center justify-center p-4"
        dangerouslySetInnerHTML={{ __html: svgCode }}
      />
    );
  }, [svgCode, isValidSvg, isMounted]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Upload Section - Left */}
          <div>
            <button
              onClick={handleFileUploadClick}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {t('svgEditor.uploadSvg')}
            </button>
          </div>

          {/* Download Section - Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={downloadSvg}
              disabled={!isMounted || !svgCode.trim() || !isValidSvg(svgCode)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t('svgEditor.downloadSvg')}
            </button>

            <button
              onClick={downloadPng}
              disabled={!isMounted || !svgCode.trim() || !isValidSvg(svgCode)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              {t('svgEditor.downloadPng')}
            </button>

            <button
              onClick={downloadJpg}
              disabled={!isMounted || !svgCode.trim() || !isValidSvg(svgCode)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              {t('svgEditor.downloadJpg')}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </div>

      {/* Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {t('svgEditor.codeEditor')}
          </h3>
          <div className="border border-border rounded-lg overflow-hidden">
            <textarea
              value={svgCode}
              onChange={handleCodeChange}
              className="w-full h-96 p-4 font-mono text-sm bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter your SVG code here..."
              spellCheck={false}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {t('svgEditor.preview')}
          </h3>
          <div className="border border-border rounded-lg bg-white dark:bg-gray-50 h-96 overflow-auto">
            {renderPreview()}
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
