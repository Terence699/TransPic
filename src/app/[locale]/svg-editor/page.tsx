'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { MainLayout } from '@/components/layout/main-layout';
import { SvgEditor } from '@/components/features/svg-editor';

export default function SvgEditorPage() {
  const t = useTranslations();
  const [svgCode, setSvgCode] = useState(`<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="80" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
  <text x="100" y="110" text-anchor="middle" fill="white" font-family="Arial" font-size="16">
    SVG
  </text>
</svg>`);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSvgCode(content);
    };
    reader.readAsText(file);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t('svgEditor.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('svgEditor.description')}
          </p>
        </div>

        {/* SVG Editor */}
        <div className="max-w-6xl mx-auto">
          <SvgEditor
            svgCode={svgCode}
            onSvgCodeChange={setSvgCode}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </MainLayout>
  );
}
