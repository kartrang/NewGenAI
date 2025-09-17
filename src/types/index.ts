export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export interface PDFDocument {
  name: string;
  content: string;
  size: number;
  type: string;
}

export interface AppState {
  openaiApiKey: string;
  documents: PDFDocument[];
  selectedDocument: string;
  selectedModel: string;
  chatHistory: Record<string, ChatMessage[]>;
  isProcessing: boolean;
  botReady: boolean;
}