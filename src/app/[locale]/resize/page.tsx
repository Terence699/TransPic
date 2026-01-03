'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/main-layout';
import { FileUpload } from '@/components/ui/file-upload';
import { ImageResizer } from '@/components/features/image-resizer';

export default function ResizePage() {
  const t = useTranslations();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            {t('resize.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('resize.description')}
          </p>
        </div>

        {/* File Upload */}
        <div className="max-w-4xl mx-auto animate-fade-in-up delay-100">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
            maxFileSize={25}
            multiple={true}
            className="mb-12 shadow-sm hover:shadow-md transition-shadow duration-300"
            files={selectedFiles}
            onRemoveFile={handleRemoveFile}
          />

          {/* Image Resizer */}
          {selectedFiles.length > 0 && (
            <div className="animate-fade-in-up">
              <ImageResizer
                files={selectedFiles}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAll}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
