import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { processPDFFiles } from './utils/pdfProcessor';
import { OpenAIClient } from './utils/openaiClient';
import { AppState, ChatMessage, PDFDocument } from './types';

function App() {
  const [state, setState] = useState<AppState>({
    openaiApiKey: '',
    documents: [],
    selectedDocument: '',
    selectedModel: '',
    chatHistory: {},
    isProcessing: false,
    botReady: false
  });

  const handleApiKeyChange = useCallback((key: string) => {
    setState(prev => ({ ...prev, openaiApiKey: key }));
  }, []);

  const handleFilesUpload = useCallback((files: FileList) => {
    setState(prev => ({ ...prev, botReady: false }));
    processPDFFiles(files).then(documents => {
      setState(prev => ({ ...prev, documents }));
    });
  }, []);

  const handleProcessDocuments = useCallback(async () => {
    if (!state.openaiApiKey || state.documents.length === 0) return;

    setState(prev => ({ ...prev, isProcessing: true, botReady: false }));
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        botReady: true 
      }));
    } catch (error) {
      console.error('Error processing documents:', error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        botReady: false 
      }));
    }
  }, [state.openaiApiKey, state.documents]);

  const handleDocumentSelect = useCallback((document: string) => {
    setState(prev => ({ ...prev, selectedDocument: document }));
  }, []);

  const handleModelSelect = useCallback((model: string) => {
    setState(prev => ({ ...prev, selectedModel: model }));
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!state.selectedDocument || !state.selectedModel || !state.openaiApiKey) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const client = new OpenAIClient(state.openaiApiKey);
      const selectedDoc = state.documents.find(doc => doc.name === state.selectedDocument);
      
      if (!selectedDoc) {
        throw new Error('Selected document not found');
      }

      const context = client.findRelevantContext(message, selectedDoc);
      const response = await client.generateResponse(message, context, state.selectedModel);

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        question: message,
        answer: response,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        isProcessing: false,
        chatHistory: {
          ...prev.chatHistory,
          [state.selectedDocument]: [
            ...(prev.chatHistory[state.selectedDocument] || []),
            newMessage
          ]
        }
      }));
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        question: message,
        answer: `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        isProcessing: false,
        chatHistory: {
          ...prev.chatHistory,
          [state.selectedDocument]: [
            ...(prev.chatHistory[state.selectedDocument] || []),
            errorMessage
          ]
        }
      }));
    }
  }, [state.selectedDocument, state.selectedModel, state.openaiApiKey, state.documents]);

  const currentChatHistory = state.selectedDocument 
    ? state.chatHistory[state.selectedDocument] || []
    : [];

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar
        apiKey={state.openaiApiKey}
        onApiKeyChange={handleApiKeyChange}
        onFilesUpload={handleFilesUpload}
        onProcessDocuments={handleProcessDocuments}
        documents={state.documents}
        isProcessing={state.isProcessing}
        botReady={state.botReady}
      />
      <ChatInterface
        documents={state.documents}
        selectedDocument={state.selectedDocument}
        selectedModel={state.selectedModel}
        onDocumentSelect={handleDocumentSelect}
        onModelSelect={handleModelSelect}
        onSendMessage={handleSendMessage}
        chatHistory={currentChatHistory}
        isProcessing={state.isProcessing}
        botReady={state.botReady}
      />
    </div>
  );
}

export default App;