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
import { useStaffStore } from '@/stores/staffStore';
import { useBroadcastSync } from '@/hooks/useBroadcastSync';
import { Button } from '@/components/ui/button';
import { NetworkManager } from '@/components/NetworkManager';

const Index = () => {
  const [activeView, setActiveView] = useState<'home' | 'queue' | 'visitor' | 'cashier' | 'cashier-display' | 'public-display' | 'operator' | 'instructor' | 'staff-login'>('home');
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);
  const { isAuthenticated, currentUser, logout } = useStaffStore();
  
  // Инициализируем синхронизацию между устройствами
  useBroadcastSync();

  const handleStaffLogin = () => {
    setActiveView('staff-login');
  };

  const handleLoginSuccess = () => {
    // Перенаправляем пользователя в зависимости от его роли
    if (currentUser?.role === 'cashier') {
      setActiveView('cashier');
    } else if (currentUser?.role === 'instructor') {
      setActiveView('instructor');
    } else if (currentUser?.role === 'admin') {
      setActiveView('cashier'); // Админ может работать как кассир
    }
  };

  const handleHomeClick = () => {
    logout(); // Выходим из системы при переходе на главную
    setActiveView('home');
  };

  const handleBackToHome = () => {
    setActiveView('home');
  };

  const renderActiveView = () => {
    if (activeView === 'staff-login') {
      return <StaffLogin onLoginSuccess={handleLoginSuccess} onBack={handleBackToHome} />;
    }

    switch (activeView) {
      case 'home':
        return (
          <div className="space-y-6">
            <AttractionSelector 
              onAttractionSelect={(attractionId) => {
                setSelectedAttraction(attractionId);
                setActiveView('queue');
              }}
              onRoleSelect={(role) => setActiveView(role)}
            />
            
            {/* Добавляем NetworkManager на главную страницу */}
            <div className="max-w-md mx-auto">
              <NetworkManager />
            </div>
          </div>
        );
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
        return (
          <AttractionSelector 
            onAttractionSelect={(attractionId) => {
              setSelectedAttraction(attractionId);
              setActiveView('queue');
            }}
            onRoleSelect={(role) => setActiveView(role)}
          />
        );
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
          
          {/* Индикатор статуса синхронизации */}
          <div className="fixed bottom-4 left-4 z-50 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
            🟢 Синхронизация активна
          </div>
        </>
      )}
      
      {renderActiveView()}
    </div>
  );
};

export default Index;
