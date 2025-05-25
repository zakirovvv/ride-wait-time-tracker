
import { Attraction } from '@/types';

export const attractions: Attraction[] = [
  {
    id: '1',
    name: 'Американские горки "Молния"',
    duration: 5,
    capacity: 24,
    isActive: true,
    description: 'Захватывающие американские горки с петлями',
    icon: '🎢'
  },
  {
    id: '2',
    name: 'Колесо обозрения',
    duration: 15,
    capacity: 40,
    isActive: true,
    description: 'Панорамный вид на весь парк',
    icon: '🎡'
  },
  {
    id: '3',
    name: 'Карусель',
    duration: 3,
    capacity: 20,
    isActive: true,
    description: 'Классическая карусель для всей семьи',
    icon: '🎠'
  },
  {
    id: '4',
    name: 'Дом ужасов',
    duration: 10,
    capacity: 8,
    isActive: true,
    description: 'Страшное приключение не для слабонервных',
    icon: '👻'
  },
  {
    id: '5',
    name: 'Автодром',
    duration: 8,
    capacity: 16,
    isActive: true,
    description: 'Гоночные машинки с адреналином',
    icon: '🚗'
  }
];
