
-- Таблица сотрудников парка
CREATE TABLE public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier', 'instructor')),
  name TEXT NOT NULL,
  attraction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица настроек аттракционов
CREATE TABLE public.attraction_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id TEXT UNIQUE NOT NULL,
  duration INTEGER NOT NULL DEFAULT 5,
  capacity INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица записей очереди
CREATE TABLE public.queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id TEXT NOT NULL,
  bracelet_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  estimated_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  completed_by TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица счётчиков браслетов
CREATE TABLE public.bracelet_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attraction_id TEXT UNIQUE NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attraction_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bracelet_counters ENABLE ROW LEVEL SECURITY;

-- Публичные политики (система используется только внутри парка без Supabase Auth)
CREATE POLICY "Public read staff" ON public.staff_members FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON public.attraction_settings FOR SELECT USING (true);
CREATE POLICY "Public all settings" ON public.attraction_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read queue" ON public.queue_entries FOR SELECT USING (true);
CREATE POLICY "Public all queue" ON public.queue_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read counters" ON public.bracelet_counters FOR SELECT USING (true);
CREATE POLICY "Public all counters" ON public.bracelet_counters FOR ALL USING (true) WITH CHECK (true);

-- Включаем Realtime для синхронизации
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attraction_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bracelet_counters;

-- Индексы для производительности
CREATE INDEX idx_queue_attraction ON public.queue_entries(attraction_id);
CREATE INDEX idx_queue_status ON public.queue_entries(status);
CREATE INDEX idx_queue_bracelet ON public.queue_entries(bracelet_code);

-- Начальные данные: сотрудники
INSERT INTO public.staff_members (username, password_hash, role, name, attraction_id) VALUES
('admin', 'admin123', 'admin', 'Администратор', NULL),
('cashier', 'cashier123', 'cashier', 'Кассир', NULL),
('ferris', 'ferris123', 'instructor', 'Инструктор Колесо обозрения', 'ferris-wheel'),
('carousel', 'carousel123', 'instructor', 'Инструктор Карусель', 'carousel'),
('bumper', 'bumper123', 'instructor', 'Инструктор Автодром', 'bumper-cars'),
('coaster', 'coaster123', 'instructor', 'Инструктор Американские горки', 'roller-coaster'),
('train', 'train123', 'instructor', 'Инструктор Паровозик', 'train-ride'),
('swing', 'swing123', 'instructor', 'Инструктор Цепочная карусель', 'swing-ride'),
('drop', 'drop123', 'instructor', 'Инструктор Башня свободного падения', 'drop-tower'),
('boat', 'boat123', 'instructor', 'Инструктор Лодочки', 'boat-ride'),
('teacups', 'teacups123', 'instructor', 'Инструктор Чашки', 'teacups'),
('haunted', 'haunted123', 'instructor', 'Инструктор Дом с привидениями', 'haunted-house'),
('arcade', 'arcade123', 'instructor', 'Инструктор Игровые автоматы', 'arcade');

-- Начальные данные: настройки аттракционов
INSERT INTO public.attraction_settings (attraction_id, duration, capacity) VALUES
('ferris-wheel', 10, 20),
('carousel', 5, 24),
('bumper-cars', 5, 12),
('roller-coaster', 3, 20),
('train-ride', 8, 30),
('swing-ride', 4, 16),
('drop-tower', 2, 12),
('boat-ride', 6, 20),
('teacups', 4, 18),
('haunted-house', 5, 10),
('arcade', 0, 50);

-- Начальные данные: счётчики браслетов
INSERT INTO public.bracelet_counters (attraction_id, counter) VALUES
('ferris-wheel', 0),
('carousel', 0),
('bumper-cars', 0),
('roller-coaster', 0),
('train-ride', 0),
('swing-ride', 0),
('drop-tower', 0),
('boat-ride', 0),
('teacups', 0),
('haunted-house', 0),
('arcade', 0);
