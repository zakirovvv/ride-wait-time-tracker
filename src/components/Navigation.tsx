
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, CreditCard, Settings } from 'lucide-react';

interface NavigationProps {
  activeView: 'visitor' | 'cashier' | 'operator';
  onViewChange: (view: 'visitor' | 'cashier' | 'operator') => void;
}

export const Navigation = ({ activeView, onViewChange }: NavigationProps) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <Button
        onClick={() => onViewChange('visitor')}
        variant={activeView === 'visitor' ? 'default' : 'secondary'}
        className={`shadow-lg ${activeView === 'visitor' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white/90 hover:bg-white'}`}
      >
        <Eye className="w-4 h-4 mr-2" />
        Посетители
      </Button>
      
      <Button
        onClick={() => onViewChange('cashier')}
        variant={activeView === 'cashier' ? 'default' : 'secondary'}
        className={`shadow-lg ${activeView === 'cashier' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/90 hover:bg-white'}`}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        Касса
      </Button>
      
      <Button
        onClick={() => onViewChange('operator')}
        variant={activeView === 'operator' ? 'default' : 'secondary'}
        className={`shadow-lg ${activeView === 'operator' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-white/90 hover:bg-white'}`}
      >
        <Settings className="w-4 h-4 mr-2" />
        Оператор
      </Button>
    </div>
  );
};
