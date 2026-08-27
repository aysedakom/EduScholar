import api from './axios';
import type { VaultDocument } from '../types';

export const getMyDocuments = () => {
  return api.get<VaultDocument[]>('/documents');
};

export interface CreateDocumentPayload {
  name: string;
  category: string;
  size?: string;
  expiryDate?: string;
}

export const createDocument = (payload: CreateDocumentPayload) => {
  return api.post<VaultDocument>('/documents', payload);
};

export const deleteDocument = (id: string) => {
  return api.delete(`/documents/${id}`);
};

