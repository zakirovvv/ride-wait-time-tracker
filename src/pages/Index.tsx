
import { useState } from 'react';
import { VisitorDashboard } from '@/components/VisitorDashboard';
import { CashierInterface } from '@/components/CashierInterface';
import { OperatorInterface } from '@/components/OperatorInterface';
import { Navigation } from '@/components/Navigation';

const Index = () => {
  const [activeView, setActiveView] = useState<'visitor' | 'cashier' | 'operator'>('visitor');

  const renderActiveView = () => {
    switch (activeView) {
      case 'visitor':
        return <VisitorDashboard />;
      case 'cashier':
        return <CashierInterface />;
      case 'operator':
        return <OperatorInterface />;
      default:
        return <VisitorDashboard />;
    }
  };

  return (
    <div className="relative">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      {renderActiveView()}
    </div>
  );
};

export default Index;
