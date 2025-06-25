'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Download, DownloadCloud, X, Trash2, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

interface ConvertedFile {
  original: File;
  converted: File | null;
  outputFormat: string;
  isProcessing: boolean;
  error?: string;
  pageNumber?: number; // For PDF files
}

interface FormatConverterProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

const OUTPUT_FORMATS = [
  { value: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg' },
  { value: 'png', label: 'PNG', mimeType: 'image/png' },
  { value: 'webp', label: 'WebP', mimeType: 'image/webp' },
  { value: 'gif', label: 'GIF', mimeType: 'image/gif' },
];

// Convert MIME type to user-friendly format
const mimeTypeToFormat = (mimeType: string): string => {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
    'image/gif': 'GIF',
    'image/svg+xml': 'SVG',
    'application/pdf': 'PDF'
  };

  return mimeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || mimeType;
};

export function FormatConverter({ files, onRemoveFile, onClearAll }: FormatConverterProps) {
  const t = useTranslations();
  const [outputFormat, setOutputFormat] = useState('png');
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [hasFormatChanged, setHasFormatChanged] = useState(false);


  // Initialize converted files array when files change
  useEffect(() => {
    const newFiles: ConvertedFile[] = files.map(file => ({
      original: file,
      converted: null,
      outputFormat,
      isProcessing: false,
      pageNumber: file.type === 'application/pdf' ? 1 : undefined,
    }));
    setConvertedFiles(newFiles);
    setHasFormatChanged(false); // Reset format change flag when new files are added

  }, [files, outputFormat]);

  const convertPdfToImage = useCallback(async (
    file: File,
    targetFormat: string,
    pageNumber: number = 1
  ): Promise<File> => {
    try {
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');

      // Ensure worker is set up
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(pageNumber);

      const scale = 2.0; // Higher scale for better quality
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      return new Promise((resolve, reject) => {
        const targetMimeType = OUTPUT_FORMATS.find(f => f.value === targetFormat)?.mimeType || 'image/png';
        const quality = targetFormat === 'jpeg' ? 0.9 : undefined;

        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = file.name.replace(/\.pdf$/i, `.${targetFormat}`);
            const convertedFile = new File([blob], fileName, { type: targetMimeType });
            resolve(convertedFile);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, targetMimeType, quality);
      });
    } catch (error) {
      throw new Error(`PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const convertImage = useCallback(async (
    file: File,
    targetFormat: string,
    pageNumber?: number
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'application/pdf') {
        convertPdfToImage(file, targetFormat, pageNumber || 1)
          .then(resolve)
          .catch(reject);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // For JPEG, fill with white background
          if (targetFormat === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);
          
          const targetMimeType = OUTPUT_FORMATS.find(f => f.value === targetFormat)?.mimeType || 'image/png';
          const quality = targetFormat === 'jpeg' ? 0.9 : undefined;
          
          canvas.toBlob((blob) => {
            if (blob) {
              const fileName = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
              const convertedFile = new File([blob], fileName, { type: targetMimeType });
              resolve(convertedFile);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, targetMimeType, quality);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, [convertPdfToImage]);

  const convertAllFiles = useCallback(async () => {
    setIsProcessingAll(true);
    
    const updatedFiles = await Promise.all(
      convertedFiles.map(async (fileData, index) => {
        const updatedFile = { 
          ...fileData, 
          isProcessing: true, 
          error: undefined,
          outputFormat
        };
        
        // Update state to show processing
        setConvertedFiles(prev => 
          prev.map((file, i) => i === index ? updatedFile : file)
        );

        try {
          const converted = await convertImage(
            fileData.original,
            outputFormat,
            fileData.pageNumber
          );
          
          return {
            ...updatedFile,
            converted,
            isProcessing: false,
          };
        } catch {
          return {
            ...updatedFile,
            isProcessing: false,
            error: 'Conversion failed',
          };
        }
      })
    );

    setConvertedFiles(updatedFiles);
    setHasFormatChanged(false); // Reset format change flag after conversion

    setIsProcessingAll(false);
  }, [convertedFiles, outputFormat, convertImage]);

  // Track format changes - don't auto-convert
  useEffect(() => {
    if (convertedFiles.length > 0) {
      // Only mark format as changed if there are already converted files
      const hasConvertedFiles = convertedFiles.some(file => file.converted);
      if (hasConvertedFiles) {
        setHasFormatChanged(true);
      }
    }
  }, [outputFormat, convertedFiles]);



  // Handle manual conversion start
  const handleStartConversion = useCallback(() => {
    if (convertedFiles.length > 0) {
      convertAllFiles();
    }
  }, [convertedFiles, convertAllFiles]);

  // Handle reconversion with new format
  const handleReconversion = useCallback(() => {
    if (convertedFiles.length > 0) {
      convertAllFiles();
      setHasFormatChanged(false);
    }
  }, [convertedFiles, convertAllFiles]);





  const downloadFile = useCallback((fileData: ConvertedFile) => {
    if (!fileData.converted) return;

    const url = URL.createObjectURL(fileData.converted);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileData.converted.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAllFiles = useCallback(async () => {
    const validFiles = convertedFiles.filter(file => file.converted && !file.isProcessing);
    
    if (validFiles.length === 0) return;

    if (validFiles.length === 1) {
      downloadFile(validFiles[0]);
      return;
    }

    // Create ZIP file for multiple files
    const zip = new JSZip();
    
    validFiles.forEach((fileData) => {
      if (fileData.converted) {
        zip.file(fileData.converted.name, fileData.converted);
      }
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_files.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
    }
  }, [convertedFiles, downloadFile]);

  const updatePageNumber = useCallback((index: number, pageNumber: number) => {
    setConvertedFiles(prev => 
      prev.map((file, i) => 
        i === index ? { ...file, pageNumber } : file
      )
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('convert.outputFormat')}
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-input rounded-md bg-background text-foreground"
              disabled={isProcessingAll}
            >
              {OUTPUT_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={downloadAllFiles}
              disabled={convertedFiles.every(file => !file.converted || file.isProcessing)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              {t('common.downloadAll')}
            </button>
            
            <button
              onClick={onClearAll}
              className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {t('common.clearAll')}
            </button>
          </div>
        </div>

        {/* Start Conversion Button */}
        {convertedFiles.length > 0 && !convertedFiles.some(file => file.converted || file.isProcessing) && (
          <button
            onClick={handleStartConversion}
            disabled={isProcessingAll}
            className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              {isProcessingAll && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              <span>{isProcessingAll ? t('common.converting') : t('common.startConversion')}</span>
            </div>
          </button>
        )}

        {/* Simple reconversion button - shown when format changed after conversion */}
        {hasFormatChanged && convertedFiles.some(file => file.converted) && (
          <button
            onClick={handleReconversion}
            disabled={isProcessingAll}
            className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              {isProcessingAll && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>{isProcessingAll ? t('common.converting') : `Convert to ${OUTPUT_FORMATS.find(f => f.value === outputFormat)?.label || outputFormat}`}</span>
            </div>
          </button>
        )}

      </div>

      {/* Files List */}
      <div className="space-y-4">
        {convertedFiles.map((fileData, index) => (
          <div key={`${fileData.original.name}-${index}`} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {fileData.original.name}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-muted-foreground font-medium">{mimeTypeToFormat(fileData.original.type)}</span>
                  <span className="text-muted-foreground">→</span>
                  <div className="flex items-center gap-1">
                    {fileData.converted && !fileData.isProcessing && !fileData.error && (
                      <span className="text-green-600">✅</span>
                    )}
                    <span className={`font-semibold ${
                      fileData.converted && !fileData.isProcessing && !fileData.error
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    }`}>
                      {OUTPUT_FORMATS.find(f => f.value === fileData.outputFormat)?.label}
                    </span>
                  </div>
                </div>
                
                {/* PDF Page Number Selector */}
                {fileData.original.type === 'application/pdf' && (
                  <div className="mt-2">
                    <label className="text-xs text-muted-foreground mr-2">
                      {t('convert.pageNumber')}:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={fileData.pageNumber || 1}
                      onChange={(e) => updatePageNumber(index, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 text-xs border border-input rounded bg-background"
                      disabled={fileData.isProcessing}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {fileData.isProcessing && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                
                {fileData.error && (
                  <span className="text-xs text-destructive">{fileData.error}</span>
                )}
                
                {fileData.converted && !fileData.isProcessing && (
                  <button
                    onClick={() => downloadFile(fileData)}
                    className="p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
                    title={t('common.download')}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                
                <button
                  onClick={() => onRemoveFile(index)}
                  className="p-2 hover:bg-accent rounded-md transition-colors cursor-pointer"
                  title={t('common.remove')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
