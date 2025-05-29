
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type StaffMember = Database['public']['Tables']['staff_members']['Row'];

export const useSupabaseAuth = () => {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненного пользователя при загрузке
    const savedUser = localStorage.getItem('currentStaffUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('🔄 Восстановлен пользователь из localStorage:', parsedUser);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error('❌ Ошибка парсинга сохраненного пользователя:', error);
        localStorage.removeItem('currentStaffUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Начало процесса входа для пользователя:', username);
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .single();

      console.log('📡 Ответ от базы данных:', { data, error });

      if (error) {
        console.error('❌ Ошибка запроса к базе данных:', error);
        setIsLoading(false);
        return false;
      }

      if (!data) {
        console.log('❌ Пользователь не найден');
        setIsLoading(false);
        return false;
      }

      console.log('✅ Пользователь найден:', data);
      
      // Сохраняем в localStorage
      localStorage.setItem('currentStaffUser', JSON.stringify(data));
      console.log('💾 Данные сохранены в localStorage');
      
      // Обновляем состояние синхронно
      setCurrentUser(data);
      console.log('🔄 Состояние currentUser обновлено:', data);
      
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
    localStorage.removeItem('currentStaffUser');
  };

  const hasInstructorPermissions = (user: StaffMember | null) => {
    return user?.role === 'instructor' || user?.role === 'admin';
  };

  const hasAdminPermissions = (user: StaffMember | null) => {
    return user?.role === 'admin';
  };

  console.log('🏠 useSupabaseAuth состояние:', { 
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
