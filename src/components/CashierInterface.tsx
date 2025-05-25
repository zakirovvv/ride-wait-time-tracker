
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueueStore } from '@/stores/queueStore';
import { attractions } from '@/data/attractions';
import { toast } from '@/hooks/use-toast';
import { Ticket, User, Clock } from 'lucide-react';

export const CashierInterface = () => {
  const [customerName, setCustomerName] = useState('');
  const [selectedAttraction, setSelectedAttraction] = useState('');
  const addToQueue = useQueueStore(state => state.addToQueue);
  const queueSummary = useQueueStore(state => state.getQueueSummary());

  const generateBraceletCode = () => {
    return `BR${Date.now().toString(36).toUpperCase().slice(-6)}`;
  };

  const handleSellTicket = () => {
    if (!customerName.trim() || !selectedAttraction) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    const braceletCode = generateBraceletCode();
    
    addToQueue({
      attractionId: selectedAttraction,
      braceletCode,
      customerName: customerName.trim()
    });

    toast({
      title: "Билет продан!",
      description: `Браслет ${braceletCode} выдан посетителю ${customerName}`,
    });

    // Очищаем форму
    setCustomerName('');
    setSelectedAttraction('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-400 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            🎫 Касса - Продажа Билетов
          </h1>
          <p className="text-lg text-white/90 drop-shadow">
            Продавайте билеты и выдавайте браслеты посетителям
          </p>
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
                <Label htmlFor="customerName" className="text-gray-700">
                  Имя посетителя
                </Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Введите имя посетителя"
                    className="pl-10"
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
                              ({summary?.queueLength || 0} в очереди)
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
                Продать билет и выдать браслет
              </Button>
            </CardContent>
          </Card>

          {/* Статистика очередей */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl text-gray-800">
                <Clock className="w-6 h-6 mr-2 text-green-600" />
                Текущие очереди
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
                          <div className="text-sm text-gray-500">
                            {attraction.duration} мин на человека
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg text-blue-600">
                          {summary.queueLength} чел.
                        </div>
                        <div className="text-sm text-gray-500">
                          ~{summary.estimatedWaitTime} мин
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
