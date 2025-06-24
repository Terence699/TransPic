'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import imageCompression from 'browser-image-compression';
import { Download, DownloadCloud, X, Trash2, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { formatFileSize, downloadFile } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading';

interface CompressedImage {
  original: File;
  compressed: File | null;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  isProcessing: boolean;
  error?: string;
}

interface ImageCompressorProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

export function ImageCompressor({ files, onRemoveFile, onClearAll }: ImageCompressorProps) {
  const t = useTranslations();
  const [quality, setQuality] = useState(0.8);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [hasQualityChanged, setHasQualityChanged] = useState(false);

  const [inputValue, setInputValue] = useState('80');
  const [isInputFocused, setIsInputFocused] = useState(false);
  // const compressionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize compressed images array when files change
  useEffect(() => {
    const newImages: CompressedImage[] = files.map(file => ({
      original: file,
      compressed: null,
      originalSize: file.size,
      compressedSize: 0,
      compressionRatio: 0,
      isProcessing: false,
    }));
    setCompressedImages(newImages);
    setHasQualityChanged(false); // Reset quality change flag when new files are added

  }, [files]);

  // Sync input value with quality when not focused
  useEffect(() => {
    if (!isInputFocused) {
      setInputValue(Math.round(quality * 100).toString());
    }
  }, [quality, isInputFocused]);

  const compressImage = useCallback(async (file: File, targetQuality: number): Promise<File> => {
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: 4096,
      useWebWorker: true,
      quality: targetQuality,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Compression error:', error);
      throw error;
    }
  }, []);

  // Handle compression with proper state management
  const handleCompression = useCallback(async (imagesToCompress: CompressedImage[], targetQuality: number) => {
    if (imagesToCompress.length === 0) return;

    setIsProcessingAll(true);

    // Set all images to processing state
    setCompressedImages(prev =>
      prev.map(img => ({ ...img, isProcessing: true, error: undefined }))
    );

    try {
      const results = await Promise.all(
        imagesToCompress.map(async (imageData) => {
          try {
            const compressed = await compressImage(imageData.original, targetQuality);
            const compressionRatio = ((imageData.originalSize - compressed.size) / imageData.originalSize) * 100;

            return {
              ...imageData,
              compressed,
              compressedSize: compressed.size,
              compressionRatio,
              isProcessing: false,
              error: undefined,
            };
          } catch {
            return {
              ...imageData,
              isProcessing: false,
              error: 'Compression failed',
            };
          }
        })
      );

      setCompressedImages(results);
      setHasQualityChanged(false); // Reset quality change flag after compression

    } finally {
      setIsProcessingAll(false);
    }
  }, [compressImage]);

  // Don't auto-compress on upload - let user choose quality first
  // Don't auto-recompress when quality changes - let user confirm with button

  // Handle quality changes - just mark that quality has changed
  useEffect(() => {
    if (compressedImages.length === 0) return;

    // Only mark quality as changed if there are already compressed images
    const hasCompressedImages = compressedImages.some(img => img.compressed);
    if (hasCompressedImages) {
      setHasQualityChanged(true);
    }
  }, [quality, compressedImages]);



  // Handle quality slider change
  const handleQualityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuality = parseFloat(e.target.value);
    setQuality(newQuality);
    // Update input value only if input is not focused (to avoid interfering with user typing)
    if (!isInputFocused) {
      setInputValue(Math.round(newQuality * 100).toString());
    }
  }, [isInputFocused]);

  // Handle quality input change
  const handleQualityInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Only update quality if the input is a valid number
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 5 && numValue <= 100) {
      const newQuality = numValue / 100;
      setQuality(newQuality);
    }
  }, []);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  // Handle input blur
  const handleInputBlur = useCallback(() => {
    setIsInputFocused(false);

    // Validate and correct the input value on blur
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < 5 || numValue > 100) {
      // Reset to current quality value if invalid
      const correctedValue = Math.round(quality * 100);
      setInputValue(correctedValue.toString());
    } else {
      // Ensure the input value matches the quality
      const correctedValue = Math.round(quality * 100);
      setInputValue(correctedValue.toString());
    }
  }, [inputValue, quality]);



  // Handle recompression with new quality
  const handleRecompression = useCallback(() => {
    if (compressedImages.length > 0) {
      handleCompression(compressedImages, quality);
      setHasQualityChanged(false);
    }
  }, [compressedImages, quality, handleCompression]);

  // Handle manual compression start
  const handleStartCompression = useCallback(() => {
    if (compressedImages.length > 0) {
      handleCompression(compressedImages, quality);
    }
  }, [compressedImages, quality, handleCompression]);



  const downloadImage = useCallback((imageData: CompressedImage) => {
    if (!imageData.compressed) return;
    downloadFile(imageData.compressed, `compressed_${imageData.original.name}`);
  }, []);

  const downloadAllImages = useCallback(async () => {
    const validImages = compressedImages.filter(img => img.compressed && !img.isProcessing);
    
    if (validImages.length === 0) return;

    if (validImages.length === 1) {
      downloadImage(validImages[0]);
      return;
    }

    // Create ZIP file for multiple images
    const zip = new JSZip();
    
    validImages.forEach((imageData) => {
      if (imageData.compressed) {
        zip.file(`compressed_${imageData.original.name}`, imageData.compressed);
      }
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'compressed_images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
    }
  }, [compressedImages, downloadImage]);

  const totalOriginalSize = compressedImages.reduce((sum, img) => sum + img.originalSize, 0);
  const totalCompressedSize = compressedImages.reduce((sum, img) => sum + img.compressedSize, 0);
  const totalSavings = totalOriginalSize > 0 ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('compress.qualityLabel')}: {Math.round(quality * 100)}%
            </label>
            <div className="flex items-center gap-3">
              {/* Slider */}
              <div className="relative flex-1">
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={handleQualityChange}
                  disabled={isProcessingAll}
                  className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer slider-thumb disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background: `linear-gradient(to right,
                      #fecaca 0%,
                      #fef3c7 50%,
                      #bbf7d0 100%)`
                  }}
                />
                <style jsx>{`
                  .slider-thumb::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s ease;
                  }
                  .slider-thumb::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                  }
                  .slider-thumb::-webkit-slider-thumb:active {
                    transform: scale(0.95);
                  }
                  .slider-thumb::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s ease;
                  }
                  .slider-thumb::-moz-range-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                  }
                  .slider-thumb::-moz-range-track {
                    height: 12px;
                    border-radius: 6px;
                    background: linear-gradient(to right, #fecaca 0%, #fef3c7 50%, #bbf7d0 100%);
                  }
                `}</style>
              </div>

              {/* Number Input */}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleQualityInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  disabled={isProcessingAll}
                  placeholder="80"
                  className="w-16 px-2 py-1 text-sm border border-border rounded-md text-center
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            {/* Start Compression Button */}
            {compressedImages.length > 0 && !compressedImages.some(img => img.compressed || img.isProcessing) && (
              <button
                onClick={handleStartCompression}
                disabled={isProcessingAll}
                className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2">
                  {isProcessingAll && (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  )}
                  <span>{isProcessingAll ? t('compress.compressing') : t('compress.startCompression')}</span>
                </div>
              </button>
            )}

            {/* Simple recompression button - shown when quality changed after compression */}
            {hasQualityChanged && compressedImages.some(img => img.compressed) && (
              <button
                onClick={handleRecompression}
                disabled={isProcessingAll}
                className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2">
                  {isProcessingAll && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span>{isProcessingAll ? t('compress.recompressing') : `Compress with ${Math.round(quality * 100)}% Quality`}</span>
                </div>
              </button>
            )}

          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={downloadAllImages}
              disabled={compressedImages.every(img => !img.compressed || img.isProcessing)}
              className="flex items-center gap-2"
            >
              <DownloadCloud className="w-4 h-4" />
              {t('common.downloadAll')}
            </Button>

            <Button
              onClick={onClearAll}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('common.clearAll')}
            </Button>
          </div>
        </div>

        {/* Summary */}
        {totalOriginalSize > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('common.originalSize')}: </span>
                <span className="font-medium">{formatFileSize(totalOriginalSize)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('common.compressedSize')}: </span>
                <span className="font-medium">{formatFileSize(totalCompressedSize)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('common.savings')}: </span>
                <span className="font-medium text-green-600">{totalSavings.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Images List */}
      <LoadingOverlay isLoading={isProcessingAll} text={t('common.compressingImages')}>
        <div className="space-y-4">
          {compressedImages.map((imageData, index) => (
            <div key={`${imageData.original.name}-${index}`} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {imageData.original.name}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(imageData.originalSize)}</span>
                  <span>→</span>
                  <span>{imageData.compressed ? formatFileSize(imageData.compressedSize) : '...'}</span>
                  {imageData.compressionRatio > 0 && (
                    <span className="text-green-600 font-medium">
                      -{imageData.compressionRatio.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {imageData.isProcessing && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                
                {imageData.error && (
                  <span className="text-xs text-destructive">{imageData.error}</span>
                )}
                
                {imageData.compressed && !imageData.isProcessing && (
                  <button
                    onClick={() => downloadImage(imageData)}
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
      </LoadingOverlay>
    </div>
  );
}
