import { type Project, type InsertProject } from "@shared/schema";

// Simple storage interface
export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getFavoriteProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  toggleFavorite(id: number): Promise<Project | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private projects: Map<number, Project> = new Map();
  private nextId: number = 1;
  private errorRate: number = 0.2; // 20% chance of API failure

  constructor() {
    // Add sample data
    this.seedInitialData();
  }
  
  // Helper method to simulate API delays and random failures
  private simulateNetworkConditions(): Promise<void> {
    // Simulate slower network (400-1500ms delay)
    const delay = Math.floor(Math.random() * 1100) + 400;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Random error based on error rate
        if (Math.random() < this.errorRate) {
          reject(new Error('Network error: API request failed'));
        } else {
          resolve();
        }
      }, delay);
    });
  }

  // Get all projects
  async getProjects(): Promise<Project[]> {
    await this.simulateNetworkConditions();
    return Array.from(this.projects.values());
  }

  // Get project by ID
  async getProject(id: number): Promise<Project | undefined> {
    await this.simulateNetworkConditions();
    return this.projects.get(id);
  }

  // Get favorite projects
  async getFavoriteProjects(): Promise<Project[]> {
    await this.simulateNetworkConditions();
    return Array.from(this.projects.values()).filter(project => project.isFavorite);
  }

  // Create a new project
  async createProject(project: InsertProject): Promise<Project> {
    await this.simulateNetworkConditions();
    
    const id = this.nextId++;
    
    const newProject: Project = {
      id,
      ...project,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
      isFavorite: project.isFavorite ?? false
    };
    
    this.projects.set(id, newProject);
    return newProject;
  }

  // Update an existing project
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    await this.simulateNetworkConditions();
    
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject: Project = {
      ...existingProject,
      ...project,
      startDate: project.startDate ? new Date(project.startDate) : existingProject.startDate,
      endDate: project.endDate ? new Date(project.endDate) : existingProject.endDate,
      isFavorite: project.isFavorite ?? existingProject.isFavorite
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Delete a project
  async deleteProject(id: number): Promise<boolean> {
    await this.simulateNetworkConditions();
    return this.projects.delete(id);
  }

  // Toggle project's favorite status
  async toggleFavorite(id: number): Promise<Project | undefined> {
    await this.simulateNetworkConditions();
    
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject: Project = {
      ...project,
      isFavorite: !project.isFavorite
    };
    
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // Initialize with sample data
  private seedInitialData() {
    const sampleProjects: InsertProject[] = [
      {
        name: "Project A",
        description: "Project A Description: Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-12-31"),
        projectManager: "John Doe",
        isFavorite: true
      },
      {
        name: "Project B",
        description: "Project B Description: A detailed overview of the project objectives and timelines.",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-12-31"),
        projectManager: "John Doe",
        isFavorite: true
      },
      {
        name: "Project C",
        description: "Project C Description: An overview of the project with key milestones and deliverables.",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-12-31"),
        projectManager: "John Doe", 
        isFavorite: false
      },
      {
        name: "Project D",
        description: "Project D Description: Detailed planning and execution strategy for the project.",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-12-31"),
        projectManager: "John Doe",
        isFavorite: false
      },
      {
        name: "Project E",
        description: "Project E Description: Goals, objectives, and implementation approach for the project.",
        startDate: new Date("2023-01-01"),
        endDate: new Date("2023-12-31"),
        projectManager: "John Doe",
        isFavorite: false
      }
    ];

    // Directly add projects without using createProject to avoid network simulation during seeding
    for (const projectData of sampleProjects) {
      const id = this.nextId++;
      
      const newProject: Project = {
        id,
        ...projectData,
        startDate: new Date(projectData.startDate),
        endDate: new Date(projectData.endDate),
        isFavorite: projectData.isFavorite ?? false
      };
      
      this.projects.set(id, newProject);
    }
  }
}

// Create and export a singleton instance
export const storage = new MemStorage();