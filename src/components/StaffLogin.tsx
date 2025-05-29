
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from '@/hooks/use-toast';
import { Lock, User, ArrowLeft } from 'lucide-react';

interface StaffLoginProps {
  onLoginSuccess: () => void;
  onBack?: () => void;
}

export const StaffLogin = ({
  onLoginSuccess,
  onBack
}: StaffLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useSupabaseAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 Начало обработки формы входа');
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🔄 Вызов функции login...');
      const success = await login(username.trim(), password);
      console.log('📊 Результат login:', success);
      
      if (success) {
        console.log('✅ Успешный вход, показываем toast...');
        toast({
          title: "Вход выполнен успешно!",
          description: "Добро пожаловать в систему"
        });
        
        console.log('🎯 Вызов onLoginSuccess...');
        onLoginSuccess();
      } else {
        console.log('❌ Неудачный вход');
        toast({
          title: "Ошибка входа",
          description: "Неверный логин или пароль",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Ошибка при входе:', error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при входе",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
                  disabled={isLoading}
                  autoComplete="username"
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
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
