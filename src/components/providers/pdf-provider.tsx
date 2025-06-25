'use client';

import { useEffect } from 'react';

export function PDFProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PDF.js worker only on client side
    const initializePDFJS = async () => {
      if (typeof window !== 'undefined') {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        } catch (error) {
          console.warn('Failed to initialize PDF.js:', error);
        }
      }
    };

    initializePDFJS();
  }, []);

  return <>{children}</>;
}
