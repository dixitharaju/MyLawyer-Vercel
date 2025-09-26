import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateEnhancedLegalResponse } from "./services/legalBot";
import { insertConversationSchema, insertMessageSchema, insertComplaintSchema, insertCommunityPostSchema, insertCommunityPostCommentSchema } from "@shared/schema";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  const clientDistPath = path.join(__dirname, "../dist/public");

  // Serve static files if they exist
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // Authentication middleware
  app.use((req: any, _res, next) => {
    if (req.session?.userId) {
      req.user = { claims: { sub: req.session.userId } };
    } else {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const userId = authHeader.split(" ")[1];
        if (userId) req.user = { claims: { sub: userId } };
      }
    }
    next();
  });

  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.user?.claims?.sub || req.session?.userId) return next();
    res.status(401).json({ error: "Unauthorized" });
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Signup, login, logout, chat, legal, complaints, community routes ...
  // Keep your current implementations here (just remove dev-only logs if you want)

  // Catch-all: serve frontend
  if (fs.existsSync(clientDistPath)) {
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
