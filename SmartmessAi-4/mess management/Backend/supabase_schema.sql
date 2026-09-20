-- SmartMess AI — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ============================================================================
-- 1. STUDENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  registration_number TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'staff', 'admin')),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  email_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent column additions for existing students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS registration_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'pending';

-- ============================================================================
-- 2. ADMINS
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT DEFAULT '',
  profile_image TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. STAFF
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  employee_id TEXT NOT NULL UNIQUE,
  department TEXT DEFAULT 'kitchen' CHECK (department IN ('kitchen', 'housekeeping', 'reception', 'store', 'security', 'other')),
  shift TEXT DEFAULT 'morning' CHECK (shift IN ('morning', 'afternoon', 'evening', 'night')),
  phone TEXT DEFAULT '',
  profile_image TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'staff',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. ATTENDANCE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent')),
  qr_token TEXT DEFAULT '',
  verified_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  location TEXT DEFAULT 'Mess Hall',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, date, meal_type)
);
CREATE INDEX IF NOT EXISTS idx_attendance_date_meal ON attendance(date, meal_type);

-- ============================================================================
-- 5. COMPLAINTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT DEFAULT '',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('food_quality', 'hygiene', 'service', 'facilities', 'staff_behavior', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  response TEXT DEFAULT '',
  resolved_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);

-- ============================================================================
-- 6. FEEDBACK
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT DEFAULT '',
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  date TIMESTAMPTZ DEFAULT NOW(),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  meal_items TEXT DEFAULT '',
  sentiment TEXT DEFAULT 'Neutral' CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feedback_date ON feedback(date DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_student ON feedback(student_id);

-- ============================================================================
-- 7. FOOD WASTE
-- ============================================================================
CREATE TABLE IF NOT EXISTS food_waste (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  total_prepared_kg NUMERIC NOT NULL CHECK (total_prepared_kg >= 0),
  waste_kg NUMERIC NOT NULL CHECK (waste_kg >= 0),
  waste_percentage NUMERIC DEFAULT 0,
  cost_saved_inr NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  recorded_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, meal_type)
);

-- ============================================================================
-- 8. KITCHEN STATUS
-- ============================================================================
CREATE TABLE IF NOT EXISTS kitchen_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL UNIQUE,
  temperature TEXT DEFAULT '24°C',
  gas_status TEXT DEFAULT 'Normal' CHECK (gas_status IN ('Normal', 'Low', 'Critical', 'Off')),
  water_status TEXT DEFAULT 'Available' CHECK (water_status IN ('Available', 'Low', 'Unavailable')),
  cooking_status TEXT DEFAULT 'Pending' CHECK (cooking_status IN ('Completed', 'In Progress', 'Pending', 'Not Started')),
  preparing_meal TEXT DEFAULT '',
  cleaning_status TEXT DEFAULT 'Pending' CHECK (cleaning_status IN ('Completed', 'In Progress', 'Pending')),
  notes TEXT DEFAULT '',
  updated_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. LEAVE REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT DEFAULT '',
  from_date TIMESTAMPTZ NOT NULL,
  to_date TIMESTAMPTZ NOT NULL,
  reason TEXT NOT NULL,
  meals_to_skip TEXT[] DEFAULT ARRAY['breakfast', 'lunch', 'dinner'],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leave_student ON leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);

-- ============================================================================
-- 10. MESS MENUS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mess_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL,
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  meals JSONB DEFAULT '{}',
  special_note TEXT DEFAULT '',
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menus_date ON mess_menus(date);

-- ============================================================================
-- 11. NOTIFICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert', 'success')),
  target_role TEXT DEFAULT 'all' CHECK (target_role IN ('student', 'staff', 'admin', 'all')),
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_role_active ON notifications(target_role, is_active);

-- ============================================================================
-- 12. NOTIFICATION READS (join table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (notification_id, user_id)
);

-- ============================================================================
-- DISABLE ROW LEVEL SECURITY (Server uses service role key)
-- ============================================================================
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_waste DISABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE mess_menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'students', 'admins', 'staff', 'attendance', 'complaints',
    'feedback', 'food_waste', 'kitchen_status', 'leave_requests',
    'mess_menus', 'notifications'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END;
$$;
