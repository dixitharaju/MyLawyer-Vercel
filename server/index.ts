import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import session from "express-session";
import { connectToDatabase } from "./db";
import dotenv from "dotenv";
import { log } from "./vite"; // keep your log function if needed

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "lawyer-connect-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB Atlas
  try {
    await connectToDatabase();
    log("✅ Connected to MongoDB successfully");
  } catch (error) {
    log(
      `❌ Failed to connect to MongoDB: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    log("Continuing without database connection for development...");
  }

  const server = await registerRoutes(app);

  // Global error handler
  app.use(
    (err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    }
  );

  // Start the server
  const port = parseInt(process.env.PORT || "5000", 10);

  const startServer = (port: number) => {
    server
      .listen(port, "0.0.0.0", () => {
        log(`✅ Server running on http://0.0.0.0:${port}`);
      })
      .on("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          log(`Port ${port} is in use, trying ${port + 1}`);
          startServer(port + 1);
        } else {
          console.error("❌ Server error:", err);
          process.exit(1);
        }
      });
  };

  startServer(port);
})();
