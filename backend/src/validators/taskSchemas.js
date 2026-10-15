const { z } = require("zod");
const statuses = require("../constants/taskStatus");

function isCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1000 || year > 9999 || month < 1 || month > 12) return false;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day >= 1 && day <= days;
}
const title = z
  .string({ error: "Task title is required." })
  .trim()
  .min(1, "Task title is required.")
  .max(255, "Use 255 characters or fewer.");
const description = z
  .string()
  .trim()
  .max(5000, "Use 5,000 characters or fewer.")
  .transform((value) => value || null)
  .nullable();
const dueDate = z
  .string()
  .refine(isCalendarDate, "Enter a valid date in YYYY-MM-DD format.")
  .nullable();
const status = z.enum(statuses, {
  error: "Select Pending, In Progress or Completed.",
});

const createTask = z.strictObject({
  title,
  description: description.optional().default(null),
  status: status.optional().default("Pending"),
  due_date: dueDate.optional().default(null),
});
const updateTask = z.strictObject({
  title,
  description,
  status,
  due_date: dueDate,
});
const taskId = z.strictObject({
  id: z
    .string()
    .regex(/^[1-9]\d*$/)
    .transform(Number)
    .pipe(z.number().int().max(4294967295)),
});
const positiveInteger = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(z.number().int().safe());
const listQuery = z
  .strictObject({
    status: status.optional(),
    page: positiveInteger.optional(),
    pageSize: positiveInteger.pipe(z.number().max(100)).optional(),
  })
  .superRefine((value, context) => {
    const page = value.page || 1;
    const size = value.pageSize || 20;
    if (!Number.isSafeInteger((page - 1) * size)) {
      context.addIssue({
        code: "custom",
        path: ["page"],
        message: "Page is too large.",
      });
    }
  });
module.exports = { createTask, updateTask, taskId, listQuery };
