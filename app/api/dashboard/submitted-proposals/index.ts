import { SubmittedProposal, SubmittedProposalsAPIResponse } from "@/types/dashboard/submittedProposals";
import api from "../../auth";


/**
 * Get all submitted intervention proposals
 */
export const getSubmittedProposals = async (): Promise<SubmittedProposalsAPIResponse> => {
  try {
    const response = await api.get('/v1/proposals/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch submitted proposals');
  }
};

/**
 * Get a single submitted proposal by UUID
 */
export const getSubmittedProposalById = async (id: string): Promise<SubmittedProposal> => {
  try {
    console.log("Fetching proposal by ID:", id); 
    const response = await api.get(`/v1/proposals/${id}/`);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
    throw new Error(`Failed to fetch proposal with ID ${id}`);
  }
};



/**
 * Delete a submitted proposal
 */
export const deleteSubmittedProposal = async (id: number): Promise<void> => {
  try {
    await api.delete(`/v1/proposals/${id}/`);
  } catch (error) {
    throw new Error(`Failed to delete proposal with ID ${id}`);
  }
};

/**
 * Download a proposal document
 */
export const downloadProposalDocument = async (documentUrl: string): Promise<Blob> => {
  try {
    const response = await api.get(documentUrl, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to download document');
  }
};