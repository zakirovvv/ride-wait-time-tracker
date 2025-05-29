import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSupabaseQueue } from '@/hooks/useSupabaseQueue';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Trash2, Search, Clock, Ticket } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TicketManagerProps {
  onClose: () => void;
}

export const TicketManager = ({ onClose }: TicketManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { queue, removeFromQueue, isLoading } = useSupabaseQueue();
  const { currentUser } = useSupabaseAuth();

  const filteredQueue = queue.filter(entry => 
    entry.bracelet_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveTicket = async (braceletCode: string) => {
    try {
      console.log('🗑️ Попытка удалить билет:', braceletCode);
      console.log('📋 Текущая очередь:', queue);
      console.log('👤 Текущий пользователь:', currentUser);
      
      // Проверяем, существует ли билет в очереди
      const existingTicket = queue.find(entry => entry.bracelet_code === braceletCode);
      console.log('🎫 Найденный билет:', existingTicket);
      
      if (!existingTicket) {
        console.error('❌ Билет не найден в локальной очереди:', braceletCode);
        toast({
          title: "Ошибка",
          description: `Билет с кодом ${braceletCode} не найден в очереди`,
          variant: "destructive"
        });
        return;
      }

      // Передаем ID пользователя вместо имени
      await removeFromQueue(braceletCode, currentUser?.id);
      
      console.log('✅ Билет успешно удален:', braceletCode);
      toast({
        title: "Билет удален",
        description: `Браслет ${braceletCode} успешно удален из очереди`,
      });
    } catch (error) {
      console.error('❌ Ошибка при удалении билета:', error);
      toast({
        title: "Ошибка",
        description: `Не удалось удалить билет: ${error.message || 'Неизвестная ошибка'}`,
        variant: "destructive"
      });
    }
  };

  const getAttractionName = (attractionId: string) => {
    const attraction = attractions.find(a => a.id === attractionId);
    return attraction ? attraction.name : attractionId;
  };

  const getAttractionIcon = (attractionId: string) => {
    const attraction = attractions.find(a => a.id === attractionId);
    return attraction ? attraction.icon : '🎢';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-400 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-400 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            🎫 Управление билетами
          </h1>
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            Назад к продаже
          </Button>
        </div>

        {/* Search and Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Поиск билетов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Введите код браслета или имя клиента..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Ticket className="w-5 h-5 mr-2 text-blue-600" />
                Статистика
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Всего билетов:</span>
                <Badge variant="secondary">{queue.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Найдено:</span>
                <Badge variant="outline">{filteredQueue.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets Table */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Все активные билеты</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredQueue.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-lg">
                  {queue.length === 0 ? 'Нет активных билетов' : 'Билеты не найдены'}
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Аттракцион</TableHead>
                    <TableHead>Код браслета</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead>Позиция</TableHead>
                    <TableHead>Время добавления</TableHead>
                    <TableHead>Расчетное время</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQueue
                    .sort((a, b) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime())
                    .map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-lg mr-2">
                            {getAttractionIcon(entry.attraction_id)}
                          </span>
                          <span className="font-medium">
                            {getAttractionName(entry.attraction_id)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {entry.bracelet_code}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.customer_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">#{entry.position}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTime(entry.created_at || '')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {formatTime(entry.estimated_time)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleRemoveTicket(entry.bracelet_code)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
