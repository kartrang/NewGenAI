import { PDFDocument } from '../types';
import { PineconeClient, DocumentChunk } from './pineconeClient';
import { EmbeddingClient } from './embeddingClient';

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

export const processDocumentsForPinecone = async (
  documents: PDFDocument[],
  openaiApiKey: string,
  pineconeConfig: { apiKey: string; indexName: string; namespace: string }
): Promise<boolean> => {
  try {
    const embeddingClient = new EmbeddingClient(openaiApiKey);
    const pineconeClient = new PineconeClient(pineconeConfig);
    
    // Clear existing namespace
    await pineconeClient.deleteNamespace();
    
    const allChunks: DocumentChunk[] = [];
    const allTexts: string[] = [];
    
    // Process each document
    for (const doc of documents) {
      const textChunks = chunkText(doc.content);
      
      textChunks.forEach((chunk, index) => {
        const documentChunk: DocumentChunk = {
          id: `${doc.name}-${index}`,
          content: chunk,
          metadata: {
            name: doc.name,
            type: doc.type,
            size: doc.size,
            timestamp: new Date().toISOString()
          }
        };
        
        allChunks.push(documentChunk);
        allTexts.push(chunk);
      });
    }
    
    // Generate embeddings for all chunks
    console.log('Generating embeddings for', allTexts.length, 'chunks...');
    const embeddings = await embeddingClient.generateEmbeddings(allTexts);
    
    // Upsert to Pinecone
    console.log('Upserting to Pinecone...');
    const success = await pineconeClient.upsertDocuments(allChunks, embeddings);
    
    return success;
  } catch (error) {
    console.error('Error processing documents for Pinecone:', error);
    return false;
  }
};

export const queryDocuments = async (
  query: string,
  selectedDocument: string,
  openaiApiKey: string,
  pineconeConfig: { apiKey: string; indexName: string; namespace: string }
): Promise<string[]> => {
  try {
    const embeddingClient = new EmbeddingClient(openaiApiKey);
    const pineconeClient = new PineconeClient(pineconeConfig);
    
    // Generate query embedding
    const queryEmbedding = await embeddingClient.generateQueryEmbedding(query);
    
    // Query Pinecone
    const results = await pineconeClient.queryDocuments(
      queryEmbedding,
      { name: selectedDocument },
      2
    );
    
    return results.map(chunk => chunk.content);
  } catch (error) {
    console.error('Error querying documents:', error);
    return [];
  }
};