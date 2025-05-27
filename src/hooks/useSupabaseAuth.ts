
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
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('staff_members')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .single();

      if (error || !data) {
        return false;
      }

      setCurrentUser(data);
      localStorage.setItem('currentStaffUser', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Ошибка входа:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentStaffUser');
  };

  const hasInstructorPermissions = (user: StaffMember | null) => {
    return user?.role === 'instructor' || user?.role === 'admin';
  };

  const hasAdminPermissions = (user: StaffMember | null) => {
    return user?.role === 'admin';
  };

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
