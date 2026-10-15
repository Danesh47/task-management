const sequelize = require("../src/config/database");
const Task = require("../src/models/Task");

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.transaction(async (transaction) => {
      if (await Task.count({ transaction })) {
        console.log("Tasks already exist. No demo data was added.");
        return;
      }
      const date = (days) => {
        const value = new Date();
        value.setDate(value.getDate() + days);
        return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
      };
      await Task.bulkCreate(
        [
          {
            title: "Outline the next release",
            description:
              "Gather the small improvements that will make the biggest difference.",
            status: "In Progress",
            due_date: date(2),
          },
          {
            title: "Review the homepage layout",
            description: "Check spacing, typography and the mobile experience.",
            status: "Pending",
            due_date: date(3),
          },
          {
            title: "Write the setup guide",
            description: "Make it easy for someone new to get started.",
            status: "Pending",
            due_date: date(5),
          },
          {
            title: "Organize project notes",
            description: "One home for the decisions, details and next steps.",
            status: "Completed",
            due_date: date(0),
          },
          {
            title: "Prepare for the weekly review",
            description:
              "A short list of what moved forward and what needs attention.",
            status: "In Progress",
            due_date: null,
          },
          {
            title: "Send the final handoff",
            description: null,
            status: "Pending",
            due_date: date(7),
          },
        ],
        { transaction },
      );
      console.log("Added six illustrative demo tasks.");
    });
  } finally {
    await sequelize.close();
  }
}
seed().catch((error) => {
  console.error(
    `Demo data could not be added (${error.name}). Check configuration and run migrations first.`,
  );
  process.exitCode = 1;
});
