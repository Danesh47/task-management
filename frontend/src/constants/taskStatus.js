export const STATUSES = ["Pending", "In Progress", "Completed"];
export const statusClass = (status) =>
  ({ Pending: "pending", "In Progress": "progress", Completed: "completed" })[
    status
  ];
