import { useEffect, useRef, useState } from "react";
import {
  Plus,
  RefreshCw,
  ArrowUpRight,
  CircleAlert,
  LoaderCircle,
  CalendarDays,
} from "lucide-react";
import useTasks from "./hooks/useTasks";
import { editableTask, tasksApi } from "./api/tasks";
import Sidebar from "./components/Sidebar";
import TaskList, { EmptyTasks, LoadingTasks } from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import DeleteTaskDialog from "./components/DeleteTaskDialog";
import FeedbackMessage from "./components/FeedbackMessage";

export default function App() {
  const state = useTasks();
  const [filter, setFilter] = useState("All");
  const [editor, setEditor] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const editRequest = useRef(null);
  const trigger = useRef(null);
  const addButton = useRef(null);
  useEffect(() => () => editRequest.current?.abort(), []);
  const writing = !!state.busy;
  const locked = writing || state.needsRefresh;
  const rowDisabled =
    locked || !!editor || editLoading || state.phase === "loading";
  const visible =
    filter === "All"
      ? state.tasks
      : state.tasks.filter((task) => task.status === filter);
  const heading = filter === "All" ? "Tasks" : `${filter} tasks`;
  const date = new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const restoreFocus = () =>
    requestAnimationFrame(() => {
      if (trigger.current && document.contains(trigger.current))
        trigger.current.focus();
      else addButton.current?.focus();
    });
  const closeEditor = () => {
    setEditor(null);
    restoreFocus();
  };
  const openCreate = () => {
    trigger.current = document.activeElement;
    setEditError(null);
    setEditor({ mode: "create" });
  };
  const openEdit = async (task) => {
    if (rowDisabled) return;
    trigger.current = document.activeElement;
    editRequest.current?.abort();
    const controller = new AbortController();
    editRequest.current = controller;
    setEditLoading(true);
    setEditError(null);
    try {
      const latest = await tasksApi.get(task.id, controller.signal);
      if (!controller.signal.aborted) setEditor({ mode: "edit", task: latest });
    } catch (error) {
      if (error.name !== "AbortError") {
        setEditError(error.message);
        if (error.status === 404) void state.refresh({ quiet: true });
      }
    } finally {
      if (!controller.signal.aborted) setEditLoading(false);
    }
  };
  const save = async (input) => {
    const result = await state.mutate(
      editor.mode === "create" ? "create" : "update",
      editor.task?.id,
      input,
    );
    if (result) closeEditor();
  };
  const changeStatus = async (task, status) => {
    if (rowDisabled || task.status === status) return;
    try {
      await state.mutate("status", task.id, { ...editableTask(task), status });
    } catch {
      /* Feedback is managed by useTasks. */
    }
  };
  const closeDelete = () => {
    setDeleteTarget(null);
    restoreFocus();
  };
  const confirmDelete = async () => {
    try {
      const result = await state.mutate("delete", deleteTarget.id);
      if (result) closeDelete();
    } catch (error) {
      setDeleteError(error.message);
      if (error.status === 404) closeDelete();
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to tasks
      </a>
      <Sidebar
        filter={filter}
        setFilter={setFilter}
        tasks={state.tasks}
        disabled={writing}
      />
      <div className="workspace">
        <header className="utility-bar">
          <span className="workspace-label">
            <span className="workspace-square" />
            Task workspace
          </span>
          <span className="today">
            <CalendarDays size={15} />
            {date}
          </span>
        </header>
        <main id="main" className="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <div className="heading-line">
                <h1>{heading}</h1>
                <span
                  className="task-count"
                  aria-label={`${visible.length} tasks`}
                >
                  {visible.length}
                </span>
              </div>
              <p>A little structure. A clearer day.</p>
            </div>
            <button
              ref={addButton}
              className="button primary add-button"
              disabled={
                locked || !!editor || editLoading || state.phase === "loading"
              }
              onClick={openCreate}
            >
              <Plus size={18} />
              Add task
            </button>
          </div>
          <FeedbackMessage
            notice={state.notice}
            onDismiss={state.dismissNotice}
          />
          {state.needsRefresh && (
            <div className="recovery-banner">
              <CircleAlert size={18} />
              <span>
                Refresh your list to see whether the last change was saved.
              </span>
              <button
                className="text-button"
                disabled={state.refreshing || writing}
                onClick={() => state.refresh({ quiet: true })}
              >
                Refresh tasks
              </button>
            </div>
          )}
          {editLoading && (
            <div className="edit-loading" role="status">
              <LoaderCircle size={18} className="spin" />
              Loading task details…
            </div>
          )}
          {editError && (
            <FeedbackMessage
              notice={{ kind: "error", message: editError }}
              onDismiss={() => setEditError(null)}
            />
          )}
          {editor && (
            <TaskForm
              key={`${editor.mode}-${editor.task?.id || "new"}`}
              mode={editor.mode}
              initialTask={editor.task}
              saving={writing}
              locked={state.needsRefresh}
              onSubmit={save}
              onCancel={closeEditor}
            />
          )}
          <section className="task-surface" aria-label="Tasks">
            <div className="list-toolbar">
              <div className="list-toolbar-title">
                <span className="section-dot" />
                <h2>{filter === "All" ? "All tasks" : filter}</h2>
                <span className="toolbar-total">{visible.length}</span>
              </div>
              <button
                className="refresh-button"
                aria-label="Refresh task list"
                title="Refresh tasks"
                disabled={writing || state.refreshing}
                onClick={() => state.refresh({ quiet: state.tasks.length > 0 })}
              >
                <RefreshCw
                  size={16}
                  className={state.refreshing ? "spin" : ""}
                />
                <span>{state.refreshing ? "Refreshing" : "Refresh"}</span>
              </button>
            </div>
            {state.listError && (
              <div className="list-error" role="alert">
                <CircleAlert size={18} />
                <span>
                  {state.tasks.length ? "Showing the last loaded tasks. " : ""}
                  {state.listError}
                </span>
                <button
                  className="text-button"
                  disabled={state.refreshing || writing}
                  onClick={() =>
                    state.refresh({ quiet: state.tasks.length > 0 })
                  }
                >
                  Retry
                </button>
              </div>
            )}
            {state.phase === "loading" && !state.tasks.length ? (
              <LoadingTasks />
            ) : state.listError && !state.tasks.length ? (
              <div className="connection-state">
                <div className="empty-symbol">
                  <CircleAlert size={28} />
                </div>
                <h2>Let’s get connected.</h2>
                <p>
                  Start the Node.js API and connect your MySQL database, then
                  refresh your tasks.
                </p>
                <button
                  className="button secondary"
                  disabled={state.refreshing || writing}
                  onClick={() => state.refresh()}
                >
                  Try again
                  <ArrowUpRight size={16} />
                </button>
              </div>
            ) : !visible.length ? (
              <EmptyTasks
                filter={filter}
                onAdd={openCreate}
                onShowAll={() => setFilter("All")}
                disabled={locked || !!editor || editLoading}
              />
            ) : (
              <TaskList
                tasks={visible}
                disabled={rowDisabled}
                busy={state.busy}
                onEdit={openEdit}
                onStatusChange={changeStatus}
                onDelete={(task) => {
                  trigger.current = document.activeElement;
                  setDeleteError(null);
                  setDeleteTarget(task);
                }}
              />
            )}
            <div className="list-footer">
              <span>
                {state.phase === "loading"
                  ? "Loading your workspace…"
                  : `Showing ${visible.length} of ${state.tasks.length} ${state.tasks.length === 1 ? "task" : "tasks"}`}
              </span>
              <span className="list-footer-note">
                Your next step starts here.
                <ArrowUpRight size={13} />
              </span>
            </div>
          </section>
          <footer className="page-footer">
            <span>Less noise. More progress.</span>
            <span>
              Taskline<span className="footer-dot">.</span>
            </span>
          </footer>
        </main>
      </div>
      {deleteTarget && (
        <DeleteTaskDialog
          task={deleteTarget}
          error={deleteError}
          deleting={state.busy?.kind === "delete"}
          locked={state.needsRefresh}
          onConfirm={confirmDelete}
          onCancel={closeDelete}
        />
      )}
    </div>
  );
}
