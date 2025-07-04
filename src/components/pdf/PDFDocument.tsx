
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocumentLoadingState, PDFPageLoadingState, PDFPageErrorState } from './PDFLoadingStates';

interface PDFDocumentProps {
  file: File | string;
  pageNumber: number;
  scale: number;
  rotation: number;
  width?: number;
  height?: number;
  isLoading: boolean;
  error: string | null;
  onLoadSuccess: (pdf: { numPages: number }) => void;
  onLoadError: (error: Error) => void;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({
  file,
  pageNumber,
  scale,
  rotation,
  width,
  height,
  isLoading,
  error,
  onLoadSuccess,
  onLoadError
}) => {
  return (
    <div className="flex-1 overflow-auto border rounded-lg bg-white">
      <Document
        file={file}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={<PDFDocumentLoadingState />}
        error={null}
        options={{
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
          isEvalSupported: false,
          maxImageSize: 1024 * 1024
        }}
      >
        {!isLoading && !error && (
          <Page
            pageNumber={pageNumber}
            scale={scale}
            rotate={rotation}
            width={width}
            height={height}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={<PDFPageLoadingState />}
            error={<PDFPageErrorState />}
          />
        )}
      </Document>
    </div>
  );
};

export default PDFDocument;
