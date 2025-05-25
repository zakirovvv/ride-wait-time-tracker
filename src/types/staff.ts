
export interface StaffMember {
  id: string;
  username: string;
  password: string;
  role: 'cashier' | 'instructor' | 'admin';
  attractionId?: string; // только для инструкторов
  name: string;
}

export interface AuthState {
  currentUser: StaffMember | null;
  isAuthenticated: boolean;
}
