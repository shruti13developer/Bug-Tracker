
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

// All ticket routes require authentication
router.use(authMiddleware);

// Create ticket
router.post("/", createTicket);

// Get all tickets
router.get("/", getTickets);

// Get single ticket
router.get("/:id", getTicketById);

// Update ticket
router.put("/:id", updateTicket);

// Delete ticket
router.delete("/:id", deleteTicket);

export default router;
