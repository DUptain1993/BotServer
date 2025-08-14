-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bots table
CREATE TABLE IF NOT EXISTS public.bots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  bot_token TEXT NOT NULL,
  status TEXT DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'deploying', 'error')),
  file_path TEXT NOT NULL,
  requirements_path TEXT,
  container_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deployments table
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'building', 'running', 'failed', 'stopped')),
  logs TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Create bot_logs table
CREATE TABLE IF NOT EXISTS public.bot_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
  level TEXT DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warning', 'error')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bot_metrics table
CREATE TABLE IF NOT EXISTS public.bot_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE NOT NULL,
  cpu_usage DECIMAL(5,2),
  memory_usage DECIMAL(10,2),
  messages_processed INTEGER DEFAULT 0,
  uptime_seconds INTEGER DEFAULT 0,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own bots" ON public.bots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bots" ON public.bots
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own deployments" ON public.deployments
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.bots WHERE id = bot_id));

CREATE POLICY "Users can manage own deployments" ON public.deployments
  FOR ALL USING (auth.uid() = (SELECT user_id FROM public.bots WHERE id = bot_id));

CREATE POLICY "Users can view own bot logs" ON public.bot_logs
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.bots WHERE id = bot_id));

CREATE POLICY "Users can view own bot metrics" ON public.bot_metrics
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.bots WHERE id = bot_id));
