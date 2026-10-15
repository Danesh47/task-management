const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { randomUUID } = require("node:crypto");
const env = require("./config/env");
const AppError = require("./utils/AppError");

const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.set({ "X-Request-Id": req.requestId, "Cache-Control": "no-store" });
  const started = Date.now();
  res.on("finish", () =>
    console.log(
      JSON.stringify({
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Date.now() - started,
      }),
    ),
  );
  next();
});
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    exposedHeaders: ["X-Request-Id", "Location"],
  }),
);
app.use(express.json({ limit: "64kb" }));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use((req, res, next) =>
  next(new AppError(404, "ROUTE_NOT_FOUND", "This API route does not exist.")),
);
app.use(require("./middleware/errorHandler"));
module.exports = app;
