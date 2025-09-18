import { PDFDocument } from '../types';
import { queryDocuments } from './documentProcessor';

export class OpenAIClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateResponse(
    query: string, 
    context: string, 
    model: string = 'gpt-3.5-turbo',
    selectedDocument?: string,
    pineconeConfig?: { apiKey: string; indexName: string; namespace: string }
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    // If Pinecone config is provided, use it to get relevant context
    let relevantContext = context;
    if (pineconeConfig && selectedDocument) {
      try {
        const pineconeResults = await queryDocuments(query, selectedDocument, this.apiKey, pineconeConfig);
        if (pineconeResults.length > 0) {
          relevantContext = pineconeResults.join('\n\n');
        }
      } catch (error) {
        console.warn('Failed to query Pinecone, using fallback context:', error);
      }
    }
    
    const prompt = `Based on the following document context, please answer the user's question. If the answer cannot be found in the context, please say so.

Context:
${relevantContext}

Question: ${query}

Answer:`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that answers questions based on provided document context.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 500
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
  
  findRelevantContext(query: string, document: PDFDocument): string {
    // Simple keyword-based context extraction
    // In a real app, you'd use embeddings and vector similarity
    const queryWords = query.toLowerCase().split(' ');
    const sentences = document.content.split(/[.!?]+/);
    
    const relevantSentences = sentences.filter(sentence => {
      const sentenceLower = sentence.toLowerCase();
      return queryWords.some(word => sentenceLower.includes(word));
    });
    
    // Return first 2 relevant sentences or first 500 chars if no matches
    if (relevantSentences.length > 0) {
      return relevantSentences.slice(0, 2).join('. ') + '.';
    }
    
    return document.content.substring(0, 500) + '...';
  }
}