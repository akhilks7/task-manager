"use client";

import React, { useState } from "react";
import { Profile, UserRole } from "@/types/database";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { formatDate } from "@/lib/utils";
import {
  UserPlus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UserManagementClientProps {
  initialUsers: Profile[];
  currentUserId: string;
}

export function UserManagementClient({
  initialUsers,
  currentUserId,
}: UserManagementClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Form states
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("employee");
  const [formManagerId, setFormManagerId] = useState<string>("");
  const [formIsActive, setFormIsActive] = useState(true);

  // Available managers (active managers)
  const managers = users.filter(
    (u) => u.role === "manager" && u.is_active && u.id !== selectedUser?.id
  );

  const resetForm = () => {
    setFormFullName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("employee");
    setFormManagerId("");
    setFormIsActive(true);
    setActionError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditModal = (user: Profile) => {
    setSelectedUser(user);
    setFormFullName(user.full_name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormManagerId(user.manager_id || "");
    setFormIsActive(user.is_active);
    setActionError(null);
    setIsEditOpen(true);
  };

  const openDeleteModal = (user: Profile) => {
    setSelectedUser(user);
    setActionError(null);
    setIsDeleteOpen(true);
  };

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formFullName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          manager_id: formRole === "employee" && formManagerId ? formManagerId : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setIsCreateOpen(false);
      setSuccessMessage("User created successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();

      // Refresh list
      const updatedList = await fetch("/api/admin/users").then((r) => r.json());
      if (updatedList.users) setUsers(updatedList.users);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setActionError(null);

    try {
      const payload: Record<string, any> = {
        id: selectedUser.id,
        full_name: formFullName,
        role: formRole,
        manager_id: formRole === "employee" && formManagerId ? formManagerId : null,
        is_active: formIsActive,
      };

      if (formPassword.trim().length >= 6) {
        payload.password = formPassword.trim();
      }

      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      setIsEditOpen(false);
      setSuccessMessage("User updated successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();

      const updatedList = await fetch("/api/admin/users").then((r) => r.json());
      if (updatedList.users) setUsers(updatedList.users);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      setIsDeleteOpen(false);
      setSuccessMessage("User deleted successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
      router.refresh();

      setUsers(users.filter((u) => u.id !== selectedUser.id));
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Provision staff, assign managers, and manage permissions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center">
          <Check className="w-4 h-4 mr-2 text-emerald-600" />
          {successMessage}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="manager">Managers</option>
            <option value="employee">Employees</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Assigned Manager</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {user.full_name}
                      </div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "employee" ? (
                        user.manager ? (
                          <span className="text-slate-800 font-medium">
                            {user.manager.full_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        title="Edit User"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <UserPlus className="w-5 h-5 mr-2 text-indigo-600" />
                Create New User
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@company.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setFormRole(r);
                    if (r !== "employee") setFormManagerId("");
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formRole === "employee" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Assign to Manager
                  </label>
                  <select
                    value={formManagerId}
                    onChange={(e) => setFormManagerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- No Manager Assigned --</option>
                    {managers.map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.full_name} ({mgr.email})
                      </option>
                    ))}
                  </select>
                  {managers.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      No active managers exist yet. Create a manager first to assign.
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <Pencil className="w-5 h-5 mr-2 text-indigo-600" />
                Edit User
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {actionError}
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={formEmail}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Reset Password (leave empty to keep current)
                </label>
                <input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => {
                    const r = e.target.value as UserRole;
                    setFormRole(r);
                    if (r !== "employee") setFormManagerId("");
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {formRole === "employee" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Assigned Manager
                  </label>
                  <select
                    value={formManagerId}
                    onChange={(e) => setFormManagerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- No Manager Assigned --</option>
                    {managers.map((mgr) => (
                      <option key={mgr.id} value={mgr.id}>
                        {mgr.full_name} ({mgr.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Account Active (Uncheck to deactivate)</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-slate-900">
                  Delete User Account
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-slate-800">{selectedUser.full_name}</strong> (
                  {selectedUser.email})? This action will cascade delete associated
                  tasks and reports.
                </p>
              </div>
            </div>

            {actionError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {actionError}
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium disabled:opacity-60"
              >
                {loading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
