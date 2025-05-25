
import { create } from 'zustand';
import { StaffMember, AuthState } from '@/types/staff';

// Создаем список персонала с новыми учетными данными
const createStaffMembers = (): StaffMember[] => {
  const staff: StaffMember[] = [];
  
  // Админ (остается прежним)
  staff.push({
    id: 'admin-1',
    username: 'admin',
    password: '123',
    role: 'admin',
    name: 'Администратор'
  });
  
  // Кассир с новыми данными
  staff.push({
    id: 'cashier-1',
    username: 'cashier',
    password: 'cashier6809',
    role: 'cashier',
    name: 'Кассир'
  });
  
  // Инструкторы с привязкой к конкретным аттракционам
  const instructors = [
    { attractionId: 'jump-rope', username: 'jumprow', password: 'jumprow6809', name: 'Инструктор - Прыжок с веревкой' },
    { attractionId: 'swing-two', username: 'twoswing', password: 'twoswing6809', name: 'Инструктор - Парные качели' },
    { attractionId: 'rope-park', username: 'rope', password: 'rope6809', name: 'Инструктор - Веревочный парк' },
    { attractionId: 'swing', username: 'swing', password: 'swing6809', name: 'Инструктор - Качели' },
    { attractionId: 'climbing', username: 'climbing', password: 'climbing6809', name: 'Инструктор - Скалодром' },
    { attractionId: 'mini-trolley', username: 'minitrolley', password: 'minitrolley6809', name: 'Инструктор - Мини-троллей' },
    { attractionId: 'trolley', username: 'trolley', password: 'trolley6809', name: 'Инструктор - Троллей' },
    { attractionId: 'cave-descent', username: 'grot', password: 'grot6809', name: 'Инструктор - Спуск в пещеру' },
    { attractionId: 'big-bridge', username: 'bigmost', password: 'bigmost6809', name: 'Инструктор - Большой мост' },
    { attractionId: 'small-bridge', username: 'smallmost', password: 'smallmost6809', name: 'Инструктор - Малый мост' },
    { attractionId: 'helicopter', username: 'helicopter', password: 'helicopter6809', name: 'Инструктор - Вертолет' }
  ];
  
  instructors.forEach((instructor, index) => {
    staff.push({
      id: `instructor-${instructor.attractionId}`,
      username: instructor.username,
      password: instructor.password,
      role: 'instructor',
      attractionId: instructor.attractionId,
      name: instructor.name
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
