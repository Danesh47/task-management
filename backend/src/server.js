let sequelize;
async function start() {
  const env = require("./config/env");
  sequelize = require("./config/database");
  await sequelize.authenticate();
  const app = require("./app");
  const server = app.listen(env.PORT, env.HOST, () =>
    console.log(`Taskline API listening at http://${env.HOST}:${env.PORT}`),
  );
  server.on("error", async (error) => {
    console.error(
      `API startup failed (${error.code || error.name}). Check the configured port.`,
    );
    await sequelize.close();
    process.exit(1);
  });
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => process.exit(1), 10000);
    deadline.unref();
    server.close(async () => {
      try {
        await sequelize.close();
        process.exit(0);
      } catch {
        process.exit(1);
      }
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
start().catch(async (error) => {
  const message = error.message?.startsWith("Invalid or missing configuration")
    ? error.message
    : `Database startup failed (${error.name}). Check MySQL and backend/.env.`;
  console.error(message);
  if (sequelize) await sequelize.close().catch(() => {});
  process.exit(1);
});
