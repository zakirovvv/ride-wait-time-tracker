
import { useState } from 'react';
import { AttractionSelector } from '@/components/AttractionSelector';
import { VisitorDashboard } from '@/components/VisitorDashboard';
import { CashierInterface } from '@/components/CashierInterface';
import { OperatorInterface } from '@/components/OperatorInterface';

const Index = () => {
  const [activeView, setActiveView] = useState<'home' | 'visitor' | 'cashier' | 'operator'>('home');
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return (
          <AttractionSelector 
            onAttractionSelect={(attractionId) => {
              setSelectedAttraction(attractionId);
              setActiveView('visitor');
            }}
            onRoleSelect={(role) => setActiveView(role)}
          />
        );
      case 'visitor':
        return <VisitorDashboard selectedAttraction={selectedAttraction} />;
      case 'cashier':
        return <CashierInterface />;
      case 'operator':
        return <OperatorInterface />;
      default:
        return (
          <AttractionSelector 
            onAttractionSelect={(attractionId) => {
              setSelectedAttraction(attractionId);
              setActiveView('visitor');
            }}
            onRoleSelect={(role) => setActiveView(role)}
          />
        );
    }
  };

  return (
    <div className="relative">
      {activeView !== 'home' && (
        <button
          onClick={() => setActiveView('home')}
          className="fixed top-4 left-4 z-50 bg-white/90 hover:bg-white px-4 py-2 rounded-lg shadow-lg transition-all"
        >
          ← Главная
        </button>
      )}
      {renderActiveView()}
    </div>
  );
};

export default Index;
