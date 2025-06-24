'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Pica from 'pica';
import { Download, DownloadCloud, X, Trash2, Loader2, Lock, Unlock } from 'lucide-react';
import JSZip from 'jszip';

interface ResizedImage {
  original: File;
  resized: File | null;
  originalDimensions: { width: number; height: number };
  targetDimensions: { width: number; height: number };
  isProcessing: boolean;
  error?: string;
}

interface ImageResizerProps {
  files: File[];
  onRemoveFile: (index: number) => void;
  onClearAll: () => void;
}

export function ImageResizer({ files, onRemoveFile, onClearAll }: ImageResizerProps) {
  const t = useTranslations();
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [resizedImages, setResizedImages] = useState<ResizedImage[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [hasDimensionsChanged, setHasDimensionsChanged] = useState(false);

  const pica = useMemo(() => new Pica(), []);

  const getImageDimensions = useCallback((file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Initialize resized images array when files change
  useEffect(() => {
    const initializeImages = async () => {
      const newImages: ResizedImage[] = [];

      for (const file of files) {
        const dimensions = await getImageDimensions(file);
        newImages.push({
          original: file,
          resized: null,
          originalDimensions: dimensions,
          targetDimensions: { width: targetWidth, height: targetHeight },
          isProcessing: false,
        });
      }

      setResizedImages(newImages);
      setHasDimensionsChanged(false); // Reset dimensions change flag when new files are added

      // Set aspect ratio from first image if available
      if (newImages.length > 0 && lockAspectRatio) {
        const firstImage = newImages[0];
        const ratio = firstImage.originalDimensions.width / firstImage.originalDimensions.height;
        setAspectRatio(ratio);
        setTargetHeight(Math.round(targetWidth / ratio));
      }
    };

    if (files.length > 0) {
      initializeImages();
    }
  }, [files, targetWidth, targetHeight, getImageDimensions, lockAspectRatio]);

  const resizeImage = useCallback(async (
    file: File, 
    targetWidth: number, 
    targetHeight: number
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = img.width;
          offscreenCanvas.height = img.height;
          const offscreenCtx = offscreenCanvas.getContext('2d');
          offscreenCtx?.drawImage(img, 0, 0);

          await pica.resize(offscreenCanvas, canvas);
          
          canvas.toBlob((blob) => {
            if (blob) {
              // Add 'resized_' prefix to filename
              const fileName = `resized_${file.name}`;
              const resizedFile = new File([blob], fileName, { type: file.type });
              resolve(resizedFile);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, file.type, 0.9);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, [pica]);

  const handleWidthChange = useCallback((width: number) => {
    setTargetWidth(width);
    if (lockAspectRatio && aspectRatio) {
      setTargetHeight(Math.round(width / aspectRatio));
    }
  }, [lockAspectRatio, aspectRatio]);

  const handleHeightChange = useCallback((height: number) => {
    setTargetHeight(height);
    if (lockAspectRatio && aspectRatio) {
      setTargetWidth(Math.round(height * aspectRatio));
    }
  }, [lockAspectRatio, aspectRatio]);

  const resizeAllImages = useCallback(async (imagesToResize: ResizedImage[]) => {
    if (imagesToResize.length === 0) return;

    setIsProcessingAll(true);

    const updatedImages = await Promise.all(
      imagesToResize.map(async (imageData, index) => {
        const updatedImage = {
          ...imageData,
          isProcessing: true,
          error: undefined,
          targetDimensions: { width: targetWidth, height: targetHeight }
        };

        // Update state to show processing
        setResizedImages(prev =>
          prev.map((img, i) => i === index ? updatedImage : img)
        );

        try {
          const resized = await resizeImage(imageData.original, targetWidth, targetHeight);

          return {
            ...updatedImage,
            resized,
            isProcessing: false,
          };
        } catch {
          return {
            ...updatedImage,
            isProcessing: false,
            error: 'Resize failed',
          };
        }
      })
    );

    setResizedImages(updatedImages);
    setHasDimensionsChanged(false); // Reset dimensions change flag after resize
    setIsProcessingAll(false);
  }, [targetWidth, targetHeight, resizeImage]);

  // Track dimensions changes - don't auto-resize
  useEffect(() => {
    if (resizedImages.length > 0) {
      // Only mark dimensions as changed if there are already resized images
      const hasResizedImages = resizedImages.some(img => img.resized);
      if (hasResizedImages) {
        setHasDimensionsChanged(true);
      }
    }
  }, [targetWidth, targetHeight, resizedImages]);

  // Manual resize trigger
  const handleResizeAll = useCallback(() => {
    if (resizedImages.length > 0) {
      resizeAllImages(resizedImages);
    }
  }, [resizedImages, resizeAllImages]);

  // Handle re-resize with new dimensions
  const handleReResize = useCallback(() => {
    if (resizedImages.length > 0) {
      resizeAllImages(resizedImages);
      setHasDimensionsChanged(false);
    }
  }, [resizedImages, resizeAllImages]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadImage = useCallback((imageData: ResizedImage) => {
    if (!imageData.resized) return;

    const url = URL.createObjectURL(imageData.resized);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resized_${imageData.original.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const downloadAllImages = useCallback(async () => {
    const validImages = resizedImages.filter(img => img.resized && !img.isProcessing);
    
    if (validImages.length === 0) return;

    if (validImages.length === 1) {
      downloadImage(validImages[0]);
      return;
    }

    // Create ZIP file for multiple images
    const zip = new JSZip();
    
    validImages.forEach((imageData) => {
      if (imageData.resized) {
        zip.file(`resized_${imageData.original.name}`, imageData.resized);
      }
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resized_images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
    }
  }, [resizedImages, downloadImage]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('common.width')} (px)
            </label>
            <input
              type="number"
              value={targetWidth}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              disabled={isProcessingAll}
              min="1"
              max="8192"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t('common.height')} (px)
            </label>
            <input
              type="number"
              value={targetHeight}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              disabled={isProcessingAll}
              min="1"
              max="8192"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setLockAspectRatio(!lockAspectRatio)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer ${
                lockAspectRatio
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
              disabled={isProcessingAll}
            >
              {lockAspectRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {t('resize.lockAspectRatio')}
            </button>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={downloadAllImages}
              disabled={resizedImages.every(img => !img.resized || img.isProcessing)}
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

        {/* Start Resize Button */}
        {resizedImages.length > 0 && !resizedImages.some(img => img.resized || img.isProcessing) && (
          <button
            onClick={handleResizeAll}
            disabled={isProcessingAll}
            className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98] active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-lg shadow-purple-500/20 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              {isProcessingAll && (
                <Loader2 className="w-5 h-5 animate-spin" />
              )}
              <span>{isProcessingAll ? t('resize.resizing') : t('resize.startResize')}</span>
            </div>
          </button>
        )}

        {/* Simple re-resize button - shown when dimensions changed after resize */}
        {hasDimensionsChanged && resizedImages.some(img => img.resized) && (
          <button
            onClick={handleReResize}
            disabled={isProcessingAll}
            className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-2">
              {isProcessingAll && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              <span>{isProcessingAll ? t('resize.resizing') : `Resize to ${targetWidth} × ${targetHeight}`}</span>
            </div>
          </button>
        )}
      </div>

      {/* Images List */}
      <div className="space-y-4">
        {resizedImages.map((imageData, index) => (
          <div key={`${imageData.original.name}-${index}`} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate">
                  {imageData.original.name}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>
                    {imageData.originalDimensions.width} × {imageData.originalDimensions.height}
                  </span>
                  <span>→</span>
                  <span>
                    {imageData.targetDimensions.width} × {imageData.targetDimensions.height}
                  </span>
                  <span>({formatFileSize(imageData.original.size)})</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {imageData.isProcessing && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}

                {imageData.error && (
                  <span className="text-xs text-destructive">{imageData.error}</span>
                )}

                {imageData.resized && !imageData.isProcessing && (
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
    </div>
  );
}
