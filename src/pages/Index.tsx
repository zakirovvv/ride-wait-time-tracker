
import { useState } from 'react';
import { AttractionSelector } from '@/components/AttractionSelector';
import { QueueBoard } from '@/components/QueueBoard';
import { VisitorDashboard } from '@/components/VisitorDashboard';
import { CashierInterface } from '@/components/CashierInterface';
import { OperatorInterface } from '@/components/OperatorInterface';
import { InstructorInterface } from '@/components/InstructorInterface';
import { StaffLogin } from '@/components/StaffLogin';
import { useStaffStore } from '@/stores/staffStore';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activeView, setActiveView] = useState<'home' | 'queue' | 'visitor' | 'cashier' | 'operator' | 'instructor' | 'staff-login'>('home');
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);
  const { isAuthenticated, currentUser } = useStaffStore();

  const handleStaffLogin = () => {
    setActiveView('staff-login');
  };

  const handleLoginSuccess = () => {
    // Перенаправляем пользователя в зависимости от его роли
    if (currentUser?.role === 'cashier' || currentUser?.role === 'admin') {
      setActiveView('cashier');
    } else if (currentUser?.role === 'instructor') {
      setActiveView('instructor');
    } else if (currentUser?.role === 'admin') {
      setActiveView('operator');
    }
  };

  const renderActiveView = () => {
    if (activeView === 'staff-login') {
      return <StaffLogin onLoginSuccess={handleLoginSuccess} />;
    }

    switch (activeView) {
      case 'home':
        return (
          <AttractionSelector 
            onAttractionSelect={(attractionId) => {
              setSelectedAttraction(attractionId);
              setActiveView('queue');
            }}
            onRoleSelect={(role) => setActiveView(role)}
          />
        );
      case 'queue':
        return selectedAttraction ? <QueueBoard attractionId={selectedAttraction} /> : null;
      case 'visitor':
        return <VisitorDashboard selectedAttraction={selectedAttraction} />;
      case 'cashier':
        return isAuthenticated && (currentUser?.role === 'cashier' || currentUser?.role === 'admin') ? 
          <CashierInterface /> : 
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-600">Доступ запрещен</p>
          </div>;
      case 'instructor':
        return isAuthenticated && currentUser?.role === 'instructor' ? 
          <InstructorInterface /> : 
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-600">Доступ запрещен</p>
          </div>;
      case 'operator':
        return isAuthenticated && currentUser?.role === 'admin' ? 
          <OperatorInterface /> : 
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-600">Доступ запрещен</p>
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
          onClick={() => setActiveView('home')}
          className="fixed top-4 left-4 z-50 bg-white/90 hover:bg-white px-4 py-2 rounded-lg shadow-lg transition-all"
        >
          ← Главная
        </button>
      )}
      
      {/* Кнопка входа для персонала */}
      {activeView === 'home' && (
        <Button
          onClick={handleStaffLogin}
          className="fixed top-4 right-4 z-50 bg-gray-800 hover:bg-gray-900 text-white shadow-lg"
        >
          Вход для персонала
        </Button>
      )}
      
      {renderActiveView()}
    </div>
  );
};

export default Index;
