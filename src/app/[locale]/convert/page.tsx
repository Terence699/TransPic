'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/main-layout';
import { FileUpload } from '@/components/ui/file-upload';
import { FormatConverter } from '@/components/features/format-converter';

export default function ConvertPage() {
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('convert.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('convert.description')}
          </p>
        </div>

        {/* File Upload */}
        <div className="max-w-4xl mx-auto">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            acceptedTypes={['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']}
            maxFileSize={25}
            multiple={true}
            className="mb-8"
            files={selectedFiles}
            onRemoveFile={handleRemoveFile}
          />

          {/* Format Converter */}
          {selectedFiles.length > 0 && (
            <FormatConverter
              files={selectedFiles}
              onRemoveFile={handleRemoveFile}
              onClearAll={handleClearAll}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
