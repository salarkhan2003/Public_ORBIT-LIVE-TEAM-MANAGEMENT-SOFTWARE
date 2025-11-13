-- Create task_documents junction table
CREATE TABLE IF NOT EXISTS task_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attached_by UUID REFERENCES users(id),
    UNIQUE(task_id, document_id)
);

-- Create project_documents junction table
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    attached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attached_by UUID REFERENCES users(id),
    UNIQUE(project_id, document_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_documents_task_id ON task_documents(task_id);
CREATE INDEX IF NOT EXISTS idx_task_documents_document_id ON task_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_document_id ON project_documents(document_id);

-- Enable RLS
ALTER TABLE task_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_documents
CREATE POLICY "Users can view task documents from their groups"
    ON task_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            INNER JOIN group_members gm ON t.group_id = gm.group_id
            WHERE t.id = task_documents.task_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can attach documents to tasks in their groups"
    ON task_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tasks t
            INNER JOIN group_members gm ON t.group_id = gm.group_id
            WHERE t.id = task_documents.task_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can detach documents from tasks in their groups"
    ON task_documents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            INNER JOIN group_members gm ON t.group_id = gm.group_id
            WHERE t.id = task_documents.task_id
            AND gm.user_id = auth.uid()
        )
    );

-- RLS Policies for project_documents
CREATE POLICY "Users can view project documents from their groups"
    ON project_documents FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            INNER JOIN group_members gm ON p.group_id = gm.group_id
            WHERE p.id = project_documents.project_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can attach documents to projects in their groups"
    ON project_documents FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects p
            INNER JOIN group_members gm ON p.group_id = gm.group_id
            WHERE p.id = project_documents.project_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can detach documents from projects in their groups"
    ON project_documents FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects p
            INNER JOIN group_members gm ON p.group_id = gm.group_id
            WHERE p.id = project_documents.project_id
            AND gm.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON task_documents TO authenticated;
GRANT ALL ON project_documents TO authenticated;

