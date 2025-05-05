-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'employee',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies table
CREATE TABLE IF NOT EXISTS policies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  content TEXT,
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users
);

-- Enable RLS on policies
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Policies for policies table
DROP POLICY IF EXISTS "Everyone can view active policies" ON policies;
DROP POLICY IF EXISTS "Admins can view all policies" ON policies;
DROP POLICY IF EXISTS "Admins can insert policies" ON policies;
DROP POLICY IF EXISTS "Admins can update policies" ON policies;
DROP POLICY IF EXISTS "Admins can delete policies" ON policies;

-- New policies for policies table
CREATE POLICY "Users can view active policies"
  ON policies FOR SELECT
  USING (
    status = 'Active' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all policies"
  ON policies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage policies"
  ON policies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy_assignments table (for assigning policies to users/departments)
CREATE TABLE IF NOT EXISTS policy_assignments (
  id SERIAL PRIMARY KEY,
  policy_id INTEGER REFERENCES policies NOT NULL,
  assigned_to TEXT NOT NULL, -- Can be department name or 'All Employees'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on policy_assignments
ALTER TABLE policy_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for policy_assignments
CREATE POLICY "Everyone can view policy assignments"
  ON policy_assignments FOR SELECT
  TO authenticated;

CREATE POLICY "Admins can manage policy assignments"
  ON policy_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create compliance_requirements table
CREATE TABLE IF NOT EXISTS compliance_requirements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users
);

-- Enable RLS on compliance_requirements
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;

-- Policies for compliance_requirements
DROP POLICY IF EXISTS "Everyone can view compliance requirements" ON compliance_requirements;
DROP POLICY IF EXISTS "Admins can manage compliance requirements" ON compliance_requirements;

-- New policies for compliance_requirements
CREATE POLICY "Users can view active compliance requirements"
  ON compliance_requirements FOR SELECT
  USING (
    status = 'Active' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all compliance requirements"
  ON compliance_requirements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage compliance requirements"
  ON compliance_requirements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create compliance_assignments table
CREATE TABLE IF NOT EXISTS compliance_assignments (
  id SERIAL PRIMARY KEY,
  requirement_id INTEGER REFERENCES compliance_requirements NOT NULL,
  assigned_to TEXT NOT NULL, -- Can be department name or 'All Employees'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on compliance_assignments
ALTER TABLE compliance_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for compliance_assignments
CREATE POLICY "Everyone can view compliance assignments"
  ON compliance_assignments FOR SELECT
  TO authenticated;

CREATE POLICY "Admins can manage compliance assignments"
  ON compliance_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create whistleblowing_reports table
CREATE TABLE IF NOT EXISTS whistleblowing_reports (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  submitted_by UUID REFERENCES auth.users
);

-- Enable RLS on whistleblowing_reports
ALTER TABLE whistleblowing_reports ENABLE ROW LEVEL SECURITY;

-- Policies for whistleblowing_reports
CREATE POLICY "Anyone can create whistleblowing reports"
  ON whistleblowing_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own non-anonymous reports"
  ON whistleblowing_reports FOR SELECT
  USING (
    auth.uid() = submitted_by AND NOT is_anonymous
  );

CREATE POLICY "Admins can view all whistleblowing reports"
  ON whistleblowing_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update whistleblowing reports"
  ON whistleblowing_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete whistleblowing reports"
  ON whistleblowing_reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create whistleblowing_notes table
CREATE TABLE IF NOT EXISTS whistleblowing_notes (
  id SERIAL PRIMARY KEY,
  report_id INTEGER REFERENCES whistleblowing_reports NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users
);

-- Enable RLS on whistleblowing_notes
ALTER TABLE whistleblowing_notes ENABLE ROW LEVEL SECURITY;

-- Policies for whistleblowing_notes
CREATE POLICY "Admins can view and manage whistleblowing notes"
  ON whistleblowing_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create company table
CREATE TABLE IF NOT EXISTS company (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on company
ALTER TABLE company ENABLE ROW LEVEL SECURITY;

-- Policies for company
CREATE POLICY "Everyone can view company info"
  ON company FOR SELECT
  TO authenticated;

CREATE POLICY "Admins can update company info"
  ON company FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create audit_trail table
CREATE TABLE IF NOT EXISTS audit_trail (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on audit_trail
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Policies for audit_trail
CREATE POLICY "Admins can view audit trail"
  ON audit_trail FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert audit records"
  ON audit_trail FOR INSERT
  WITH CHECK (true);

-- Create a trigger function to create user profiles after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'employee'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
