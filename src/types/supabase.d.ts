declare module '@supabase/supabase-js' {
  export interface SignInWithPasswordCredentials {
    email: string;
    password: string;
  }
  export interface AuthResponse {
    error: { message: string } | null;
  }
  export interface AuthApi {
    signInWithPassword(credentials: SignInWithPasswordCredentials): Promise<AuthResponse>;
  }
  export interface SupabaseClient {
    auth: AuthApi;
  }
  export function createClient(url: string, key: string, options?: unknown): SupabaseClient;
}
