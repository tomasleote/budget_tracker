import { createContext } from 'react';

/**
 * AuthContext value shape (supplied by AuthProvider):
 *   user: import('firebase/auth').User | null
 *   loading: boolean
 *   login(email, password): Promise<User>
 *   register(email, password): Promise<User>
 *   logout(): Promise<void>
 *   enterDemo(): void
 *   exitDemo(): void
 */
export const AuthContext = createContext(null);
