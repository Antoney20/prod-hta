import { PublicProposal, PublicProposalResponse } from "@/types/new/public";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export const API_URL = `${process.env.API_URL || API_BASE_URL}`;


// export const API_URL = "/api";

export async function getPublicProposals(): Promise<PublicProposal[]> {
const res = await fetch(`${API_URL}/v3/proposals/`);

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) message = body.detail;
      else if (body?.message) message = body.message;
    } catch {
    }
    throw new Error(message);
  }

  let data: PublicProposalResponse;
  try {
    data = await res.json();
  } catch {
    throw new Error("Failed to parse server response");
  }


  return data.results ?? [];
}