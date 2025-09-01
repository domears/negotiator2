declare module 'react-router-dom';

declare module '@supabase/supabase-js' {
  export type Session = unknown;
  export function createClient(url: string, key: string): unknown;
}
