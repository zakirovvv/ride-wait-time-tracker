
import { useState, useEffect } from 'react';
import { AttractionSelector } from '@/components/AttractionSelector';
import { QueueBoard } from '@/components/QueueBoard';
import { VisitorDashboard } from '@/components/VisitorDashboard';
import { CashierInterface } from '@/components/CashierInterface';
import { CashierDisplay } from '@/components/CashierDisplay';
import { PublicQueueDisplay } from '@/components/PublicQueueDisplay';
import { OperatorInterface } from '@/components/OperatorInterface';
import { InstructorInterface } from '@/components/InstructorInterface';
import { StaffLogin } from '@/components/StaffLogin';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useBroadcastSync } from '@/hooks/useBroadcastSync';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeView, setActiveView] = useState<'home' | 'queue' | 'visitor' | 'cashier' | 'cashier-display' | 'public-display' | 'operator' | 'instructor' | 'staff-login'>('home');
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);
  const {
    isAuthenticated,
    currentUser,
    logout,
    isLoading: authLoading
  } = useSupabaseAuth();

  // Инициализируем синхронизацию между устройствами
  const {
    broadcastUpdate,
    isConnected,
    requestSync
  } = useBroadcastSync();

  // Подключаем синхронизацию в реальном времени
  useRealtimeSync();

  useEffect(() => {
    // Создаем глобальные функции для синхронизации
    (window as any).broadcastQueueUpdate = (data: any) => {
      console.log('📤 Отправка обновления очереди:', data);
      broadcastUpdate('queue-update', data);
    };
    (window as any).broadcastSettingsUpdate = (data: any) => {
      console.log('📤 Отправка обновления настроек:', data);
      broadcastUpdate('settings-update', data);
    };

    // Обработчик запроса принудительной синхронизации
    const handleRequestSync = () => {
      requestSync();
    };
    window.addEventListener('request-server-sync', handleRequestSync);
    return () => {
      delete (window as any).broadcastQueueUpdate;
      delete (window as any).broadcastSettingsUpdate;
      window.removeEventListener('request-server-sync', handleRequestSync);
    };
  }, [broadcastUpdate, requestSync]);

  // Автоматическое перенаправление авторизованного пользователя
  useEffect(() => {
    console.log('🔄 Проверка автоматического перенаправления:', {
      authLoading,
      isAuthenticated,
      currentUser: currentUser?.username,
      role: currentUser?.role,
      activeView
    });

    if (!authLoading && isAuthenticated && currentUser) {
      if (activeView === 'staff-login' || activeView === 'home') {
        console.log('🎯 Выполняем автоматическое перенаправление пользователя:', currentUser);
        if (currentUser.role === 'cashier' || currentUser.role === 'admin') {
          console.log('💰 Перенаправление к кассиру');
          setActiveView('cashier');
        } else if (currentUser.role === 'instructor') {
          console.log('👨‍🏫 Перенаправление к инструктору');
          setActiveView('instructor');
        }
      }
    }
  }, [isAuthenticated, currentUser, authLoading, activeView]);

  const handleStaffLogin = () => {
    console.log('🎯 Переход к форме входа');
    setActiveView('staff-login');
  };

  const handleLoginSuccess = () => {
    console.log('🎉 handleLoginSuccess вызван, текущий пользователь:', currentUser?.username);
    // Ничего не делаем здесь - перенаправление будет автоматическим через useEffect
  };

  const handleHomeClick = () => {
    logout(); // Выходим из системы при переходе на главную
    setActiveView('home');
  };

  const handleBackToHome = () => {
    setActiveView('home');
  };

  // Показываем загрузку во время проверки аутентификации
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-green-500 to-teal-400 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  const renderActiveView = () => {
    if (activeView === 'staff-login') {
      return <StaffLogin onLoginSuccess={handleLoginSuccess} onBack={handleBackToHome} />;
    }

    switch (activeView) {
      case 'home':
        return <AttractionSelector 
          onAttractionSelect={(attractionId) => {
            setSelectedAttraction(attractionId);
            setActiveView('queue');
          }} 
          onRoleSelect={(role) => setActiveView(role)} 
        />;
      case 'queue':
        return selectedAttraction ? <QueueBoard attractionId={selectedAttraction} /> : null;
      case 'visitor':
        return <VisitorDashboard selectedAttraction={selectedAttraction} />;
      case 'public-display':
        return <PublicQueueDisplay />;
      case 'cashier':
        return isAuthenticated && (currentUser?.role === 'cashier' || currentUser?.role === 'admin') ? 
          <CashierInterface /> : 
          <div className="min-h-screen flex items-center justify-center flex-col">
            <p className="text-red-600">Доступ запрещен. Требуется роль кассира или администратора.</p>
          </div>;
      case 'cashier-display':
        return <CashierDisplay />;
      case 'instructor':
        return isAuthenticated && currentUser?.role === 'instructor' ? 
          <InstructorInterface /> : 
          <div className="min-h-screen flex items-center justify-center flex-col">
            <p className="text-red-600">Доступ запрещен. Требуется роль инструктора.</p>
          </div>;
      case 'operator':
        return isAuthenticated && currentUser?.role === 'admin' ? 
          <OperatorInterface /> : 
          <div className="min-h-screen flex items-center justify-center flex-col">
            <p className="text-red-600">Доступ запрещен. Требуется роль администратора.</p>
          </div>;
      default:
        return <AttractionSelector 
          onAttractionSelect={(attractionId) => {
            setSelectedAttraction(attractionId);
            setActiveView('queue');
          }} 
          onRoleSelect={(role) => setActiveView(role)} 
        />;
    }
  };

  return (
    <div className="relative">
      {activeView !== 'home' && activeView !== 'staff-login' && (
        <button 
          onClick={handleHomeClick} 
          className="fixed top-4 left-4 z-50 bg-white/90 hover:bg-white px-4 py-2 rounded-lg shadow-lg transition-all"
        >
          ← Главная
        </button>
      )}
      
      {activeView === 'cashier-display' && (
        <Button 
          onClick={() => setActiveView('cashier')} 
          className="fixed top-4 right-4 z-50 bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          🎫 Продажа билетов
        </Button>
      )}
      
      {/* Кнопки на главной странице */}
      {activeView === 'home' && (
        <>
          <Button 
            onClick={() => setActiveView('public-display')} 
            className="fixed top-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            📊 Информация по аттракционам
          </Button>
          
          <Button 
            onClick={handleStaffLogin} 
            className="fixed top-4 right-4 z-50 bg-gray-800 hover:bg-gray-900 text-white shadow-lg"
          >
            Вход для персонала
          </Button>
          
          {/* Обновленный индикатор сети с дополнительной информацией */}
          <div className="fixed bottom-4 left-4 z-50 space-y-2">
            {!isConnected}
          </div>
        </>
      )}
      
      {renderActiveView()}
    </div>
  );
};

export default Index;
