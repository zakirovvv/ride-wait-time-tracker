
import { create } from 'zustand';
import { StaffMember, AuthState } from '@/types/staff';
import { attractions } from '@/data/attractions';

// Создаем список персонала
const createStaffMembers = (): StaffMember[] => {
  const staff: StaffMember[] = [];
  
  // Админ
  staff.push({
    id: 'admin-1',
    username: 'admin',
    password: '123',
    role: 'admin',
    name: 'Администратор'
  });
  
  // Кассир
  staff.push({
    id: 'cashier-1',
    username: 'cashier',
    password: '123',
    role: 'cashier',
    name: 'Кассир'
  });
  
  // Инструкторы для каждого аттракциона
  attractions.forEach((attraction, index) => {
    staff.push({
      id: `instructor-${attraction.id}`,
      username: `instructor${attraction.id}`,
      password: '123',
      role: 'instructor',
      attractionId: attraction.id,
      name: `Инструктор - ${attraction.name}`
    });
  });
  
  return staff;
};

interface StaffStore extends AuthState {
  staffMembers: StaffMember[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  getStaffByRole: (role: string) => StaffMember[];
  hasInstructorPermissions: (user: StaffMember | null) => boolean;
  hasAdminPermissions: (user: StaffMember | null) => boolean;
}

export const useStaffStore = create<StaffStore>((set, get) => ({
  staffMembers: createStaffMembers(),
  currentUser: null,
  isAuthenticated: false,
  
  login: (username: string, password: string) => {
    const staff = get().staffMembers.find(
      s => s.username === username && s.password === password
    );
    
    if (staff) {
      set({
        currentUser: staff,
        isAuthenticated: true
      });
      return true;
    }
    return false;
  },
  
  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false
    });
  },
  
  getStaffByRole: (role: string) => {
    return get().staffMembers.filter(s => s.role === role);
  },

  hasInstructorPermissions: (user: StaffMember | null) => {
    return user?.role === 'instructor' || user?.role === 'admin';
  },

  hasAdminPermissions: (user: StaffMember | null) => {
    return user?.role === 'admin';
  }
}));
