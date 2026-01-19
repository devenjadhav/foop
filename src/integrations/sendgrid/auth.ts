import { SENDGRID_CONFIG } from "./config";
import type { SendGridCredentials } from "./types";

export class SendGridAuth {
  private apiKey: string;

  constructor(credentials: SendGridCredentials) {
    this.apiKey = credentials.apiKey;
  }

  getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async validate(): Promise<boolean> {
    try {
      const response = await fetch(`${SENDGRID_CONFIG.apiBaseUrl}/user/profile`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async testConnection(): Promise<{
    valid: boolean;
    email?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${SENDGRID_CONFIG.apiBaseUrl}/user/profile`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          valid: false,
          error: errorData.errors?.[0]?.message || `HTTP ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        valid: true,
        email: data.email,
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Connection failed",
      };
    }
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  getApiKey(): string {
    return this.apiKey;
  }
}

export function validateApiKeyFormat(apiKey: string): boolean {
  // SendGrid API keys start with "SG." and are base64-encoded
  return apiKey.startsWith("SG.") && apiKey.length > 20;
}
