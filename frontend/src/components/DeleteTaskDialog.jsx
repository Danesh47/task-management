import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteTaskDialog({
  task,
  error,
  deleting,
  locked,
  onConfirm,
  onCancel,
}) {
  const dialog = useRef(null);
  const cancel = useRef(null);
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    cancel.current?.focus();
    return () => node.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="delete-dialog"
      aria-labelledby="delete-heading"
      aria-describedby="delete-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!deleting) onCancel();
      }}
    >
      <div className="delete-symbol">
        <Trash2 size={24} />
      </div>
      <h2 id="delete-heading">Delete this task?</h2>
      <p className="delete-task-title">{task.title}</p>
      <p id="delete-description">
        This permanently deletes the task. This action cannot be undone.
      </p>
      {locked && (
        <p role="alert" className="dialog-error">
          The result could not be confirmed. Close this dialog and refresh tasks
          before trying again.
        </p>
      )}
      {error && !locked && (
        <p role="alert" className="dialog-error">
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button
          ref={cancel}
          className="button secondary"
          disabled={deleting}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="button destructive"
          disabled={deleting || locked}
          onClick={onConfirm}
        >
          {deleting ? "Deleting…" : "Delete task"}
        </button>
      </div>
    </dialog>
  );
}
