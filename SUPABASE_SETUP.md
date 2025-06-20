# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (this can take a few minutes)

## 2. Database Setup

In your Supabase SQL Editor, run the following SQL to create the necessary tables:

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin', 'official')),
    department TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE NULL
);

-- Enable Row Level Security on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert demo users (optional)
-- Note: You'll need to create these users through the Supabase Auth interface first
-- Then update their profiles here

-- Example: Insert admin user profile (replace with actual user ID from auth.users)
-- INSERT INTO public.profiles (id, name, email, phone, role, department)
-- VALUES (
--     'your-admin-user-id-from-auth-users-table',
--     'Admin User',
--     'admin@tgcivic.gov.in',
--     '9876543210',
--     'admin',
--     'IT Department'
-- );
```

## 3. Environment Configuration

1. Copy your project URL and anon key from Supabase Dashboard > Settings > API
2. Update the `.env.local` file with your credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Email Configuration (Optional)

To enable email confirmations and password resets:

1. Go to Supabase Dashboard > Authentication > Settings
2. Configure your email provider (or use Supabase's built-in email service)
3. Update email templates as needed

## 5. Security Notes

- Row Level Security (RLS) is enabled to ensure users can only access their own data
- Admins have special permissions to view all profiles
- Phone numbers are unique to prevent duplicate registrations
- All sensitive operations are server-side for security

## 6. Testing the Integration

1. Start your development server: `npm run dev`
2. Register a new account through your app
3. Check the Supabase Dashboard to see the new user in auth.users and profiles tables
4. Test login/logout functionality

## 7. Creating Admin Users

To create admin users:

1. Register normally through your app
2. Go to Supabase Dashboard > Table Editor > profiles
3. Find the user and change their role from 'citizen' to 'admin'
4. Add a department if needed

## Troubleshooting

- If registration fails, check the browser console for errors
- Ensure your environment variables are correctly set
- Verify the database schema was created successfully
- Check Supabase logs in the Dashboard for any database errors
