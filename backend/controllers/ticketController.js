
import Ticket from "../models/Ticket.js";
import Project from "../models/Project.js";

// CREATE TICKET
export const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      priority,
      severity,
      status,
      assignee,
      environment,
    } = req.body;

    if (!title || !description || !project) {
      return res.status(400).json({
        success: false,
        message: "Title, description and project are required",
      });
    }

    const projectExists = await Project.findOne({
      _id: project,
      owner: req.user._id,
    });

    if (!projectExists) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const count = await Ticket.countDocuments({ project });
    const ticketId = `BUG-${String(count + 1).padStart(4, "0")}`;

    const ticket = await Ticket.create({
      ticketId,
      title,
      description,
      project,
      reporter: req.user._id,
      assignee: assignee || null,
      priority,
      severity,
      status,
      environment,
    });

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate("reporter", "name email")
      .populate("assignee", "name email")
      .populate("project", "name");

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ALL TICKETS
export const getTickets = async (req, res) => {
  try {
    const { project, status, priority, severity } = req.query;

    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (severity) filter.severity = severity;

    const tickets = await Ticket.find(filter)
      .populate("reporter", "name email")
      .populate("assignee", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE TICKET
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("reporter", "name email")
      .populate("assignee", "name email")
      .populate("project", "name");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE TICKET
export const updateTicket = async (req, res) => {
  try {
    const allowedFields = [
      "title",
      "description",
      "priority",
      "severity",
      "status",
      "assignee",
      "environment",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate("reporter", "name email")
      .populate("assignee", "name email")
      .populate("project", "name");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE TICKET
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
