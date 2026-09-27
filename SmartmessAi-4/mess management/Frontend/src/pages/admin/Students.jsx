import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Plus, Trash2, Edit3, Loader2,
  Mail, GraduationCap, RefreshCw, X, CheckCircle2, QrCode, Download, Printer
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

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
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

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [qrModalStudent, setQrModalStudent] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", registrationNumber: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/admin/students");
      if (data.success) setStudents(data.students || []);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email, and password are required"); return;
    }
    try {
      setSubmitting(true);
      const data = await apiFetch("/admin/students", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (data.success) {
        const emailMsg = data.emailSent
          ? "Student added & welcome email sent!"
          : data.emailMessage
            ? `Student added! ${data.emailMessage}`
            : "Student added! (Email pending)";
        toast.success(emailMsg);
        setShowAddModal(false);
        setForm({ name: "", email: "", registrationNumber: "", password: "" });
        fetchStudents();
      } else {
        toast.error(data.message || "Failed to add student");
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
      const data = await apiFetch(`/admin/students/${editStudent._id}`, {
        method: "PUT",
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      if (data.success) {
        toast.success("Student updated!");
        setEditStudent(null);
        fetchStudents();
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
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      const data = await apiFetch(`/admin/students/${id}`, { method: "DELETE" });
      if (data.success) {
        toast.success("Student deleted");
        fetchStudents();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const openEdit = (student) => {
    setEditStudent(student);
    setForm({ name: student.name, email: student.email, password: "" });
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-600" /> Manage Students
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {students.length} students registered
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStudents}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={() => { setShowAddModal(true); setForm({ name: "", email: "", registrationNumber: "", password: "" }); }}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:shadow-xl transition-all"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 shadow-sm mb-5 max-w-sm">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
        />
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-left text-slate-500">
                <th className="px-5 py-4 font-semibold">Name</th>
                <th className="px-5 py-4 font-semibold">Email</th>
                <th className="px-5 py-4 font-semibold">Reg. No.</th>
                <th className="px-5 py-4 font-semibold">Email Status</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No students found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((student, i) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {student.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 opacity-60" />
                        {student.email}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs font-mono">
                      {student.registrationNumber || student.registration_number || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {student.emailSent || student.email_sent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" /> Sent
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {new Date(student.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setQrModalStudent(student)}
                          title="View & Print Student QR Code"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100 transition-all"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(student)}
                          title="Edit Student"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id, student.name)}
                          title="Delete Student"
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={showAddModal} title="Add New Student" onClose={() => setShowAddModal(false)}>
        <form onSubmit={handleAdd} className="space-y-4">
          {[
            { key: "name", label: "Full Name", type: "text", placeholder: "e.g. Rahul Kumar", required: true },
            { key: "email", label: "Email Address", type: "email", placeholder: "e.g. rahul@gmail.com", required: true },
            { key: "registrationNumber", label: "Registration Number", type: "text", placeholder: "e.g. RA2111003010001" },
            { key: "password", label: "Password", type: "password", placeholder: "Set login password", required: true },
          ].map(({ key, label, type, placeholder, required }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                {label} {required && <span className="text-rose-400">*</span>}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-60 transition-all hover:scale-[1.02]"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Add Student
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editStudent} title="Edit Student" onClose={() => setEditStudent(null)}>
        <form onSubmit={handleEdit} className="space-y-4">
          {["name", "email"].map((field) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 capitalize">
                {field}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
          </button>
        </form>
      </Modal>

      {/* Real QR Code Viewer Modal */}
      <Modal open={!!qrModalStudent} title="Student QR Pass (Real Scannable)" onClose={() => setQrModalStudent(null)}>
        {qrModalStudent && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-inner flex flex-col items-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  btoa(`${qrModalStudent._id || qrModalStudent.id}_lunch_${Date.now()}`)
                )}`}
                alt="Student Real QR Code"
                className="w-48 h-48 rounded-xl shadow-md bg-white p-2"
              />
              <p className="mt-3 text-xs font-mono font-semibold text-emerald-800">
                Token: {btoa(`${qrModalStudent._id || qrModalStudent.id}_lunch_${Date.now()}`).slice(0, 16)}...
              </p>
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-base">{qrModalStudent.name}</h4>
              <p className="text-xs text-slate-500">{qrModalStudent.email}</p>
              <p className="text-xs font-mono text-emerald-600">
                Reg No: {qrModalStudent.registrationNumber || qrModalStudent.registration_number || "SRM2026-REG"}
              </p>
            </div>

            <div className="flex gap-2 w-full pt-2">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
                  btoa(`${qrModalStudent._id || qrModalStudent.id}_lunch_${Date.now()}`)
                )}`}
                target="_blank"
                rel="noreferrer"
                download={`${qrModalStudent.name}_QR_Pass.png`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Download QR
              </a>
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold hover:shadow-md transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Print Pass
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
