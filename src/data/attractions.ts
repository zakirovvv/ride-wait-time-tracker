
import { Attraction } from '@/types';

export const attractions: Attraction[] = [
  {
    id: 'jump-rope',
    name: 'Прыжки с веревкой',
    duration: 10,
    capacity: 8,
    isActive: true,
    description: 'Экстремальные прыжки с веревкой с захватывающими видами',
    icon: '🪂'
  },
  {
    id: 'swing-two',
    name: 'Парные качели',
    duration: 8,
    capacity: 16,
    isActive: true,
    description: 'Романтические качели для двоих над ущельем',
    icon: '🎢'
  },
  {
    id: 'rope-park',
    name: 'Веревочный парк',
    duration: 15,
    capacity: 12,
    isActive: true,
    description: 'Приключенческий парк с препятствиями на деревьях',
    icon: '🌲'
  },
  {
    id: 'swing-single',
    name: 'Качели',
    duration: 6,
    capacity: 10,
    isActive: true,
    description: 'Одиночные качели с видом на природу',
    icon: '🎠'
  },
  {
    id: 'climbing',
    name: 'Скалодром',
    duration: 12,
    capacity: 6,
    isActive: true,
    description: 'Стена для скалолазания разной сложности',
    icon: '🧗'
  },
  {
    id: 'mini-trolley',
    name: 'Мини-троллей',
    duration: 5,
    capacity: 8,
    isActive: true,
    description: 'Короткий троллей для начинающих',
    icon: '🚁'
  },
  {
    id: 'trolley',
    name: 'Троллей',
    duration: 8,
    capacity: 12,
    isActive: true,
    description: 'Полноценный спуск на тросе через ущелье',
    icon: '🚠'
  },
  {
    id: 'cave-descent',
    name: 'Спуск в грот',
    duration: 20,
    capacity: 6,
    isActive: true,
    description: 'Спуск на веревках в пещеру',
    icon: '🕳️'
  },
  {
    id: 'big-bridge',
    name: 'Большой мост',
    duration: 10,
    capacity: 15,
    isActive: true,
    description: 'Подвесной мост через большое ущелье',
    icon: '🌉'
  },
  {
    id: 'small-bridge',
    name: 'Малый мост',
    duration: 5,
    capacity: 20,
    isActive: true,
    description: 'Короткий подвесной мост для всех возрастов',
    icon: '🚶'
  },
  {
    id: 'helicopter',
    name: 'Вертолет',
    duration: 15,
    capacity: 4,
    isActive: true,
    description: 'Полет на вертолете над парком',
    icon: '🚁'
  }
];
