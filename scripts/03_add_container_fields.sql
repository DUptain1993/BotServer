-- Add container management fields to bots table
ALTER TABLE bots ADD COLUMN IF NOT EXISTS container_id VARCHAR(255);
ALTER TABLE bots ADD COLUMN IF NOT EXISTS telegram_token TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS environment_vars JSONB DEFAULT '{}';

-- Add indexes for container management
CREATE INDEX IF NOT EXISTS idx_bots_container_id ON bots(container_id);

-- Update deployments table to include container info
ALTER TABLE deployments ADD COLUMN IF NOT EXISTS container_id VARCHAR(255);

-- Create container_metrics table for monitoring
CREATE TABLE IF NOT EXISTS container_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    container_id VARCHAR(255) NOT NULL,
    cpu_usage DECIMAL(5,2),
    memory_usage_mb INTEGER,
    memory_limit_mb INTEGER,
    network_rx_bytes BIGINT,
    network_tx_bytes BIGINT,
    uptime_seconds INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for metrics
CREATE INDEX IF NOT EXISTS idx_container_metrics_bot_id ON container_metrics(bot_id);
CREATE INDEX IF NOT EXISTS idx_container_metrics_recorded_at ON container_metrics(recorded_at);

-- Enable RLS for container_metrics
ALTER TABLE container_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policy for container_metrics
CREATE POLICY "Users can view their own container metrics" ON container_metrics
    FOR SELECT USING (
        bot_id IN (
            SELECT id FROM bots WHERE user_id = auth.uid()
        )
    );
