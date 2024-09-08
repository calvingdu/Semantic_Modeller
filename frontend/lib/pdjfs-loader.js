import { GlobalWorkerOptions } from 'pdfjs-dist/build/pdf';

if (typeof window !== 'undefined' && 'Worker' in window) {
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export * from 'pdfjs-dist';