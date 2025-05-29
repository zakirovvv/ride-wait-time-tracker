import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { attractions } from '@/data/attractions';

type QueueEntry = Database['public']['Tables']['queue_entries']['Row'];
type QueueInsert = Database['public']['Tables']['queue_entries']['Insert'];

interface QueueSummary {
  attractionId: string;
  attractionName: string;
  queueLength: number;
  estimatedWaitTime: number;
  nextAvailableTime: Date;
}

export const useSupabaseQueue = () => {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [queueSummary, setQueueSummary] = useState<QueueSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем очередь при монтировании
  useEffect(() => {
    loadQueue();
    
    // Подписываемся на изменения в реальном времени
    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries'
        },
        () => {
          loadQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Ошибка загрузки очереди:', error);
        return;
      }

      setQueue(data || []);
      calculateQueueSummary(data || []);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateQueueSummary = async (queueData: QueueEntry[]) => {
    try {
      // Загружаем настройки аттракционов
      const { data: settings } = await supabase
        .from('attraction_settings')
        .select('*');

      const summary = attractions.map(attraction => {
        const attractionQueue = queueData.filter(q => q.attraction_id === attraction.id);
        const queueLength = attractionQueue.length;
        
        const setting = settings?.find(s => s.attraction_id === attraction.id);
        const duration = setting?.duration || attraction.duration;
        
        const estimatedWaitTime = queueLength > 0 ? (queueLength - 1) * duration : 0;
        const nextAvailableTime = new Date(Date.now() + (estimatedWaitTime * 60000));

        return {
          attractionId: attraction.id,
          attractionName: attraction.name,
          queueLength,
          estimatedWaitTime,
          nextAvailableTime
        };
      });

      setQueueSummary(summary);
    } catch (error) {
      console.error('Ошибка расчета очереди:', error);
    }
  };

  const addToQueue = async (braceletCode: string, attractionId: string) => {
    try {
      // Получаем текущую позицию в очереди
      const { data: existingQueue } = await supabase
        .from('queue_entries')
        .select('position')
        .eq('attraction_id', attractionId)
        .eq('status', 'active')
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = (existingQueue?.[0]?.position || 0) + 1;

      // Получаем настройки аттракциона
      const { data: setting } = await supabase
        .from('attraction_settings')
        .select('duration')
        .eq('attraction_id', attractionId)
        .single();

      const duration = setting?.duration || 5;
      const waitTime = nextPosition === 1 ? 0 : (nextPosition - 1) * duration;
      const estimatedTime = new Date(Date.now() + (waitTime * 60000));

      const newEntry: QueueInsert = {
        attraction_id: attractionId,
        bracelet_code: braceletCode.toUpperCase(),
        customer_name: braceletCode.toUpperCase(),
        position: nextPosition,
        estimated_time: estimatedTime.toISOString(),
        status: 'active'
      };

      const { error } = await supabase
        .from('queue_entries')
        .insert(newEntry);

      if (error) {
        console.error('Ошибка добавления в очередь:', error);
        throw error;
      }

      console.log('✅ Билет добавлен в базу:', braceletCode);
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  };

  const removeFromQueue = async (braceletCode: string, completedBy?: string) => {
    try {
      console.log('🔍 Поиск билета для удаления:', braceletCode);
      
      // Сначала проверяем, существует ли билет
      const { data: existingTickets, error: findError } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('bracelet_code', braceletCode)
        .eq('status', 'active');

      if (findError) {
        console.error('❌ Ошибка поиска билета:', findError);
        throw new Error(`Ошибка поиска билета: ${findError.message}`);
      }

      if (!existingTickets || existingTickets.length === 0) {
        console.error('❌ Билет не найден в базе данных:', braceletCode);
        throw new Error(`Билет с кодом ${braceletCode} не найден`);
      }

      console.log('✅ Билет найден в базе:', existingTickets[0]);

      // Помечаем билет как завершенный
      const { error: updateError } = await supabase
        .from('queue_entries')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: completedBy || null
        })
        .eq('bracelet_code', braceletCode)
        .eq('status', 'active');

      if (updateError) {
        console.error('❌ Ошибка завершения билета:', updateError);
        throw new Error(`Ошибка удаления билета: ${updateError.message}`);
      }

      console.log('✅ Билет завершен:', braceletCode);
    } catch (error) {
      console.error('❌ Ошибка в removeFromQueue:', error);
      throw error;
    }
  };

  const getAttractionQueue = (attractionId: string) => {
    return queue
      .filter(q => q.attraction_id === attractionId)
      .sort((a, b) => a.position - b.position);
  };

  return {
    queue,
    queueSummary,
    isLoading,
    addToQueue,
    removeFromQueue,
    getAttractionQueue,
    refreshQueue: loadQueue
  };
};
