-- ==============================================================================
-- 0001_init.sql: Task & Report Management System Database Schema & Policies
-- ==============================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
CREATE TYPE task_status AS ENUM ('assigned', 'in_progress', 'submitted', 'approved', 'rejected');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- 2. TABLES

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'employee',
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Constraint: only employees can have a manager_id
ALTER TABLE public.profiles
ADD CONSTRAINT check_manager_role CHECK (
    (role = 'employee') OR (manager_id IS NULL)
);

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    due_date DATE,
    status task_status NOT NULL DEFAULT 'assigned',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- TASK REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.task_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    report_text TEXT NOT NULL,
    attachment_url TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    review_status review_status NOT NULL DEFAULT 'pending',
    review_comment TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON public.profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_reports_task_id ON public.task_reports(task_id);
CREATE INDEX IF NOT EXISTS idx_task_reports_employee_id ON public.task_reports(employee_id);

-- 4. SECURITY DEFINER HELPER FUNCTIONS (Prevents recursion on profiles)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role user_role;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    RETURN v_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role user_role;
    v_active boolean;
BEGIN
    SELECT role, is_active INTO v_role, v_active
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN (v_role = 'admin' AND v_active = true);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role user_role;
    v_active boolean;
BEGIN
    SELECT role, is_active INTO v_role, v_active
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN (v_role = 'manager' AND v_active = true);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_manager_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_mid uuid;
BEGIN
    SELECT manager_id INTO v_mid FROM public.profiles WHERE id = auth.uid();
    RETURN v_mid;
END;
$$;

-- 5. TRIGGER: AUTO-CREATE PROFILE ON AUTH.USERS INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role user_role := 'employee';
    v_full_name TEXT;
    v_manager_id UUID := NULL;
    v_raw_role TEXT;
BEGIN
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    v_raw_role := new.raw_user_meta_data->>'role';

    IF v_raw_role IN ('admin', 'manager', 'employee') THEN
        v_role := v_raw_role::user_role;
    END IF;

    IF v_role = 'employee' AND (new.raw_user_meta_data->>'manager_id') IS NOT NULL AND (new.raw_user_meta_data->>'manager_id') <> '' THEN
        v_manager_id := (new.raw_user_meta_data->>'manager_id')::UUID;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, role, manager_id, is_active)
    VALUES (new.id, v_full_name, new.email, v_role, v_manager_id, true)
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        manager_id = EXCLUDED.manager_id,
        email = EXCLUDED.email;

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ROW-LEVEL SECURITY (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reports ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- SELECT: self OR admin OR my employees (if manager) OR my manager (if employee)
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    id = auth.uid()
    OR public.is_admin()
    OR manager_id = auth.uid()
    OR id = public.get_my_manager_id()
);

-- INSERT: Admin only (or trigger creates)
CREATE POLICY "profiles_insert_policy"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin()
);

-- UPDATE: Admin full update OR self name update
CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    public.is_admin() OR id = auth.uid()
)
WITH CHECK (
    public.is_admin() OR (
        id = auth.uid()
        -- Ensure non-admins cannot change role or manager_id
        AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
        AND (manager_id IS NOT DISTINCT FROM (SELECT p.manager_id FROM public.profiles p WHERE p.id = auth.uid()))
    )
);

-- DELETE: Admin only
CREATE POLICY "profiles_delete_policy"
ON public.profiles
FOR DELETE
TO authenticated
USING (
    public.is_admin()
);

-- TASKS POLICIES
-- SELECT: admin OR creator (manager) OR assignee (employee)
CREATE POLICY "tasks_select_policy"
ON public.tasks
FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR created_by = auth.uid()
    OR assigned_to = auth.uid()
);

-- INSERT: Manager only; must assign to own employee
CREATE POLICY "tasks_insert_policy"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_manager()
    AND created_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = assigned_to
          AND manager_id = auth.uid()
          AND role = 'employee'
          AND is_active = true
    )
);

-- UPDATE: Admin OR Creator (manager) OR Assignee (employee status change)
CREATE POLICY "tasks_update_policy"
ON public.tasks
FOR UPDATE
TO authenticated
USING (
    public.is_admin()
    OR created_by = auth.uid()
    OR assigned_to = auth.uid()
)
WITH CHECK (
    public.is_admin()
    OR created_by = auth.uid()
    OR (
        assigned_to = auth.uid()
        AND status IN ('in_progress', 'submitted')
    )
);

-- DELETE: Admin OR Creator
CREATE POLICY "tasks_delete_policy"
ON public.tasks
FOR DELETE
TO authenticated
USING (
    public.is_admin()
    OR created_by = auth.uid()
);

