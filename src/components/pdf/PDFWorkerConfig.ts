
import { pdfjs } from 'react-pdf';

// Enhanced PDF.js worker configuration with multiple fallbacks
export const configurePDFWorker = () => {
  // Only configure if not already set
  if (pdfjs.GlobalWorkerOptions.workerSrc) {
    return;
  }

  try {
    // Primary: Try CDN with specific version
    const cdnWorkerUrl = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    pdfjs.GlobalWorkerOptions.workerSrc = cdnWorkerUrl;
    console.log('PDF worker configured with unpkg CDN:', cdnWorkerUrl);
  } catch (error) {
    console.warn('Primary worker configuration failed, trying fallback:', error);
    
    // Fallback: Use alternative CDN
    try {
      const fallbackUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
      pdfjs.GlobalWorkerOptions.workerSrc = fallbackUrl;
      console.log('PDF worker configured with fallback CDN:', fallbackUrl);
    } catch (fallbackError) {
      console.error('All worker configurations failed:', fallbackError);
      // Let the component handle the error gracefully
    }
  }
};

// Configure worker immediately when module loads
configurePDFWorker();
