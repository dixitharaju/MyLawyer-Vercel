import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateLegalResponse, categorizeComplaint, generateConversationTitle } from "./services/openai";
import { insertConversationSchema, insertMessageSchema, insertComplaintSchema, insertCommunityPostSchema, insertCommunityPostCommentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chat routes
  app.post('/api/chat/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertConversationSchema.parse({
        userId,
        title: req.body.title || "New Conversation"
      });
      
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/chat/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/chat/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chat/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;
      
      // Save user message
      const userMessage = await storage.createMessage({
        conversationId,
        role: 'user',
        content
      });

      // Generate AI response
      const aiResponse = await generateLegalResponse(content);
      
      // Save AI message
      const aiMessage = await storage.createMessage({
        conversationId,
        role: 'assistant',
        content: aiResponse
      });

      // Update conversation title if it's the first message
      const messages = await storage.getConversationMessages(conversationId);
      if (messages.length === 2) { // First user message + AI response
        const title = await generateConversationTitle([content]);
        // Update conversation title - we'll need to add this method to storage
      }

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Legal library routes
  app.get('/api/legal/categories', async (req, res) => {
    try {
      const categories = await storage.getLegalCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/legal/articles', async (req, res) => {
    try {
      const { categoryId, search } = req.query;
      let articles;
      
      if (search) {
        articles = await storage.searchLegalArticles(search as string);
      } else {
        articles = await storage.getLegalArticles(categoryId ? parseInt(categoryId as string) : undefined);
      }
      
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  // Complaint routes
  app.post('/api/complaints', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertComplaintSchema.parse({
        ...req.body,
        userId
      });

      // Categorize complaint using AI
      const analysis = await categorizeComplaint(validatedData.description);
      
      const complaint = await storage.createComplaint({
        ...validatedData,
        priority: analysis.priority,
      });

      res.json({ complaint, suggestedActions: analysis.suggestedActions });
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({ message: "Failed to create complaint" });
    }
  });

  app.get('/api/complaints', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const complaints = await storage.getUserComplaints(userId);
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.get('/api/complaints/:id', isAuthenticated, async (req: any, res) => {
    try {
      const complaintId = parseInt(req.params.id);
      const complaint = await storage.getComplaint(complaintId);
      
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }
      
      res.json(complaint);
    } catch (error) {
      console.error("Error fetching complaint:", error);
      res.status(500).json({ message: "Failed to fetch complaint" });
    }
  });

  // Community routes
  app.get('/api/community/posts', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const posts = await storage.getCommunityPosts(
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post('/api/community/posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCommunityPostSchema.parse({
        ...req.body,
        userId
      });
      
      const post = await storage.createCommunityPost(validatedData);
      res.json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  app.post('/api/community/posts/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.togglePostLike(postId, userId);
      res.json({ message: "Like toggled successfully" });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.post('/api/community/posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const validatedData = insertCommunityPostCommentSchema.parse({
        postId,
        userId,
        content: req.body.content
      });
      
      const comment = await storage.addPostComment(validatedData);
      res.json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  app.get('/api/community/posts/:id/comments', async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Initial data seeding (run once)
  app.post('/api/seed', async (req, res) => {
    try {
      // Seed legal categories
      const categories = [
        { name: "Family Law", description: "Marriage, divorce, custody, adoption", icon: "fas fa-home" },
        { name: "Labor Law", description: "Employment rights, wages, working conditions", icon: "fas fa-briefcase" },
        { name: "Consumer Rights", description: "Product defects, service issues, warranties", icon: "fas fa-shield-alt" },
        { name: "Education Rights", description: "School admission, scholarships, educational policies", icon: "fas fa-graduation-cap" },
        { name: "Property Law", description: "Real estate, rental agreements, property disputes", icon: "fas fa-building" },
        { name: "Criminal Law", description: "Criminal offenses, bail, legal procedures", icon: "fas fa-gavel" },
      ];

      for (const category of categories) {
        await storage.createLegalCategory(category);
      }

      // Seed sample articles
      const articles = [
        {
          categoryId: 2, // Labor Law
          title: "Understanding Your Rights as a Worker",
          content: "Every worker in India has fundamental rights under various labor laws. This includes the right to minimum wages, safe working conditions, and reasonable working hours. The Minimum Wages Act, 1948 ensures that workers receive fair compensation for their work. The Factories Act, 1948 provides guidelines for working hours, overtime pay, and workplace safety. Workers are entitled to overtime pay at double the regular rate for work beyond 8 hours per day or 48 hours per week.",
          summary: "Learn about minimum wage, working hours, and workplace safety under Indian labor laws."
        },
        {
          categoryId: 3, // Consumer Rights
          title: "Consumer Protection Act 2019",
          content: "The Consumer Protection Act 2019 replaced the earlier 1986 Act and provides stronger protection for consumers. Key features include the establishment of the Central Consumer Protection Authority (CCPA), product liability provisions, and expanded definition of consumers to include online transactions. Consumers have the right to seek compensation for defective products, deficient services, and unfair trade practices. The Act also covers e-commerce transactions and provides mechanisms for class action suits.",
          summary: "New updates and how they affect your consumer rights under the 2019 Act."
        }
      ];

      for (const article of articles) {
        await storage.createLegalArticle(article);
      }

      res.json({ message: "Data seeded successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
