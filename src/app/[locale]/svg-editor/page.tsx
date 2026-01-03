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
      <div className="container mx-auto px-4 py-16 md:py-24">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            {t('svgEditor.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('svgEditor.description')}
          </p>
        </div>

        {/* SVG Editor */}
        <div className="max-w-6xl mx-auto animate-fade-in-up delay-100">
          <div className="shadow-xl rounded-2xl overflow-hidden bg-card border border-border/50">
            <SvgEditor
              svgCode={svgCode}
              onSvgCodeChange={setSvgCode}
              onFileUpload={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
