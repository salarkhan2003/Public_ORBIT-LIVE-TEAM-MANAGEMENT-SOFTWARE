-- Add custom_roles column to users table to support multiple role tags
-- This allows team members to have multiple roles like Founder, CEO, CTO, etc.

-- Add custom_roles column as a text array
ALTER TABLE users
ADD COLUMN IF NOT EXISTS custom_roles TEXT[] DEFAULT '{}';

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_custom_roles ON users USING GIN (custom_roles);

-- Add a comment to document the column
COMMENT ON COLUMN users.custom_roles IS 'Array of custom role tags assigned to the user (e.g., Founder, CEO, Team Lead, etc.)';

-- Update RLS policies to allow users to update their own custom_roles
-- and allow group members to update other members' custom_roles
CREATE POLICY "Users can update custom_roles for group members"
ON users
FOR UPDATE
USING (
  -- User can update their own roles
  auth.uid() = id
  OR
  -- Or user is in the same group as the target user
  EXISTS (
    SELECT 1 FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
    AND gm2.user_id = users.id
  )
)
WITH CHECK (
  -- Same conditions for the check
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
    AND gm2.user_id = users.id
  )
);

-- Grant necessary permissions
GRANT SELECT, UPDATE (custom_roles) ON users TO authenticated;

-- Add some sample roles for testing (optional - can be removed)
-- UPDATE users SET custom_roles = ARRAY['Developer', 'Team Lead'] WHERE email = 'test@example.com';

