-- Create monitoring tables for bot performance tracking and logging

-- Bot metrics table for real-time performance data
CREATE TABLE IF NOT EXISTS bot_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cpu_usage DECIMAL(5,2) DEFAULT 0,
    memory_usage DECIMAL(10,2) DEFAULT 0,
    network_in BIGINT DEFAULT 0,
    network_out BIGINT DEFAULT 0,
    uptime_seconds INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bot logs table for storing container logs and events
CREATE TABLE IF NOT EXISTS bot_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    level VARCHAR(20) DEFAULT 'info', -- info, warn, error, debug
    message TEXT NOT NULL,
    source VARCHAR(50) DEFAULT 'container', -- container, system, telegram
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance snapshots for historical tracking
CREATE TABLE IF NOT EXISTS performance_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL, -- Contains metrics, status, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert configurations for monitoring thresholds
CREATE TABLE IF NOT EXISTS alert_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL, -- cpu_high, memory_high, error_rate, downtime
    threshold_value DECIMAL(10,2) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    notification_method VARCHAR(20) DEFAULT 'email', -- email, webhook
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health checks for overall platform monitoring
CREATE TABLE IF NOT EXISTS system_health (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL, -- docker, database, storage, etc.
    status VARCHAR(20) DEFAULT 'healthy', -- healthy, degraded, down
    response_time_ms INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bot_metrics_bot_id_created_at ON bot_metrics(bot_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_logs_bot_id_created_at ON bot_logs(bot_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_logs_level ON bot_logs(level);
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_bot_id ON performance_snapshots(bot_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_configs_bot_id ON alert_configs(bot_id);
CREATE INDEX IF NOT EXISTS idx_system_health_service_created_at ON system_health(service_name, created_at DESC);

-- Row Level Security policies
ALTER TABLE bot_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

-- Users can only access their own bot monitoring data
CREATE POLICY "Users can view their own bot metrics" ON bot_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bot metrics" ON bot_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own bot logs" ON bot_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bot logs" ON bot_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own performance snapshots" ON performance_snapshots
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance snapshots" ON performance_snapshots
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alert configs" ON alert_configs
    FOR ALL USING (auth.uid() = user_id);

-- System health is viewable by all authenticated users
CREATE POLICY "Authenticated users can view system health" ON system_health
    FOR SELECT USING (auth.role() = 'authenticated');

-- Service accounts can insert system health data
CREATE POLICY "Service accounts can insert system health" ON system_health
    FOR INSERT WITH CHECK (true);
