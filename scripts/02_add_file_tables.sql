-- Adding bot_files table for file storage metadata
CREATE TABLE IF NOT EXISTS bot_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('bot', 'requirements')),
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    blob_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bot_files_bot_id ON bot_files(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_files_uploaded_by ON bot_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_bot_files_file_type ON bot_files(file_type);

-- Enable RLS
ALTER TABLE bot_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for bot_files
CREATE POLICY "Users can manage their own bot files" ON bot_files
    FOR ALL USING (uploaded_by = auth.uid());

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bot_files_updated_at 
    BEFORE UPDATE ON bot_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
