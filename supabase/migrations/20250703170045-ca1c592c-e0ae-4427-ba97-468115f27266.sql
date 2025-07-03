
-- Update the user's role to admin (replace with actual user ID from auth.users table)
-- This assumes you are the first user in the system
UPDATE profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);

-- If you know your specific user ID, replace the WHERE clause with:
-- WHERE id = 'your-user-id-here'

-- Verify the update worked
SELECT id, email, full_name, role FROM profiles WHERE role = 'admin';
