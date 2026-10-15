const router = require("express").Router();
const controller = require("../controllers/taskController");
const schema = require("../validators/taskSchemas");
const validate = require("../middleware/validate");
const AppError = require("../utils/AppError");
const jsonOnly = (req, res, next) =>
  req.is("application/json")
    ? next()
    : next(
        new AppError(
          415,
          "UNSUPPORTED_MEDIA_TYPE",
          "Send the request as application/json.",
        ),
      );

router.get("/", validate(schema.listQuery, "query"), controller.list);
router.post("/", jsonOnly, validate(schema.createTask), controller.create);
router.get("/:id", validate(schema.taskId, "params"), controller.get);
router.put(
  "/:id",
  jsonOnly,
  validate(schema.taskId, "params"),
  validate(schema.updateTask),
  controller.update,
);
router.delete("/:id", validate(schema.taskId, "params"), controller.remove);
module.exports = router;
