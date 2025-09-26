import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Remove or comment out this line:
// import replitAuth from './replitAuth';
import { generateLegalResponse, categorizeComplaint, generateConversationTitle } from "./services/openai";
import { generateEnhancedLegalResponse } from "./services/legalBot";
import { insertConversationSchema, insertMessageSchema, insertComplaintSchema, insertCommunityPostSchema, insertCommunityPostCommentSchema } from "@shared/schema";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



export async function registerRoutes(app: Express): Promise<Server> {
  // Check if dist/public exists (Vite build output), if not, we're in development mode
  const clientDistPath = path.join(__dirname, "../dist/public");
  const fs = await import('fs');
  
  // Serve static files only if they exist
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });

  // Authentication middleware
  app.use((req: any, res: any, next: any) => {
    // Check if user is authenticated via session
    if (req.session?.userId) {
      req.user = { claims: { sub: req.session.userId } };
      return next();
    }
    
    // Check for Authorization header with Bearer token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = authHeader.split(' ')[1];
      if (userId) {
        req.user = { claims: { sub: userId } };
        return next();
      }
    }
    
    // For development purposes only, set a default user if not authenticated
    // In production, you would redirect to login or return 401 Unauthorized
    // Comment out the default user to enforce authentication
    // req.user = { claims: { sub: 'user-123456' } };
    next();
  });

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

  // Signup route
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const signupData = req.body;
      
      // Validate required fields
      if (!signupData.email || !signupData.password || !signupData.firstName || !signupData.lastName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await storage.authenticateUser(signupData.email, "");
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Create user in MongoDB
      const newUser = await storage.createUserFromSignup(signupData);
      
      res.status(201).json({ 
        message: "User created successfully", 
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isVerified: newUser.isVerified
        }
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user ID in session
      if (req.session) {
        req.session.userId = user.id;
      }

      res.json({ 
        success: true, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Logout route
  app.post('/api/auth/logout', (req: any, res) => {
    // Clear the session
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.json({ success: true });
      });
    } else {
      res.json({ success: true });
    }
  });

  // Chat routes
  app.post('/api/chat/conversations', async (req: any, res) => {
    try {
      const conversationData = req.body;
      const userId = req.user.claims.sub;
      
      console.log('Creating conversation with userId:', userId);
      console.log('Conversation data:', conversationData);
      
      const conversation = await storage.createConversation({
        ...conversationData,
        userId
      });
      
      console.log('Conversation created:', conversation);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get('/api/chat/conversations', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log('Fetching conversations for user:', userId);
      console.log('User object:', req.user);
      
      const conversations = await storage.getUserConversations(userId);
      console.log('Conversations found:', conversations.length);
      
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post('/api/chat/conversations/:id/messages', async (req: any, res) => {
    try {
      const { id } = req.params;
      const messageData = req.body;
      const userId = req.user.claims.sub;
      
      console.log('Creating message for conversation:', id);
      console.log('Message data:', messageData);
      console.log('User ID:', userId);
      
      // Create the user message
      const userMessage = await storage.createMessage({
        conversationId: parseInt(id),
        role: "user",
        content: messageData.content
      });
      
      console.log('User message created:', userMessage);
      
      // Get conversation history for context
      const conversationMessages = await storage.getConversationMessages(parseInt(id));
      console.log('Conversation history length:', conversationMessages.length);
      const conversationHistory = conversationMessages.map(msg => `${msg.role}: ${msg.content}`);
      
      // Generate AI response using the legal bot
      let aiResponse: string;
      try {
        console.log('Generating AI response...');
        aiResponse = await generateEnhancedLegalResponse(messageData.content, conversationHistory);
        console.log('AI response generated successfully');
      } catch (aiError) {
        console.error("AI response generation error:", aiError);
        aiResponse = "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
      }
      
      // Create the AI assistant message
      const assistantMessage = await storage.createMessage({
        conversationId: parseInt(id),
        role: "assistant",
        content: aiResponse
      });
      
      console.log('Assistant message created:', assistantMessage);
      
      // Return both messages
      res.status(201).json({
        userMessage,
        assistantMessage
      });
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  app.get('/api/chat/conversations/:id/messages', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      console.log('Fetching messages for conversation:', id);
      console.log('User ID:', userId);
      
      const messages = await storage.getConversationMessages(parseInt(id));
      console.log('Messages found:', messages.length);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Legal library routes
  app.get('/api/legal/categories', async (req, res) => {
    try {
      const categories = await storage.getLegalCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching legal categories:", error);
      res.status(500).json({ error: "Failed to fetch legal categories" });
    }
  });

  app.get('/api/legal/articles', async (req, res) => {
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

  // Complaint routes
  app.post('/api/complaints', async (req: any, res) => {
    try {
      const complaintData = req.body;
      const userId = req.user.claims.sub;
      
      const complaint = await storage.createComplaint({
        ...complaintData,
        userId
      });
      
      res.status(201).json(complaint);
    } catch (error) {
      console.error("Error creating complaint:", error);
      res.status(500).json({ error: "Failed to create complaint" });
    }
  });

  app.get('/api/complaints', async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const complaints = await storage.getUserComplaints(userId);
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      res.status(500).json({ error: "Failed to fetch complaints" });
    }
  });
  
  // Lawyer routes
  app.get('/api/lawyer/complaints', isAuthenticated, async (req: any, res) => {
    try {
      // Get the user to check if they are a lawyer
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'lawyer') {
        return res.status(403).json({ error: "Access denied. Only lawyers can access this endpoint." });
      }
      
      const complaints = await storage.getAllComplaints();
      res.json(complaints);
    } catch (error) {
      console.error("Error fetching all complaints:", error);
      res.status(500).json({ error: "Failed to fetch complaints" });
    }
  });
  
  app.put('/api/lawyer/complaints/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'lawyer') {
        return res.status(403).json({ error: "Access denied. Only lawyers can update complaint status." });
      }
      
      await storage.updateComplaintStatus(id, status);
      res.json({ success: true, message: "Complaint status updated successfully" });
    } catch (error) {
      console.error("Error updating complaint status:", error);
      res.status(500).json({ error: "Failed to update complaint status" });
    }
  });

  app.get('/api/complaints/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const complaint = await storage.getComplaint(id);
      
      if (!complaint) {
        return res.status(404).json({ error: "Complaint not found" });
      }
      
      res.json(complaint);
    } catch (error) {
      console.error("Error fetching complaint:", error);
      res.status(500).json({ error: "Failed to fetch complaint" });
    }
  });

  // Community routes
  app.get('/api/community/posts', async (req, res) => {
    try {
      const { limit = 20, offset = 0 } = req.query;
      const posts = await storage.getCommunityPosts(parseInt(limit as string), parseInt(offset as string));
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ error: "Failed to fetch community posts" });
    }
  });

  app.post('/api/community/posts', async (req: any, res) => {
    try {
      const postData = req.body;
      const userId = req.user.claims.sub;
      
      const post = await storage.createCommunityPost({
        ...postData,
        userId
      });
      
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ error: "Failed to create community post" });
    }
  });

  app.post('/api/community/posts/:id/like', async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      await storage.togglePostLike(parseInt(id), userId);
      res.json({ message: "Post like toggled successfully" });
    } catch (error) {
      console.error("Error toggling post like:", error);
      res.status(500).json({ error: "Failed to toggle post like" });
    }
  });

  app.post('/api/community/posts/:id/comments', async (req: any, res) => {
    try {
      const { id } = req.params;
      const commentData = req.body;
      const userId = req.user.claims.sub;
      
      const comment = await storage.addPostComment({
        postId: parseInt(id),
        userId,
        content: commentData.content
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  app.get('/api/community/posts/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getPostComments(parseInt(id));
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // Catch-all route for client-side routing (MUST BE LAST)
  app.get("*", (req, res) => {
    // Don't serve the main app for API routes
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    // If the production build doesn't exist, return a clear error instead of a placeholder page
    if (!fs.existsSync(clientDistPath)) {
      return res.status(404).json({ error: "Frontend build not found. Please run 'npm run build' to generate dist/public." });
    }

    // Serve the main app for all other routes
    res.sendFile(path.join(__dirname, "../dist/public/index.html"));
  });

  const httpServer = createServer(app);
  return httpServer;
}

const isAuthenticated = (req: any, res: any, next: any) => {
  // Check for user authentication - support both session and claims-based auth
  if (req.user?.claims?.sub || (req.session as any)?.userId) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};
