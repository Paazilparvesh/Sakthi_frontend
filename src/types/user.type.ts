export type UserRole = "inward" | "programer" | "qa" | "accountent";

export type RoleType = "inward" | "programer" | "qa" | "admin" | "accounts";

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


export interface UserItem {
  id: number;
  username: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
}


export interface UserForm {
  username: string;
  email: string;
  password?: string;
  role?: string[];
  isAdmin?: boolean;
}