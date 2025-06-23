
import { useState, useEffect } from 'react';

export interface LocalStaffMember {
  id: string;
  username: string;
  password_hash: string;
  role: 'admin' | 'cashier' | 'instructor';
  name: string;
  attraction_id?: string;
}

const STAFF_DATA: LocalStaffMember[] = [
  {
    id: 'admin-1',
    username: 'admin',
    password_hash: '123',
    role: 'admin',
    name: 'Администратор'
  },
  {
    id: 'cashier-1',
    username: 'cashier',
    password_hash: 'cashier6809',
    role: 'cashier',
    name: 'Кассир'
  },
  {
    id: 'instructor-jump-rope',
    username: 'jumprow',
    password_hash: 'jumprow6809',
    role: 'instructor',
    name: 'Инструктор - Прыжок с веревкой',
    attraction_id: 'jump-rope'
  },
  {
    id: 'instructor-swing-two',
    username: 'twoswing',
    password_hash: 'twoswing6809',
    role: 'instructor',
    name: 'Инструктор - Парные качели',
    attraction_id: 'swing-two'
  },
  {
    id: 'instructor-rope-park',
    username: 'rope',
    password_hash: 'rope6809',
    role: 'instructor',
    name: 'Инструктор - Веревочный парк',
    attraction_id: 'rope-park'
  },
  {
    id: 'instructor-swing-single',
    username: 'swing',
    password_hash: 'swing6809',
    role: 'instructor',
    name: 'Инструктор - Качели',
    attraction_id: 'swing-single'
  },
  {
    id: 'instructor-climbing',
    username: 'climbing',
    password_hash: 'climbing6809',
    role: 'instructor',
    name: 'Инструктор - Скалодром',
    attraction_id: 'climbing'
  },
  {
    id: 'instructor-mini-trolley',
    username: 'minitrolley',
    password_hash: 'minitrolley6809',
    role: 'instructor',
    name: 'Инструктор - Мини-троллей',
    attraction_id: 'mini-trolley'
  },
  {
    id: 'instructor-trolley',
    username: 'trolley',
    password_hash: 'trolley6809',
    role: 'instructor',
    name: 'Инструктор - Троллей',
    attraction_id: 'trolley'
  },
  {
    id: 'instructor-cave-descent',
    username: 'grot',
    password_hash: 'grot6809',
    role: 'instructor',
    name: 'Инструктор - Спуск в пещеру',
    attraction_id: 'cave-descent'
  },
  {
    id: 'instructor-big-bridge',
    username: 'bigmost',
    password_hash: 'bigmost6809',
    role: 'instructor',
    name: 'Инструктор - Большой мост',
    attraction_id: 'big-bridge'
  },
  {
    id: 'instructor-small-bridge',
    username: 'smallmost',
    password_hash: 'smallmost6809',
    role: 'instructor',
    name: 'Инструктор - Малый мост',
    attraction_id: 'small-bridge'
  },
  {
    id: 'instructor-helicopter',
    username: 'helicopter',
    password_hash: 'helicopter6809',
    role: 'instructor',
    name: 'Инструктор - Вертолет',
    attraction_id: 'helicopter'
  }
];

export const useLocalAuth = () => {
  const [currentUser, setCurrentUser] = useState<LocalStaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненного пользователя при загрузке
    const savedUser = localStorage.getItem('currentLocalUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('🔄 Восстановлен пользователь из localStorage:', parsedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('❌ Ошибка парсинга сохраненного пользователя:', error);
        localStorage.removeItem('currentLocalUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Начало процесса входа для пользователя:', username);
      setIsLoading(true);
      
      const staff = STAFF_DATA.find(
        s => s.username === username && s.password_hash === password
      );

      if (!staff) {
        console.log('❌ Пользователь не найден');
        setIsLoading(false);
        return false;
      }

      console.log('✅ Пользователь найден:', staff);
      
      // Сохраняем в localStorage
      localStorage.setItem('currentLocalUser', JSON.stringify(staff));
      console.log('💾 Данные сохранены в localStorage');
      
      // Обновляем состояние
      setCurrentUser(staff);
      console.log('🔄 Состояние currentUser обновлено:', staff);
      
      setIsLoading(false);
      console.log('✅ Процесс входа завершен успешно');
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 Выход из системы');
    setCurrentUser(null);
    localStorage.removeItem('currentLocalUser');
  };

  const hasInstructorPermissions = (user: LocalStaffMember | null) => {
    return user?.role === 'instructor' || user?.role === 'admin';
  };

  const hasAdminPermissions = (user: LocalStaffMember | null) => {
    return user?.role === 'admin';
  };

  console.log('🏠 useLocalAuth состояние:', { 
    currentUser: currentUser?.username, 
    role: currentUser?.role,
    isAuthenticated: !!currentUser,
    isLoading 
  });

  return {
    currentUser,
    isLoading,
    login,
    logout,
    hasInstructorPermissions,
    hasAdminPermissions,
    isAuthenticated: !!currentUser
  };
};
