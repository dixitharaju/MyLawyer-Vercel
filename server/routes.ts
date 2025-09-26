import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateEnhancedLegalResponse } from "./services/legalBot";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  const clientDistPath = path.join(__dirname, "../dist/public");
  const fs = await import("fs");

  // Serve frontend static files
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "OK", message: "Server is running" });
  });

  // Authentication middleware
  app.use((req: any, _res: any, next: any) => {
    if (req.session?.userId) {
      req.user = { claims: { sub: req.session.userId } };
      return next();
    }

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const userId = authHeader.split(" ")[1];
      if (userId) req.user = { claims: { sub: userId } };
    }

    next();
  });

  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.user?.claims?.sub || req.session?.userId) return next();
    res.status(401).json({ error: "Unauthorized" });
  };

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName)
        return res.status(400).json({ error: "Missing required fields" });

      const existingUser = await storage.authenticateUser(email, "");
      if (existingUser)
        return res
          .status(400)
          .json({ error: "User already exists with this email" });

      const newUser = await storage.createUserFromSignup(req.body);
      res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isVerified: newUser.isVerified,
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ error: "Email and password required" });

      const user = await storage.authenticateUser(email, password);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      if (req.session) req.session.userId = user.id;

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req: any, res) => {
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) return res.status(500).json({ error: "Failed to logout" });
        res.clearCookie("connect.sid");
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  // Chat routes
  app.post("/api/chat/conversations", async (req: any, res) => {
    try {
      const conversation = await storage.createConversation({
        ...req.body,
        userId: req.user.claims.sub,
      });
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/chat/conversations", async (req: any, res) => {
    try {
      const conversations = await storage.getUserConversations(
        req.user.claims.sub
      );
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/chat/conversations/:id/messages", async (req: any, res) => {
    try {
      const { id } = req.params;
      const userMessage = await storage.createMessage({
        conversationId: parseInt(id),
        role: "user",
        content: req.body.content,
      });

      const conversationMessages = await storage.getConversationMessages(
        parseInt(id)
      );
      const conversationHistory = conversationMessages.map(
        (msg) => `${msg.role}: ${msg.content}`
      );

      const aiResponse = await generateEnhancedLegalResponse(
        req.body.content,
        conversationHistory
      );

      const assistantMessage = await storage.createMessage({
        conversationId: parseInt(id),
        role: "assistant",
        content: aiResponse,
      });

      res.status(201).json({ userMessage, assistantMessage });
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.get("/api/chat/conversations/:id/messages", async (req: any, res) => {
    try {
      const messages = await storage.getConversationMessages(
        parseInt(req.params.id)
      );
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Legal routes
  app.get("/api/legal/categories", async (_req, res) => {
    try {
      const categories = await storage.getLegalCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching legal categories:", error);
      res.status(500).json({ error: "Failed to fetch legal categories" });
    }
  });

  app.get("/api/legal/articles", async (req, res) => {
    try {
      const { search, categoryId } = req.query;
      let articles;

      if (search) {
        articles = await storage.searchLegalArticles(search as string);
      } else if (categoryId) {
        articles = await storage.getLegalArticles(parseInt(categoryId as string));
      } else {
        articles = await storage.getLegalArticles();
      }

      res.json(articles);
    } catch (error) {
      console.error("Error fetching legal articles:", error);
      res.status(500).json({ error: "Failed to fetch legal articles" });
    }
  });

  // Catch-all route for frontend
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    if (!fs.existsSync(clientDistPath)) {
      return res.status(404).json({
        error: "Frontend build not found. Please run 'npm run build'.",
      });
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });

  return createServer(app);
}
