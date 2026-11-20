export type UserRole = "admin" | "manager" | "employee";
export type TaskStatus = "assigned" | "in_progress" | "submitted" | "approved" | "rejected";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  manager_id: string | null;
  is_active: boolean;
  created_at: string;
  manager?: Profile | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assigned_to: string;
  created_by: string;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  assignee?: Profile | null;
  creator?: Profile | null;
  reports?: TaskReport[];
}

export interface TaskReport {
  id: string;
  task_id: string;
  employee_id: string;
  report_text: string;
  attachment_url: string | null;
  submitted_at: string;
  review_status: ReviewStatus;
  review_comment: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer?: Profile | null;
  employee?: Profile | null;
}
