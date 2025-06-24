'use client';

import { useTranslations } from 'next-intl';
import { Upload, X, FileImage } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { formatFileSize } from '@/lib/utils';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  multiple?: boolean;
  className?: string;
  files?: File[]; // External files state
  onRemoveFile?: (index: number) => void; // Callback to remove file
}

// Convert MIME types to user-friendly file extensions
const mimeTypeToExtension = (mimeTypes: string[]): string[] => {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
    'image/gif': 'GIF',
    'image/svg+xml': 'SVG',
    'application/pdf': 'PDF',
    'image/*': 'Images'
  };

  return mimeTypes.map(type => mimeMap[type] || type.split('/')[1]?.toUpperCase() || type);
};

export function FileUpload({
  onFilesSelected,
  acceptedTypes = ['image/*'],
  maxFileSize = 10,
  multiple = true,
  className = '',
  files = [],
  onRemoveFile,
}: FileUploadProps) {
  const t = useTranslations();
  const { addToast } = useToast();
  const [isDragOver, setIsDragOver] = useState(false);

  // Use external files state if provided, otherwise use internal state
  const selectedFiles = files;

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [acceptedTypes, maxFileSize]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach(error => {
        addToast({
          type: 'error',
          message: error,
          duration: 4000,
        });
      });
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [validateFile, onFilesSelected, addToast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    if (onRemoveFile) {
      onRemoveFile(index);
    }
  }, [onRemoveFile]);



  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-4 md:p-8 text-center transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-muted-foreground" />
          </div>
          
          <div>
            <p className="text-base md:text-lg font-medium text-foreground">
              {t('common.dragAndDrop')}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {t('common.supportedFormats')}: {mimeTypeToExtension(acceptedTypes).join(', ')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max size: {maxFileSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">{t('common.selectedFiles')}:</h3>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <FileImage className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-background rounded-md transition-colors flex-shrink-0 ml-2 cursor-pointer"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
