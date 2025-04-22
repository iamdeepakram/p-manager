import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { log } from "./index";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all projects
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      log(`Error getting projects: ${error}`);
      res.status(500).json({ message: "Failed to retrieve projects" });
    }
  });

  // Get favorite projects
  app.get("/api/projects/favorites", async (_req, res) => {
    try {
      const projects = await storage.getFavoriteProjects();
      res.json(projects);
    } catch (error) {
      log(`Error getting favorite projects: ${error}`);
      res.status(500).json({ message: "Failed to retrieve favorite projects" });
    }
  });

  // Get project by ID
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      log(`Error getting project: ${error}`);
      res.status(500).json({ message: "Failed to retrieve project" });
    }
  });

  // Create a new project
  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      
      log(`Error creating project: ${error}`);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update a project
  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(id, projectData);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      
      log(`Error updating project: ${error}`);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Delete a project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProject(id);
      
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      log(`Error deleting project: ${error}`);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Toggle project favorite status
  app.post("/api/projects/:id/toggle-favorite", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedProject = await storage.toggleFavorite(id);
      
      if (!updatedProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(updatedProject);
    } catch (error) {
      log(`Error toggling favorite: ${error}`);
      res.status(500).json({ message: "Failed to update favorite status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}