import React, { useState } from 'react';
import { Send, Bot, User, FileText, Cpu } from 'lucide-react';
import { ChatMessage, PDFDocument } from '../types';

interface ChatInterfaceProps {
  documents: PDFDocument[];
  selectedDocument: string;
  selectedModel: string;
  onDocumentSelect: (document: string) => void;
  onModelSelect: (model: string) => void;
  onSendMessage: (message: string) => void;
  chatHistory: ChatMessage[];
  isProcessing: boolean;
  botReady: boolean;
}

const models = [
  { id: 'gpt-3.5-turbo-0125', name: 'GPT-3.5 Turbo' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  documents,
  selectedDocument,
  selectedModel,
  onDocumentSelect,
  onModelSelect,
  onSendMessage,
  chatHistory,
  isProcessing,
  botReady
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && botReady && selectedDocument && selectedModel) {
      onSendMessage(query.trim());
      setQuery('');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Search Document..🤖</h1>
        
        {documents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Select Document
              </label>
              <select
                value={selectedDocument}
                onChange={(e) => onDocumentSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Click here to select document</option>
                {documents.map((doc) => (
                  <option key={doc.name} value={doc.name}>
                    {doc.name}
                  </option>
                ))}
              </select>
              {selectedDocument && (
                <p className="text-xs text-gray-600 mt-1">
                  *selected file: {selectedDocument}*
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Cpu className="w-4 h-4" />
                Select Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => onModelSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Click here to select the model</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                *NOTE: Model is set to default temperature of 0.5*
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 p-6 chat-container">
          {chatHistory.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Chat History</h3>
              {chatHistory.map((message) => (
                <div key={message.id} className="chat-message">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 bg-blue-50 rounded-lg p-3">
                      <p className="text-gray-800">{message.question}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 mb-6">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 bg-green-50 rounded-lg p-3">
                      <p className="text-gray-800">{message.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Upload documents and start asking questions!</p>
              </div>
            </div>
          )}
        </div>

        {/* Query Input */}
        {documents.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter query here.. 👇🏻
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type your question about the document..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={!query.trim() || !botReady || !selectedDocument || !selectedModel || isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Response...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Get Answer
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};