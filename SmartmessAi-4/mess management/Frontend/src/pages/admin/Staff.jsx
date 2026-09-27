import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCog, Search, Plus, Trash2, Edit3, Loader2,
  Mail, BadgeCheck, Building2, RefreshCw, X, CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token") || "";
}

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    ...options,
  });
  return res.json();
}

const DEPARTMENTS = ["kitchen", "reception", "housekeeping", "store", "management"];
const SHIFTS = ["morning", "afternoon", "evening", "night"];

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

const departmentColors = {
  kitchen: "bg-orange-100 text-orange-700",
  reception: "bg-blue-100 text-blue-700",
  housekeeping: "bg-purple-100 text-purple-700",
  store: "bg-amber-100 text-amber-700",
  management: "bg-emerald-100 text-emerald-700",
};

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", employeeId: "",
    department: "kitchen", shift: "morning", phone: "",
  });

  useEffect(() => { fetchStaff(); }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/staff");
      if (data.success) setStaffList(data.staff || []);
    } catch (err) {
      toast.error("Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setForm({
    name: "", email: "", password: "", employeeId: "",
    department: "kitchen", shift: "morning", phone: "",
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.employeeId) {
      toast.error("Name, email, password and employee ID are required"); return;
    }
    try {
      setSubmitting(true);
      const data = await apiFetch("/admin/staff", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (data.success) {
        toast.success("Staff member added!");
        setShowAddModal(false);
        resetForm();
        fetchStaff();
      } else {
        toast.error(data.message || "Failed to add staff");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { name, email, department, shift, phone } = form;
      const data = await apiFetch(`/admin/staff/${editStaff._id}`, {
        method: "PUT",
        body: JSON.stringify({ name, email, department, shift, phone }),
      });
      if (data.success) {
        toast.success("Staff updated!");
        setEditStaff(null);
        fetchStaff();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from staff? This cannot be undone.`)) return;
    try {
      const data = await apiFetch(`/admin/staff/${id}`, { method: "DELETE" });
      if (data.success) {
        toast.success("Staff member removed");
        fetchStaff();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const openEdit = (staff) => {
    setEditStaff(staff);
    setForm({
      name: staff.name, email: staff.email, password: "",
      employeeId: staff.employeeId, department: staff.department || "kitchen",
      shift: staff.shift || "morning", phone: staff.phone || "",
    });
  };

  const filtered = staffList.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  const FormFields = ({ isEdit = false }) => (
    <div className="space-y-3">
      {[
        { id: "name", label: "Full Name", type: "text" },
        { id: "email", label: "Email", type: "email" },
        ...(!isEdit ? [{ id: "password", label: "Password", type: "password" }, { id: "employeeId", label: "Employee ID", type: "text" }] : []),
        { id: "phone", label: "Phone (optional)", type: "text" },
      ].map(({ id, label, type }) => (
        <div key={id}>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
          <input
            type={type}
            value={form[id] || ""}
            onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
        </div>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Department</label>
          <select
            value={form.department}
            onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 capitalize"
          >
            {DEPARTMENTS.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Shift</label>
          <select
            value={form.shift}
            onChange={(e) => setForm((p) => ({ ...p, shift: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 capitalize"
          >
            {SHIFTS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCog className="w-6 h-6 text-emerald-600" /> Manage Staff
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{staffList.length} staff members</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStaff} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => { setShowAddModal(true); resetForm(); }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 shadow-sm mb-5 max-w-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or ID..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-4 font-semibold">Name</th>
                <th className="px-5 py-4 font-semibold">Employee ID</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Shift</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-slate-400">
                  <UserCog className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No staff found</p>
                </td></tr>
              ) : filtered.map((staff, i) => (
                <motion.tr
                  key={staff._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {staff.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{staff.name}</p>
                        <p className="text-xs text-slate-400">{staff.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600">{staff.employeeId}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${departmentColors[staff.department] || "bg-slate-100 text-slate-600"}`}>
                      {staff.department}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 capitalize">{staff.shift}</td>
                  <td className="px-5 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${staff.isActive !== false ? "text-emerald-600" : "text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive !== false ? "bg-emerald-500" : "bg-slate-300"}`} />
                      {staff.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(staff)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(staff._id, staff.name)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showAddModal} title="Add New Staff Member" onClose={() => setShowAddModal(false)}>
        <form onSubmit={handleAdd} className="space-y-4">
          <FormFields />
          <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-60">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Add Staff Member
          </button>
        </form>
      </Modal>

      <Modal open={!!editStaff} title="Edit Staff Member" onClose={() => setEditStaff(null)}>
        <form onSubmit={handleEdit} className="space-y-4">
          <FormFields isEdit />
          <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-60">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
