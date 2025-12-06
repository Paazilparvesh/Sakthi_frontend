export type UserRole = 'inward' | 'programer' | 'qa' | 'accountent';

export interface User {
  username: string;
  roles: UserRole[]; // multiple roles
  isAdmin: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
}
