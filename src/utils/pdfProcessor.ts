import { PDFDocument } from '../types';

export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Simple text extraction - in a real app you'd use pdf-parse or similar
        // For demo purposes, we'll simulate PDF text extraction
        const text = `Extracted text from ${file.name}. This is a simulation of PDF text extraction. 
        In a real implementation, you would use a proper PDF parsing library to extract the actual text content.
        
        Sample content: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
        incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
        ullamco laboris nisi ut aliquip ex ea commodo consequat.
        
        This text would normally come from the actual PDF content and would be much longer and more 
        detailed based on the document's contents.`;
        
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
};

export const processPDFFiles = async (files: FileList): Promise<PDFDocument[]> => {
  const documents: PDFDocument[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type === 'application/pdf') {
      try {
        const content = await extractTextFromPDF(file);
        documents.push({
          name: file.name,
          content,
          size: file.size,
          type: file.type
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }
  }
  
  return documents;
};

export const chunkText = (text: string, chunkSize: number = 400, overlap: number = 40): string[] => {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    
    if (start >= text.length) break;
  }
  
  return chunks;
};