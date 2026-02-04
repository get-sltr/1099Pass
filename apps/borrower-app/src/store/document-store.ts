/**
 * Document Store
 * Manages document uploads and storage
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

// Types
export type DocumentType =
  | 'tax_return'
  | 'w2'
  | '1099'
  | 'bank_statement'
  | 'profit_loss'
  | 'pay_stub'
  | 'contract'
  | 'other';

export type DocumentStatus = 'uploading' | 'processing' | 'verified' | 'rejected' | 'pending';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  year?: number;
  notes?: string;
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface UploadProgress {
  documentId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

interface DocumentState {
  // State
  documents: Document[];
  uploadQueue: UploadProgress[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadDocuments: () => Promise<void>;
  uploadDocument: (file: { uri: string; name: string; type: string }, docType: DocumentType, year?: number) => Promise<Document>;
  deleteDocument: (documentId: string) => Promise<void>;
  getDocumentUrl: (documentId: string) => Promise<string>;

  // Utilities
  getDocumentsByType: (type: DocumentType) => Document[];
  getDocumentsByYear: (year: number) => Document[];
  clearError: () => void;
  reset: () => void;
}

const CACHE_KEY = '1099pass_documents_cache';

// Mock data for development
const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc_1',
    name: '2023_Tax_Return.pdf',
    type: 'tax_return',
    status: 'verified',
    fileSize: 245000,
    mimeType: 'application/pdf',
    year: 2023,
    uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'doc_2',
    name: 'Uber_1099.pdf',
    type: '1099',
    status: 'verified',
    fileSize: 89000,
    mimeType: 'application/pdf',
    year: 2023,
    uploadedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'doc_3',
    name: 'Bank_Statement_Jan.pdf',
    type: 'bank_statement',
    status: 'verified',
    fileSize: 156000,
    mimeType: 'application/pdf',
    year: 2024,
    uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    verifiedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'doc_4',
    name: 'Profit_Loss_Q4.xlsx',
    type: 'profit_loss',
    status: 'pending',
    fileSize: 45000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    year: 2023,
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const useDocumentStore = create<DocumentState>((set, get) => ({
  // Initial state
  documents: [],
  uploadQueue: [],
  isLoading: false,
  error: null,

  loadDocuments: async () => {
    set({ isLoading: true, error: null });

    try {
      // Load from cache first
      const cached = await SecureStore.getItemAsync(CACHE_KEY);
      if (cached) {
        set({ documents: JSON.parse(cached) });
      }

      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({
          documents: MOCK_DOCUMENTS,
          isLoading: false,
        });
        return;
      }

      const documents = await api.get<Document[]>('/documents');
      set({ documents, isLoading: false });

      // Update cache
      await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(documents));
    } catch (error) {
      console.error('Failed to load documents:', error);
      set({
        isLoading: false,
        error: 'Failed to load documents',
      });
    }
  },

  uploadDocument: async (file, docType, year) => {
    const uploadId = `upload_${Date.now()}`;
    const uploadProgress: UploadProgress = {
      documentId: uploadId,
      fileName: file.name,
      progress: 0,
      status: 'pending',
    };

    set((state) => ({
      uploadQueue: [...state.uploadQueue, uploadProgress],
    }));

    try {
      const isDev = process.env.NODE_ENV === 'development';

      // Update progress to uploading
      set((state) => ({
        uploadQueue: state.uploadQueue.map((u) =>
          u.documentId === uploadId ? { ...u, status: 'uploading' as const, progress: 0 } : u
        ),
      }));

      if (isDev) {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 20) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          set((state) => ({
            uploadQueue: state.uploadQueue.map((u) =>
              u.documentId === uploadId ? { ...u, progress: i } : u
            ),
          }));
        }

        const newDoc: Document = {
          id: `doc_${Date.now()}`,
          name: file.name,
          type: docType,
          status: 'pending',
          fileSize: 100000, // Mock file size
          mimeType: file.type,
          year,
          uploadedAt: new Date().toISOString(),
        };

        set((state) => ({
          documents: [newDoc, ...state.documents],
          uploadQueue: state.uploadQueue.map((u) =>
            u.documentId === uploadId ? { ...u, status: 'complete' as const, progress: 100 } : u
          ),
        }));

        // Remove from queue after delay
        setTimeout(() => {
          set((state) => ({
            uploadQueue: state.uploadQueue.filter((u) => u.documentId !== uploadId),
          }));
        }, 2000);

        return newDoc;
      }

      // Production upload using FormData
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
      formData.append('type', docType);
      if (year) formData.append('year', year.toString());

      const document = await api.post<Document>('/documents/upload', formData);

      set((state) => ({
        documents: [document, ...state.documents],
        uploadQueue: state.uploadQueue.map((u) =>
          u.documentId === uploadId ? { ...u, status: 'complete' as const, progress: 100 } : u
        ),
      }));

      // Remove from queue after delay
      setTimeout(() => {
        set((state) => ({
          uploadQueue: state.uploadQueue.filter((u) => u.documentId !== uploadId),
        }));
      }, 2000);

      return document;
    } catch (error) {
      console.error('Failed to upload document:', error);

      set((state) => ({
        uploadQueue: state.uploadQueue.map((u) =>
          u.documentId === uploadId
            ? { ...u, status: 'error' as const, error: 'Upload failed' }
            : u
        ),
        error: 'Failed to upload document',
      }));

      throw error;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== documentId),
        }));
        return;
      }

      await api.delete(`/documents/${documentId}`);

      set((state) => ({
        documents: state.documents.filter((d) => d.id !== documentId),
      }));
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  },

  getDocumentUrl: async (documentId) => {
    try {
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return `https://1099pass.com/documents/${documentId}/download`;
      }

      const { url } = await api.get<{ url: string }>(`/documents/${documentId}/url`);
      return url;
    } catch (error) {
      console.error('Failed to get document URL:', error);
      throw error;
    }
  },

  getDocumentsByType: (type) => {
    return get().documents.filter((d) => d.type === type);
  },

  getDocumentsByYear: (year) => {
    return get().documents.filter((d) => d.year === year);
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({
      documents: [],
      uploadQueue: [],
      isLoading: false,
      error: null,
    });
    SecureStore.deleteItemAsync(CACHE_KEY);
  },
}));

export default useDocumentStore;
