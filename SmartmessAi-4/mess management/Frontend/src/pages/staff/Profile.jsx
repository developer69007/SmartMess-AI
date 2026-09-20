import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, ChefHat, Edit3, Save, X, Loader2, LogOut, BadgeCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function StaffProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/staff/profile");
      if (data.success) {
        setProfile(data.user || data.staff);
        const p = data.user || data.staff;
        setForm({ name: p?.name || "", phone: p?.phone || "" });
      }
    } catch {
      if (user) { setProfile(user); setForm({ name: user.name || "", phone: user.phone || "" }); }
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    try {
      setSaving(true);
      const { data } = await api.put("/staff/profile", form);
      if (data.success) {
        setProfile(data.staff || data.user);
        setEditing(false);
        toast.success("Profile updated!");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch { toast.error("Server error"); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    logout();
    navigate("/login/staff");
    toast.success("Logged out");
  };

  const displayName = profile?.name || user?.name || "Staff Member";
  const displayEmail = profile?.email || user?.email || "";
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const departmentColors = {
    kitchen: "bg-orange-100 text-orange-700",
    reception: "bg-blue-100 text-blue-700",
    housekeeping: "bg-purple-100 text-purple-700",
    store: "bg-amber-100 text-amber-700",
    management: "bg-emerald-100 text-emerald-700",
    security: "bg-slate-100 text-slate-700",
  };
  const dept = profile?.department || user?.department || "kitchen";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-600" /> My Profile
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your staff account</p>
        </div>

        {/* Avatar Card */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-teal-500 via-cyan-500 to-sky-500" />
          <div className="px-6 pb-6 -mt-12 flex items-end justify-between">
            <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-black text-teal-700 bg-gradient-to-br from-teal-100 to-cyan-100">
              {initials}
            </div>
            <div className="flex items-center gap-2 mt-14">
              {editing ? (
                <>
                  <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all">
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>
          </div>
          <div className="px-6 pb-4 -mt-2">
            <p className="text-xl font-bold text-slate-900">{displayName}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-slate-400">{displayEmail}</p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${departmentColors[dept] || "bg-slate-100 text-slate-600"}`}>{dept}</span>
            </div>
          </div>
        </div>

        {/* Info Fields */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Account Details</h2>
          {[
            { icon: User, label: "Full Name", key: "name", editable: true, type: "text" },
            { icon: Mail, label: "Email Address", key: "email", editable: false, type: "email" },
            { icon: Phone, label: "Phone Number", key: "phone", editable: true, type: "tel" },
            { icon: BadgeCheck, label: "Employee ID", key: "employeeId", editable: false },
            { icon: ChefHat, label: "Department", key: "department", editable: false },
          ].map(({ icon: Icon, label, key, editable, type, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                {editing && editable ? (
                  <input type={type} value={form[key] || ""} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-300" />
                ) : (
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {value || profile?.[key] || <span className="text-slate-300 italic">Not set</span>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Session</h2>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
