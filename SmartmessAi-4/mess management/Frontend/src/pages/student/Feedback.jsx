import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquareText, Loader2, Send, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import feedbackService from "../../services/feedbackService";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

function StarRating({ rating, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
        >
          <Star
            size={28}
            className={`transition-colors ${
              star <= (hovered || rating)
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const ratingLabels = { 1: "Poor", 2: "Fair", 3: "Okay", 4: "Good", 5: "Excellent!" };

export default function Feedback() {
  const [mealType, setMealType] = useState("lunch");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await feedbackService.getMyFeedback();
        if (data.success) setMyFeedbacks(data.feedbacks || []);
      } catch (err) {
        console.error("Feedback history error:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [submitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await feedbackService.submitFeedback({ mealType, rating, comment });
      if (data.success) {
        toast.success("Feedback submitted! Thank you 🙏");
        setRating(0);
        setComment("");
        setSubmitted((prev) => !prev);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const sentimentColor = (s) => {
    if (s === "Positive") return "text-emerald-600 bg-emerald-50";
    if (s === "Negative") return "text-red-500 bg-red-50";
    return "text-slate-500 bg-slate-100";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meal Feedback</h1>
          <p className="mt-1 text-sm text-slate-400">Rate your meals and help improve the mess quality</p>
        </div>

        {/* Submit Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-slate-800 mb-5">Submit Feedback</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Meal type */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Meal
              </label>
              <div className="flex gap-2">
                {MEAL_TYPES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMealType(m)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-all duration-200 ${
                      mealType === m
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-500 hover:border-emerald-200"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Rating
              </label>
              <div className="flex items-center gap-4">
                <StarRating rating={rating} onChange={setRating} disabled={submitting} />
                {rating > 0 && (
                  <span className="text-sm font-medium text-amber-600">
                    {ratingLabels[rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Comments <span className="normal-case font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you loved or what could be improved..."
                rows={3}
                maxLength={500}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all disabled:opacity-60"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{comment.length}/500</p>
            </div>

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow-lg shadow-emerald-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Feedback</>
              )}
            </button>
          </form>
        </motion.div>

        {/* History */}
        <div>
          <h2 className="text-base font-semibold text-slate-800 mb-4">My Feedback History</h2>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : myFeedbacks.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200">
              <MessageSquareText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400 text-sm">No feedback submitted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myFeedbacks.map((fb, i) => (
                <motion.div
                  key={fb._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold capitalize text-slate-600 border border-slate-200 rounded-full px-2 py-0.5">
                          {fb.mealType}
                        </span>
                        <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${sentimentColor(fb.sentiment)}`}>
                          {fb.sentiment}
                        </span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1,2,3,4,5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={s <= fb.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}
                          />
                        ))}
                      </div>
                      {fb.comment && (
                        <p className="text-sm text-slate-600 leading-relaxed">{fb.comment}</p>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 shrink-0">
                      {new Date(fb.createdAt || fb.date).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}