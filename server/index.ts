import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";
import { setupWebpack } from "./webpack";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple logger function
export function log(message: string, source = "express") {
  const time = new Date().toLocaleTimeString();
  console.log(`${time} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// CORS support
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

(async () => {
  try {
    // Register API routes
    const server = await registerRoutes(app);

    // Error handler for API routes
    app.use("/api", (err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // Setup webpack middleware (or static file serving for production)
    const staticPath = setupWebpack(app);
    
    // In production, serve static files and implement SPA fallback
    if (staticPath && process.env.NODE_ENV === "production") {
      app.use(express.static(staticPath));
      
      // Fallback all non-API routes to index.html for SPA
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) {
          return next();
        }
        
        res.sendFile(path.join(staticPath, "index.html"));
      });
      
      log("Serving static files from " + staticPath);
    } else if (process.env.NODE_ENV !== "production") {
      // For development, webpack middleware is already set up with hot reloading
      log("Webpack middleware is handling frontend assets");
      
      // Fallback route for SPA in development
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api") || req.path.startsWith("/__webpack")) {
          return next();
        }
        
        // Let webpack-dev-middleware handle the request for the index.html and bundle.js
        next();
      });
    }

    // Start the server
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`Server running on port ${port}`);
      log(`Frontend accessible at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
})();
