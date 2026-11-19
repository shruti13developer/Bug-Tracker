
import { useEffect, useState } from "react";
import {
  MessageCircle,
  Send,
  Reply,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";

import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../services/commentService";

import { getCurrentUser } from "../services/authService";

function PulseDiscussions({ ticketId }) {
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadComments = async () => {
    try {
      const result = await getComments(ticketId);
      setComments(result.comments || []);
    } catch (error) {
      setError(error.message || "Unable to load discussions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const result = await getCurrentUser();
        setUser(result.user);
      } catch (error) {
        setError("Unable to verify your account.");
      }

      await loadComments();
    };

    initialize();
  }, [ticketId]);

  const isOwner = (comment) => {
    const authorId =
      comment.author?._id || comment.author;

    return authorId?.toString() === user?._id?.toString();
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    setSending(true);
    setError("");

    try {
      await createComment({
        ticket: ticketId,
        content: content.trim(),
      });

      setContent("");
      await loadComments();
    } catch (error) {
      setError(error.message || "Unable to add comment.");
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e, parentCommentId) => {
    e.preventDefault();

    if (!replyContent.trim()) return;

    setSending(true);
    setError("");

    try {
      await createComment({
        ticket: ticketId,
        content: replyContent.trim(),
        parentComment: parentCommentId,
      });

      setReplyContent("");
      setReplyingTo(null);
      await loadComments();
    } catch (error) {
      setError(error.message || "Unable to send reply.");
    } finally {
      setSending(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      await updateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent("");
      await loadComments();
    } catch (error) {
      setError(error.message || "Unable to edit comment.");
    }
  };

  const handleDelete = async (commentId) => {
    const confirmed = window.confirm(
      "Delete this comment and its replies?"
    );

    if (!confirmed) return;

    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (error) {
      setError(error.message || "Unable to delete comment.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const topLevelComments = comments.filter(
    (comment) => !comment.parentComment
  );

  const getReplies = (commentId) => {
    return comments.filter((comment) => {
      const parentId =
        comment.parentComment?._id || comment.parentComment;

      return parentId?.toString() === commentId.toString();
    });
  };

  const renderComment = (comment, isReply = false) => {
    const replies = getReplies(comment._id);

    return (
      <div
        key={comment._id}
        className={isReply ? "ml-8 border-l border-zinc-800 pl-4" : ""}
      >
        <div className="rounded-xl border border-zinc-800 bg-[#111113] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-400">
                {comment.author?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-200">
                  {comment.author?.name || "Unknown User"}
                </p>

                <p className="text-xs text-zinc-500">
                  {formatDate(comment.createdAt)}
                  {comment.updatedAt !== comment.createdAt && " · Edited"}
                </p>
              </div>
            </div>

            {isOwner(comment) && (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => {
                    setEditingId(comment._id);
                    setEditContent(comment.content);
                  }}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                  title="Edit comment"
                >
                  <Pencil size={15} />
                </button>

                <button
                  onClick={() => handleDelete(comment._id)}
                  className="rounded-lg p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                  title="Delete comment"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>

          {editingId === comment._id ? (
            <div className="mt-4 space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-indigo-500"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(comment._id)}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium hover:bg-indigo-500"
                >
                  Save changes
                </button>

                <button
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
              {comment.content}
            </p>
          )}

          {!isReply && (
            <button
              onClick={() => {
                setReplyingTo(
                  replyingTo === comment._id ? null : comment._id
                );
                setReplyContent("");
              }}
              className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              <Reply size={15} />
              Reply {replies.length > 0 && `(${replies.length})`}
            </button>
          )}

          {replyingTo === comment._id && (
            <form
              onSubmit={(e) => handleReply(e, comment._id)}
              className="mt-4 space-y-3"
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm text-white outline-none focus:border-indigo-500"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={sending || !replyContent.trim()}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Send size={13} />
                  Send reply
                </button>

                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="text-indigo-400" size={21} />
            <h2 className="text-lg font-semibold">Pulse Discussions</h2>
          </div>

          <p className="mt-1 text-xs text-zinc-500">
            Collaborate, investigate and solve issues together.
          </p>
        </div>

        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-400">
          {comments.length} comments
        </span>
      </div>

      {/* NEW COMMENT */}
      <form onSubmit={handleAddComment} className="mb-7">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an update, debugging finding or suggestion..."
          rows={4}
          className="w-full rounded-xl border border-zinc-700 bg-[#111113] p-4 text-sm text-white outline-none transition focus:border-indigo-500"
        />

        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Post comment
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* DISCUSSION LIST */}
      <div className="space-y-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-zinc-500">
            Loading discussions...
          </p>
        ) : topLevelComments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-700 py-10 text-center">
            <MessageCircle className="mx-auto mb-3 text-zinc-600" size={30} />
            <p className="text-sm text-zinc-400">
              No discussions yet.
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Start the conversation with your team.
            </p>
          </div>
        ) : (
          topLevelComments.map((comment) => renderComment(comment))
        )}
      </div>
    </section>
  );
}

export default PulseDiscussions;
