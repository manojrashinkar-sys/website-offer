// Provider-agnostic interface for the Advisor's AI answers.
//
// The frontend never calls a model directly — it calls this project's own API
// route, which calls whichever provider is configured. Adding another provider
// later means adding a file beside gemini.ts and switching on an env var; the
// Advisor UI does not change.

export interface AdvisorRequest {
  question: string;
  context: string;
  systemInstruction: string;
}

export type AdvisorFailure =
  | 'not_configured'
  | 'rate_limited'
  | 'quota'
  | 'timeout'
  | 'upstream_error'
  | 'empty';

export interface AdvisorResult {
  ok: boolean;
  answer?: string;
  failure?: AdvisorFailure;
}

export interface AiProvider {
  name: string;
  isConfigured(): boolean;
  generate(request: AdvisorRequest): Promise<AdvisorResult>;
}
