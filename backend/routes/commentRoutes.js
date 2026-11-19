
import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.use(authMiddleware);

// Add a comment or reply
router.post("/", createComment);

// Get all comments for a ticket
router.get("/:ticketId", getComments);

// Edit a comment
router.put("/:id", updateComment);

// Delete a comment
router.delete("/:id", deleteComment);

export default router;

