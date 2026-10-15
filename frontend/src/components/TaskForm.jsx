import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { STATUSES } from "../constants/taskStatus";

export default function TaskForm({
  mode,
  initialTask,
  saving,
  locked,
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState({
    title: initialTask?.title || "",
    description: initialTask?.description || "",
    status: initialTask?.status || "Pending",
    due_date: initialTask?.due_date || "",
  });
  const [errors, setErrors] = useState({});
  const form = useRef(null);
  const title = useRef(null);
  useEffect(() => {
    title.current?.focus();
    form.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, []);
  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };
  const focusError = (fields) =>
    requestAnimationFrame(() => {
      const first = Object.keys(fields).find((name) =>
        ["title", "description", "status", "due_date"].includes(name),
      );
      if (first) form.current?.elements.namedItem(first)?.focus();
    });
  const submit = async (event) => {
    event.preventDefault();
    if (saving || locked) return;
    const fields = {};
    if (!values.title.trim()) fields.title = ["Task title is required."];
    else if (values.title.trim().length > 255)
      fields.title = ["Use 255 characters or fewer."];
    if (values.description.trim().length > 5000)
      fields.description = ["Use 5,000 characters or fewer."];
    if (Object.keys(fields).length) {
      setErrors(fields);
      focusError(fields);
      return;
    }
    setErrors({});
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim() || null,
        status: values.status,
        due_date: values.due_date || null,
      });
    } catch (error) {
      setErrors(error.fields || {});
      focusError(error.fields || {});
    }
  };
  const fieldProps = (name) => ({
    name,
    id: `task-${name}`,
    value: values[name],
    onChange: update,
    "aria-invalid": !!errors[name],
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });
  const errorFor = (name) =>
    errors[name] && (
      <span className="field-error" id={`${name}-error`}>
        {errors[name][0]}
      </span>
    );

  return (
    <section className="editor" aria-labelledby="editor-heading">
      <div className="editor-heading">
        <div>
          <h2 id="editor-heading">
            {mode === "edit" ? "Edit task" : "A new task. A clear next step."}
          </h2>
          <p>
            {mode === "edit"
              ? "Keep the details in line with your work."
              : "Start with a title. Add the details that matter."}
          </p>
        </div>
        <button
          className="icon-button"
          onClick={onCancel}
          disabled={saving}
          aria-label="Close task form"
        >
          <X size={20} />
        </button>
      </div>
      <form ref={form} onSubmit={submit} noValidate>
        <fieldset disabled={saving || locked}>
          <div className="form-grid">
            <div className="field title-field">
              <label htmlFor="task-title">
                Task title <span aria-hidden="true">*</span>
                <span className="sr-only">required</span>
              </label>
              <input
                ref={title}
                {...fieldProps("title")}
                placeholder="What needs to get done?"
                maxLength={255}
                required
                autoComplete="off"
              />
              {errorFor("title")}
            </div>
            <div className="field">
              <label htmlFor="task-status">Status</label>
              <select {...fieldProps("status")}>
                {STATUSES.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              {errorFor("status")}
            </div>
            <div className="field">
              <label htmlFor="task-due_date">
                Due date <span className="optional">optional</span>
              </label>
              <input
                {...fieldProps("due_date")}
                type="date"
                min="1000-01-01"
                max="9999-12-31"
              />
              {errorFor("due_date")}
            </div>
            <div className="field description-field">
              <label htmlFor="task-description">
                Description <span className="optional">optional</span>
              </label>
              <textarea
                {...fieldProps("description")}
                rows={3}
                maxLength={5000}
                placeholder="A little context goes a long way…"
              />
              {errorFor("description")}
            </div>
          </div>
        </fieldset>
        <div className="form-footer">
          <span className="form-hint">
            {locked
              ? "Refresh tasks before submitting another change."
              : "Small steps make good progress."}
          </span>
          <div className="form-actions">
            <button
              type="button"
              className="button secondary"
              disabled={saving}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary"
              disabled={saving || locked}
            >
              {saving
                ? "Saving…"
                : mode === "edit"
                  ? "Save changes"
                  : "Create task"}
              {!saving && <ArrowUpRight size={17} />}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
