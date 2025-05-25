
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStaffStore } from '@/stores/staffStore';
import { toast } from '@/hooks/use-toast';
import { Lock, User, ArrowLeft } from 'lucide-react';

interface StaffLoginProps {
  onLoginSuccess: () => void;
  onBack?: () => void;
}

export const StaffLogin = ({ onLoginSuccess, onBack }: StaffLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useStaffStore(state => state.login);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(username, password)) {
      toast({
        title: "Вход выполнен успешно!",
        description: "Добро пожаловать в систему"
      });
      onLoginSuccess();
    } else {
      toast({
        title: "Ошибка входа",
        description: "Неверный логин или пароль",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex items-center justify-center p-6">
      {onBack && (
        <Button
          onClick={onBack}
          variant="outline"
          className="fixed top-4 left-4 z-50 bg-white/90 hover:bg-white text-gray-800 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
      )}
      
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-800 flex items-center justify-center">
            <Lock className="w-6 h-6 mr-2 text-blue-600" />
            Вход для персонала
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Логин</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите логин"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Пароль</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Войти
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 font-semibold mb-2">Тестовые аккаунты:</p>
            <div className="space-y-1 text-xs text-gray-500">
              <div>Админ: <span className="font-mono">admin / 123</span></div>
              <div>Кассир: <span className="font-mono">cashier / 123</span></div>
              <div>Инструктор: <span className="font-mono">instructor1 / 123</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
