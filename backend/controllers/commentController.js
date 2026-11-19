
import Comment from "../models/Comment.js";
import Ticket from "../models/Ticket.js";

// CREATE COMMENT OR REPLY
export const createComment = async (req, res) => {
  try {
    const { content, ticket, parentComment } = req.body;

    if (!content || !ticket) {
      return res.status(400).json({
        success: false,
        message: "Comment and ticket are required",
      });
    }

    const ticketExists = await Ticket.findById(ticket);

    if (!ticketExists) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (parentComment) {
      const parent = await Comment.findOne({
        _id: parentComment,
        ticket,
      });

      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }
    }

    const comment = await Comment.create({
      ticket,
      author: req.user._id,
      content,
      parentComment: parentComment || null,
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name email")
      .populate("parentComment");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET COMMENTS FOR A TICKET
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      ticket: req.params.ticketId,
    })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// EDIT OWN COMMENT
export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }

    comment.content = content.trim();
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE OWN COMMENT
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comments",
      });
    }

    // Delete replies as well
    await Comment.deleteMany({
      $or: [
        { _id: comment._id },
        { parentComment: comment._id },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
