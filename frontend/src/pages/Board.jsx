
import { useEffect, useState } from "react";

import {
  DndContext,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  RefreshCw,
  Bug,
  Loader2,
  GripVertical,
} from "lucide-react";

import {
  getTickets,
  updateTicket,
} from "../services/ticketService";

// KANBAN COLUMNS
const columns = [
  {
    id: "todo",
    title: "To Do",
    color: "bg-zinc-400",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-blue-400",
  },
  {
    id: "done",
    title: "Done",
    color: "bg-green-400",
  },
];

// TICKET CARD
function TicketCard({ ticket }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: ticket._id,
    data: {
      type: "ticket",
      status: ticket.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColors = {
    critical: "text-red-400 bg-red-400/10",
    high: "text-orange-400 bg-orange-400/10",
    medium: "text-yellow-400 bg-yellow-400/10",
    low: "text-green-400 bg-green-400/10",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 mb-3 hover:border-zinc-600"
    >
      {/* DRAG HANDLE */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Bug size={14} className="text-zinc-500 shrink-0" />

          <span className="text-xs text-zinc-500 truncate">
            {ticket.ticketId}
          </span>
        </div>

        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Drag issue ${ticket.ticketId}`}
          className="touch-none select-none cursor-grab active:cursor-grabbing p-2 -mr-2 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-700"
        >
          <GripVertical size={18} />
        </button>
      </div>

      {/* ISSUE TITLE */}
      <h3 className="text-sm font-medium text-zinc-100 mb-3 break-words">
        {ticket.title}
      </h3>

      {/* PRIORITY AND PROJECT */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs px-2 py-1 rounded-md capitalize ${
            priorityColors[ticket.priority] ||
            priorityColors.medium
          }`}
        >
          {ticket.priority}
        </span>

        <span className="text-xs text-zinc-500 truncate">
          {ticket.project?.name || "Project"}
        </span>
      </div>
    </div>
  );
}

// DROPPABLE COLUMN
function BoardColumn({ column, tickets }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      status: column.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-[#111113] border rounded-xl p-4 min-h-[250px] md:min-h-[450px] transition ${
        isOver
          ? "border-blue-500 bg-blue-500/5"
          : "border-zinc-800"
      }`}
    >
      {/* COLUMN HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${column.color}`}
          />

          <h2 className="font-medium text-sm">
            {column.title}
          </h2>
        </div>

        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">
          {tickets.length}
        </span>
      </div>

      {/* TICKETS */}
      <SortableContext
        items={tickets.map((ticket) => ticket._id)}
        strategy={verticalListSortingStrategy}
      >
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            ticket={ticket}
          />
        ))}
      </SortableContext>

      {tickets.length === 0 && (
        <div className="border border-dashed border-zinc-700 rounded-lg p-6 text-center text-xs text-zinc-500">
          Drop issues here
        </div>
      )}
    </div>
  );
}

// MAIN BOARD
function Board() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // DESKTOP MOUSE + MOBILE TOUCH SENSORS
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),

    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    })
  );

  // LOAD TICKETS
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTickets();

      setTickets(data.tickets || []);
    } catch (err) {
      setError(err.message || "Failed to load board");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // DRAG AND DROP
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const draggedTicket = tickets.find(
      (ticket) => ticket._id === active.id
    );

    if (!draggedTicket) return;

    const targetStatus =
      over.data.current?.type === "column"
        ? over.data.current.status
        : tickets.find(
            (ticket) => ticket._id === over.id
          )?.status;

    if (
      !targetStatus ||
      targetStatus === draggedTicket.status
    ) {
      return;
    }

    const previousTickets = tickets;

    // UPDATE UI IMMEDIATELY
    setTickets((current) =>
      current.map((ticket) =>
        ticket._id === active.id
          ? { ...ticket, status: targetStatus }
          : ticket
      )
    );

    try {
      setSavingId(active.id);
      setError("");

      // SAVE STATUS TO DATABASE
      await updateTicket(active.id, {
        status: targetStatus,
      });
    } catch (err) {
      setTickets(previousTickets);

      setError(
        err.message || "Could not update ticket status"
      );
    } finally {
      setSavingId(null);
    }
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-400 flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" />
        Loading board...
      </div>
    );
  }

  // MAIN UI
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-4 sm:p-6 md:p-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-zinc-500 mb-2">
            Workspace / Board
          </p>

          <h1 className="text-3xl font-semibold">
            Kanban Board
          </h1>

          <p className="text-sm text-zinc-500 mt-2">
            Organize and track your issues.
          </p>

          <p className="text-xs text-zinc-600 mt-2">
            Hold the grip icon to drag an issue on mobile.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTickets}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-zinc-800 rounded-lg text-sm hover:bg-zinc-800"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* SAVING MESSAGE */}
      {savingId && (
        <p className="text-xs text-blue-400 mb-4">
          Saving ticket status...
        </p>
      )}

      {/* KANBAN BOARD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

          {columns.map((column) => {
            const columnTickets = tickets.filter(
              (ticket) => ticket.status === column.id
            );

            return (
              <BoardColumn
                key={column.id}
                column={column}
                tickets={columnTickets}
              />
            );
          })}

        </div>
      </DndContext>
    </div>
  );
}

export default Board;
