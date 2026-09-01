import { Router } from "express";

import {
  createJob,
  getJob,
} from "./jobs.controller.js";

const router = Router();

router.post("/", createJob);
router.get("/:id", getJob);

export default router;