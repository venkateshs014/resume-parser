export type ResumeStatus = "pending" | "processing" | "completed" | "failed";

export type ParsedResume = {
  full_name?: string;
  name?: string | null;
  email: string | null;
  phone?: string | null;
  location?: string | null;
  summary?: string | null;
  skills: string[];
  experience: unknown[];
  education: unknown[];
  projects?: unknown[];
};

export type ResumeUploadResponse = {
  id: string;
  status: ResumeStatus;
};

export type ResumeRead = {
  id: string;
  filename?: string;
  original_filename?: string;
  status: ResumeStatus;
  parsed_data: ParsedResume | null;
  error_message: string | null;
  created_at?: string;
  updated_at?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  return parseJsonResponse<ResumeUploadResponse>(response);
}

export async function getResume(id: string): Promise<ResumeRead> {
  const response = await fetch(`${API_BASE_URL}/resume/${id}`, {
    cache: "no-store",
  });

  return parseJsonResponse<ResumeRead>(response);
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}
