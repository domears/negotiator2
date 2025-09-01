import { createContext, ReactNode, useContext } from 'react';

const SupabaseAuthContext = createContext(null);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  return (
    <SupabaseAuthContext.Provider value={null}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  return useContext(SupabaseAuthContext);
}
