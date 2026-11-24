export type Lang = "en" | "bn";
export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  /** Answer was grounded in the official admission dataset */
  sourced?: boolean;
  /** Answer touches fees/eligibility: show "confirm with Admission Office" note */
  confirm?: boolean;
  error?: boolean;
  /** AI was busy: answer was built directly from the dataset */
  fallback?: boolean;
  /** Topic keys (see TOPICS in lib/admission-data.ts) the answer was built from */
  sources?: string[];
  rating?: "up" | "down";
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface Program {
  id: string;
  name: string;
  name_bn: string;
  level: string;
  keywords: string[];
}

export interface ProgramFee {
  total_credits: number;
  tuition_per_credit: number;
  total_fee_hsc: number;
  total_fee_diploma: number | null;
}

export interface ProgramEligibility {
  min_ssc_gpa: number | null;
  min_hsc_gpa: number | null;
  published_text: string | null;
  category?: string | null;
  note?: string;
}
