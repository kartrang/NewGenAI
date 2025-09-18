import React from 'react';
import { Upload, Key, FileText, Zap } from 'lucide-react';
import { PDFDocument } from '../types';

interface SidebarProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onFilesUpload: (files: FileList) => void;
  onProcessDocuments: () => void;
  documents: PDFDocument[];
  isProcessing: boolean;
  botReady: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  apiKey,
  onApiKeyChange,
  onFilesUpload,
  onProcessDocuments,
  documents,
  isProcessing,
  botReady
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesUpload(e.target.files);
    }
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <div className="text-2xl">😎🗝️</div>
        <h2 className="text-lg font-semibold text-gray-800">Configuration</h2>
      </div>
      
      <div className="space-y-6">
        {/* Pinecone Status */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-blue-800 text-sm">
            <div className="font-medium mb-1">Vector Database Status</div>
            {import.meta.env.VITE_PINECONE_API_KEY ? (
              <div className="flex items-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Pinecone configured
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-700">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Using mock mode (add Pinecone keys to .env)
              </div>
            )}
          </div>
        </div>

        {/* API Key Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Key className="w-4 h-4" />
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter your OpenAI API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4" />
            Upload PDF Files
          </label>
          <div className="relative">
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {documents.length > 0 && (
            <div className="mt-2 text-xs text-gray-600">
              {documents.length} file(s) selected
            </div>
          )}
        </div>

        {/* Process Button */}
        <button
          onClick={onProcessDocuments}
          disabled={documents.length === 0 || !apiKey || isProcessing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Push for bot to learn
            </>
          )}
        </button>

        {botReady && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-green-800 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Bot is ready to answer questions!
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-blue-800 text-sm">
              Wait! ChatBot is Learning ✋🏻
              <div className="mt-2 text-xs text-blue-600">
                Processing documents and preparing responses...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};