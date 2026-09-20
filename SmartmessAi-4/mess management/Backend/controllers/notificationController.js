// controllers/notificationController.js
// Notifications using Supabase and notification_reads join table.

const supabase = require("../config/supabaseClient");
const Notification = require("../models/Notification");

const formatNotification = (n, isRead = false) => {
  if (!n) return null;
  return {
    ...n,
    _id: n.id,
    targetRole: n.target_role || n.targetRole,
    createdBy: n.created_by || n.createdBy,
    expiresAt: n.expires_at || n.expiresAt,
    isActive: n.is_active !== undefined ? n.is_active : n.isActive,
    isRead,
    createdAt: n.created_at || n.createdAt,
    updatedAt: n.updated_at || n.updatedAt,
  };
};

// ---------------------------------------------------------------------------
// GET /api/notifications — Get notifications for logged-in user's role
// ---------------------------------------------------------------------------
const getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id || req.user._id;
    const now = new Date().toISOString();

    const { data: notifications, error } = await supabase
      .from(Notification.TABLE_NAME)
      .select("*")
      .eq("is_active", true)
      .in("target_role", [userRole, "all"])
      .or(`expires_at.is.null,expires_at.gte.${now}`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    const notifList = notifications || [];
    const notifIds = notifList.map((n) => n.id);

    let readSet = new Set();
    if (notifIds.length > 0) {
      const { data: reads } = await supabase
        .from(Notification.READS_TABLE)
        .select("notification_id")
        .eq("user_id", userId)
        .in("notification_id", notifIds);

      if (reads) {
        readSet = new Set(reads.map((r) => r.notification_id));
      }
    }

    const notificationsWithReadStatus = notifList.map((notif) =>
      formatNotification(notif, readSet.has(notif.id))
    );

    const unreadCount = notificationsWithReadStatus.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: notificationsWithReadStatus.length,
      notifications: notificationsWithReadStatus,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// POST /api/notifications — Create a notification (Admin only)
// ---------------------------------------------------------------------------
const createNotification = async (req, res) => {
  try {
    const { title, message, type, targetRole, expiresAt } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const { data: notification, error } = await supabase
      .from(Notification.TABLE_NAME)
      .insert({
        title: title.trim(),
        message: message.trim(),
        type: type || "info",
        target_role: targetRole || "all",
        created_by: req.user ? (req.user.id || req.user._id) : null,
        expires_at: expiresAt || null,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification: formatNotification(notification, false),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/notifications/:id/read — Mark notification as read
// ---------------------------------------------------------------------------
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const notificationId = req.params.id;

    // Upsert into notification_reads
    const { error } = await supabase
      .from(Notification.READS_TABLE)
      .upsert(
        { notification_id: notificationId, user_id: userId },
        { onConflict: "notification_id, user_id" }
      );

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/notifications/read-all — Mark all notifications as read
// ---------------------------------------------------------------------------
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userRole = req.user.role;

    const { data: notifications } = await supabase
      .from(Notification.TABLE_NAME)
      .select("id")
      .eq("is_active", true)
      .in("target_role", [userRole, "all"]);

    if (notifications && notifications.length > 0) {
      const records = notifications.map((n) => ({
        notification_id: n.id,
        user_id: userId,
      }));

      await supabase
        .from(Notification.READS_TABLE)
        .upsert(records, { onConflict: "notification_id, user_id" });
    }

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------------------------------
// DELETE /api/notifications/:id — Delete notification (Admin only)
// ---------------------------------------------------------------------------
const deleteNotification = async (req, res) => {
  try {
    const { data: notification, error } = await supabase
      .from(Notification.TABLE_NAME)
      .delete()
      .eq("id", req.params.id)
      .select("id")
      .maybeSingle();

    if (error || !notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
