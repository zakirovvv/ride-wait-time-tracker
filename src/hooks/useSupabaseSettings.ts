
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AttractionSetting = Database['public']['Tables']['attraction_settings']['Row'];

export const useSupabaseSettings = () => {
  const [settings, setSettings] = useState<AttractionSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();

    // Подписываемся на изменения настроек
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attraction_settings'
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('attraction_settings')
        .select('*');

      if (error) {
        console.error('Ошибка загрузки настроек:', error);
        return;
      }

      setSettings(data || []);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateDuration = async (attractionId: string, duration: number) => {
    try {
      const { error } = await supabase
        .from('attraction_settings')
        .update({ duration })
        .eq('attraction_id', attractionId);

      if (error) {
        console.error('Ошибка обновления длительности:', error);
        throw error;
      }

      console.log('✅ Длительность обновлена:', attractionId, duration);
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  };

  const getDuration = (attractionId: string) => {
    const setting = settings.find(s => s.attraction_id === attractionId);
    return setting?.duration || 5;
  };

  return {
    settings,
    isLoading,
    updateDuration,
    getDuration,
    refreshSettings: loadSettings
  };
};