-- TASK REPORTS POLICIES
-- SELECT: Admin OR assigned employee OR task creator (manager)
CREATE POLICY "task_reports_select_policy"
ON public.task_reports
FOR SELECT
TO authenticated
USING (
    public.is_admin()
    OR employee_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = task_reports.task_id
          AND tasks.created_by = auth.uid()
    )
);

-- INSERT: Only assigned employee when task is in valid state (assigned, in_progress, rejected)
CREATE POLICY "task_reports_insert_policy"
ON public.task_reports
FOR INSERT
TO authenticated
WITH CHECK (
    employee_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = task_reports.task_id
          AND tasks.assigned_to = auth.uid()
          AND tasks.status IN ('assigned', 'in_progress', 'rejected')
    )
);

-- UPDATE: Admin OR task creator (manager)
CREATE POLICY "task_reports_update_policy"
ON public.task_reports
FOR UPDATE
TO authenticated
USING (
    public.is_admin()
    OR EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = task_reports.task_id
          AND tasks.created_by = auth.uid()
    )
);

-- DELETE: Admin only
CREATE POLICY "task_reports_delete_policy"
ON public.task_reports
FOR DELETE
TO authenticated
USING (
    public.is_admin()
);

-- 7. POSTGRES RPC FUNCTIONS (Strict validation & state machine)

-- RPC: START TASK (Employee starts working on assigned task)
CREATE OR REPLACE FUNCTION public.start_task(p_task_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_task public.tasks%ROWTYPE;
BEGIN
    SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found';
    END IF;

    IF v_task.assigned_to <> auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'You are not assigned to this task';
    END IF;

    IF v_task.status <> 'assigned' THEN
        RAISE EXCEPTION 'Task is already %', v_task.status;
    END IF;

    UPDATE public.tasks
    SET status = 'in_progress',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_task_id;

    RETURN jsonb_build_object('success', true, 'status', 'in_progress');
END;
$$;

-- RPC: SUBMIT REPORT (Employee submits or resubmits report)
CREATE OR REPLACE FUNCTION public.submit_report(
    p_task_id UUID,
    p_report_text TEXT,
    p_attachment_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_task public.tasks%ROWTYPE;
    v_report_id UUID;
BEGIN
    IF trim(COALESCE(p_report_text, '')) = '' THEN
        RAISE EXCEPTION 'Report text cannot be empty';
    END IF;

    SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found';
    END IF;

    IF v_task.assigned_to <> auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Not authorized to submit report for this task';
    END IF;

    IF v_task.status NOT IN ('assigned', 'in_progress', 'rejected') THEN
        RAISE EXCEPTION 'Cannot submit report when task status is %', v_task.status;
    END IF;

    -- Insert new report entry
    INSERT INTO public.task_reports (
        task_id,
        employee_id,
        report_text,
        attachment_url,
        review_status
    )
    VALUES (
        p_task_id,
        v_task.assigned_to,
        trim(p_report_text),
        p_attachment_url,
        'pending'
    )
    RETURNING id INTO v_report_id;

    -- Transition task status to submitted
    UPDATE public.tasks
    SET status = 'submitted',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_task_id;

    RETURN v_report_id;
END;
$$;

-- RPC: REVIEW REPORT (Manager approves or rejects report)
CREATE OR REPLACE FUNCTION public.review_report(
    p_report_id UUID,
    p_decision TEXT,
    p_comment TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_report public.task_reports%ROWTYPE;
    v_task public.tasks%ROWTYPE;
    v_rev_status review_status;
    v_tsk_status task_status;
BEGIN
    IF p_decision NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION 'Decision must be approved or rejected';
    END IF;

    IF p_decision = 'rejected' AND (p_comment IS NULL OR trim(p_comment) = '') THEN
        RAISE EXCEPTION 'Feedback comment is required when rejecting a report';
    END IF;

    SELECT * INTO v_report FROM public.task_reports WHERE id = p_report_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Report not found';
    END IF;

    SELECT * INTO v_task FROM public.tasks WHERE id = v_report.task_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Task not found';
    END IF;

    IF v_task.created_by <> auth.uid() AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only the task creator or admin can review this report';
    END IF;

    v_rev_status := p_decision::review_status;
    v_tsk_status := p_decision::task_status;

    -- Update report status
    UPDATE public.task_reports
    SET review_status = v_rev_status,
        review_comment = trim(p_comment),
        reviewed_by = auth.uid(),
        reviewed_at = timezone('utc'::text, now())
    WHERE id = p_report_id;

    -- Update task status
    UPDATE public.tasks
    SET status = v_tsk_status,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_task.id;

    RETURN jsonb_build_object('success', true, 'status', v_tsk_status);
END;
$$;

-- 8. SUPABASE STORAGE: BUCKET 'reports'
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: allow authenticated users to upload and view report attachments
CREATE POLICY "Allow authenticated uploads to reports bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow authenticated reads on reports bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'reports');
