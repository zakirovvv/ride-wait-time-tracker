
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueueStore } from '@/stores/queueStore';
import { useStaffStore } from '@/stores/staffStore';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Ticket, Hash, Clock, LogOut, Timer } from 'lucide-react';

export const CashierInterface = () => {
  const [braceletCode, setBraceletCode] = useState('');
  const [selectedAttraction, setSelectedAttraction] = useState('');
  const addToQueue = useQueueStore(state => state.addToQueue);
  const queueSummary = useQueueStore(state => state.queueSummary);
  const { currentUser, logout } = useStaffStore();

  const handleSellTicket = () => {
    if (!braceletCode.trim() || !selectedAttraction) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    addToQueue({
      attractionId: selectedAttraction,
      braceletCode: braceletCode.trim().toUpperCase(),
      customerName: braceletCode.trim().toUpperCase() // Используем код как имя для совместимости
    });

    toast({
      title: "Билет продан!",
      description: `Браслет с кодом ${braceletCode.trim().toUpperCase()} добавлен в очередь`,
    });

    setBraceletCode('');
    setSelectedAttraction('');
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Выход выполнен",
      description: "До свидания!"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-400 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок с информацией о пользователе */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              🎫 Касса - Продажа Билетов
            </h1>
            <p className="text-lg text-white/90 drop-shadow">
              Введите код браслета и выберите аттракцион
            </p>
          </div>
          <div className="text-right">
            <div className="text-white mb-2">
              <span className="font-semibold">{currentUser?.name}</span>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выход
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма продажи билетов */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-800">
                <Ticket className="w-6 h-6 mr-2 text-blue-600" />
                Продажа билета
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="braceletCode" className="text-gray-700">
                  Код браслета
                </Label>
                <div className="relative mt-1">
                  <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="braceletCode"
                    value={braceletCode}
                    onChange={(e) => setBraceletCode(e.target.value)}
                    placeholder="Введите код браслета"
                    className="pl-10 uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="attraction" className="text-gray-700">
                  Выберите аттракцион
                </Label>
                <Select value={selectedAttraction} onValueChange={setSelectedAttraction}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Выберите аттракцион..." />
                  </SelectTrigger>
                  <SelectContent>
                    {attractions.filter(a => a.isActive).map((attraction) => {
                      const summary = queueSummary.find(s => s.attractionId === attraction.id);
                      return (
                        <SelectItem key={attraction.id} value={attraction.id}>
                          <div className="flex items-center">
                            <span className="mr-2">{attraction.icon}</span>
                            <span className="mr-2">{attraction.name}</span>
                            <span className="text-sm text-gray-500">
                              ({summary?.queueLength || 0} в очереди, {attraction.duration} мин)
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSellTicket}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
                size="lg"
              >
                Добавить в очередь
              </Button>
            </CardContent>
          </Card>

          {/* Статистика очередей с временем */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-800">
                <Clock className="w-6 h-6 mr-2 text-green-600" />
                Текущие очереди и время
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueSummary.map((summary) => {
                  const attraction = attractions.find(a => a.id === summary.attractionId);
                  if (!attraction) return null;

                  return (
                    <div key={summary.attractionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{attraction.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-800">{attraction.name}</div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Timer className="w-3 h-3 mr-1" />
                            {attraction.duration} мин на человека
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg text-blue-600">
                          {summary.queueLength} чел.
                        </div>
                        <div className="text-sm text-gray-500">
                          ~{summary.estimatedWaitTime} мин ожидания
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
