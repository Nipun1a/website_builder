import express from "express";
import { protect } from "../middlewares/auth.js";
import {
    deleteProject,
    getProjectById,
    getProjectPreview,
    getPublishedProjects,
    makeRevision,
    rollbackToVersion,
    savedProjectCode
} from "../controllers/projectController.js";

const projectRouter = express.Router();

projectRouter.post("/revision/:projectId", protect, makeRevision);
projectRouter.put("/save/:projectId", protect, savedProjectCode);
projectRouter.post("/rollback/:projectId/:versionId", protect, rollbackToVersion);
projectRouter.delete("/delete/:projectId", protect, deleteProject);
projectRouter.get("/preview/:projectId", protect, getProjectPreview);
projectRouter.get("/published", getPublishedProjects);
projectRouter.get("/published/:projectId", getProjectById);

export default projectRouter;
