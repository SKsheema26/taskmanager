import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../App";
import { tasksAPI } from "../api/client";
import TaskModal from "../components/TaskModal";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, todo: 0, in_progress: 0, completed: 0, high_priority: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [activeColumn, setActiveColumn] = useState("all");
  const [modal, setModal] = useState({ open: false, task: null });

  const loadTasks = useCallback(async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        tasksAPI.getAll(),
        tasksAPI.stats(),
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleCreate = () => setModal({ open: true, task: null });
  const handleEdit = (task) => setModal({ open: true, task });
  const handleCloseModal = () => setModal({ open: false, task: null });

  const handleSave = async (payload) => {
    if (modal.task) {
      await tasksAPI.update(modal.task.id, payload);
    } else {
      await tasksAPI.create(payload);
    }
    await loadTasks();
  };

  const handleDelete = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this task?")) return;
    await tasksAPI.delete(taskId);
    await loadTasks();
  };

  const handleStatusToggle = async (task, e) => {
    e.stopPropagation();
    const next = task.status === "completed" ? "todo"
      : task.status === "todo" ? "in_progress" : "completed";
    await tasksAPI.update(task.id, { status: next });
    await loadTasks();
  };

  const filteredTasks = tasks
    .filter(t => {
      if (filterPriority && t.priority !== filterPriority) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) &&
          !(t.description || "").toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

  const tasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

  const completionPct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : (user?.username || "U")[0].toUpperCase();

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
         <div className="sidebar-logo-icon">✔</div>
          <span>TaskManager</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Views</div>
          <nav className="sidebar-nav">
            {[
              { key: "all", icon: "📋", label: "All Tasks", count: stats.total },
              { key: "todo", icon: "📝", label: "To Do", count: stats.todo },
              { key: "in_progress", icon: "⚡", label: "In Progress", count: stats.in_progress },
              { key: "completed", icon: "✅", label: "Completed", count: stats.completed },
            ].map(item => (
              <button key={item.key}
                className={`sidebar-item ${activeColumn === item.key ? "active" : ""}`}
                onClick={() => setActiveColumn(item.key)}>
                <span className="icon">{item.icon}</span>
                {item.label}
                {item.count > 0 && <span className="badge">{item.count}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Priority</div>
          <nav className="sidebar-nav">
            {[
              { key: "", icon: "•", label: "All priorities" },
              { key: "high", icon: "▲", label: "High" },
              { key: "medium", icon: "—", label: "Medium" },
              { key: "low", icon: "▽", label: "Low" },
            ].map(item => (
              <button key={item.key}
                className={`sidebar-item ${filterPriority === item.key && activeColumn === "all" ? "active" : ""}`}
                onClick={() => { setFilterPriority(item.key); setActiveColumn("all"); }}>
                <span className="icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.full_name || user?.username}</div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {theme === "light" ? "🌙" : "☀️"}
            </button>
            <button className="btn-logout" onClick={logout} title="Sign out">out</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              {activeColumn === "all" ? "All Tasks"
                : activeColumn === "todo" ? "To Do"
                : activeColumn === "in_progress" ? "In Progress"
                : "Completed"}
            </h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <button className="btn-add" onClick={handleCreate}>
            <span>+</span> New task
          </button>
        </div>

        {stats.total > 0 && (
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-label">Overall progress</span>
              <span className="progress-pct">{completionPct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-label">Total</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card todo-s">
            <div className="stat-label">To Do</div>
            <div className="stat-value">{stats.todo}</div>
          </div>
          <div className="stat-card progress-s">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{stats.in_progress}</div>
          </div>
          <div className="stat-card done-s">
            <div className="stat-label">Done</div>
            <div className="stat-value">{stats.completed}</div>
          </div>
          <div className="stat-card high-s">
            <div className="stat-label">High Priority</div>
            <div className="stat-value">{stats.high_priority}</div>
          </div>
        </div>

        <div className="filters-bar">
          <input className="search-input" placeholder="Search tasks..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {activeColumn === "all" ? (
          <div className="tasks-columns">
            {COLUMNS.map(col => (
              <TaskColumn key={col.key} col={col}
                tasks={tasksByStatus(col.key)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleStatus={handleStatusToggle} />
            ))}
          </div>
        ) : (
          <div style={{ maxWidth: 520 }}>
            <TaskColumn
              col={COLUMNS.find(c => c.key === activeColumn)}
              tasks={filteredTasks.filter(t => t.status === activeColumn)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleStatusToggle}
              singleView />
          </div>
        )}
      </main>

      {modal.open && (
        <TaskModal task={modal.task} onClose={handleCloseModal} onSave={handleSave} />
      )}
    </div>
  );
}

function TaskColumn({ col, tasks, onEdit, onDelete, onToggleStatus, singleView }) {
  return (
    <div className="column" style={singleView ? { background: "transparent", border: "none", padding: 0 } : {}}>
      {!singleView && (
        <div className="column-header">
          <div className="column-title">
            <span className={`col-dot ${col.key}`} />
            {col.label}
          </div>
          <span className="col-count">{tasks.length}</span>
        </div>
      )}
      {tasks.length === 0 ? (
        <div className="empty-column">
          <div className="empty-icon">
            {col.key === "todo" ? "\uD83D\uDCCB" : col.key === "in_progress" ? "\u26A1" : "\u2705"}
          </div>
          No tasks here
        </div>
      ) : (
        tasks.map(task => (
          <TaskCard key={task.id} task={task}
            onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
        ))
      )}
    </div>
  );
}

function TaskCard({ task, onEdit, onDelete, onToggleStatus }) {
  const due = task.due_date ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
  const overdue = task.status !== "completed" && task.due_date && new Date(task.due_date) < new Date();

  return (
    <div className="task-card" onClick={() => onEdit(task)}>
      <div className="task-card-header">
        <div className={`task-title ${task.status === "completed" ? "done" : ""}`}>
          {task.title}
        </div>
        <span className={`priority-dot ${task.priority}`} title={`${task.priority} priority`} />
      </div>

      {task.description && (
        <div className="task-desc">{task.description}</div>
      )}

      <div className="task-footer">
        <div className="task-meta">
          <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
          {due && <span className={`due-date ${overdue ? "overdue" : ""}`}>{overdue ? "! " : ""}{due}</span>}
        </div>
        <div className="task-actions">
          <button className="task-btn" title="Advance status"
            onClick={e => onToggleStatus(task, e)}>
            {task.status === "completed" ? "\u21BA" : task.status === "todo" ? "\u25B7" : "\u2713"}
          </button>
          <button className="task-btn delete" title="Delete"
            onClick={e => onDelete(task.id, e)}>x</button>
        </div>
      </div>
    </div>
  );
}

