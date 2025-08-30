import {
  users,
  conversations,
  messages,
  legalCategories,
  legalArticles,
  complaints,
  communityPosts,
  communityPostLikes,
  communityPostComments,
  type User,
  type UpsertUser,
  type InsertConversation,
  type Conversation,
  type InsertMessage,
  type Message,
  type InsertLegalCategory,
  type LegalCategory,
  type InsertLegalArticle,
  type LegalArticle,
  type InsertComplaint,
  type Complaint,
  type InsertCommunityPost,
  type CommunityPost,
  type InsertCommunityPostLike,
  type CommunityPostLike,
  type InsertCommunityPostComment,
  type CommunityPostComment,
} from "@shared/schema";
import { getDatabase } from "./db";
import { ObjectId } from "mongodb";
import crypto from "crypto";

// Define SignupData interface for user registration
interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  phoneNumber?: string;
  address?: string;
  barNumber?: string;
  specialization?: string;
  experience?: number | string;
  isVerified?: boolean;
}

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | undefined>;
  createUserFromSignup(signupData: SignupData): Promise<User>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: number): Promise<Message[]>;
  
  // Legal category operations
  createLegalCategory(category: InsertLegalCategory): Promise<LegalCategory>;
  getLegalCategories(): Promise<LegalCategory[]>;
  
  // Legal article operations
  createLegalArticle(article: InsertLegalArticle): Promise<LegalArticle>;
  getLegalArticles(categoryId?: number): Promise<LegalArticle[]>;
  searchLegalArticles(query: string): Promise<LegalArticle[]>;
  
  // Complaint operations
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  getUserComplaints(userId: string): Promise<Complaint[]>;
  getComplaint(id: string): Promise<Complaint | undefined>; // Changed to string for MongoDB
  updateComplaintStatus(id: string, status: string): Promise<void>; // Changed to string for MongoDB
  
  // Community post operations
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getCommunityPosts(limit?: number, offset?: number): Promise<CommunityPost[]>;
  getCommunityPost(id: number): Promise<CommunityPost | undefined>;
  
  // Community post interaction operations
  togglePostLike(postId: number, userId: string): Promise<void>;
  addPostComment(comment: InsertCommunityPostComment): Promise<CommunityPostComment>;
  getPostComments(postId: number): Promise<CommunityPostComment[]>;
}

export class DatabaseStorage implements IStorage {
  // Mock data storage for non-complaint operations
  private mockUsers: (User & { password?: string })[] = [
    {
      id: 'user-123456',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      profileImageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      role: 'user',
      phoneNumber: '+1 (555) 123-4567',
      address: '123 Main Street, Anytown, USA',
      barNumber: null,
      specialization: null,
      experience: null,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: 'password123' // Default password for testing
    },
    {
      id: 'lawyer-789012',
      email: 'jane.smith@lawfirm.com',
      firstName: 'Jane',
      lastName: 'Smith',
      profileImageUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      role: 'lawyer',
      phoneNumber: '+1 (555) 987-6543',
      address: '456 Legal Avenue, Lawtown, USA',
      barNumber: 'BAR12345',
      specialization: 'Family Law',
      experience: 8,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: 'password123' // Default password for testing
    }
  ];
  private mockConversations: Conversation[] = [];
  private mockMessages: Message[] = [];
  private mockPosts: CommunityPost[] = [];
  private mockComplaints: Complaint[] = [];
  private mockLegalCategories: LegalCategory[] = [
    { id: 1, name: 'Civil Law', description: 'Civil legal matters', icon: '⚖️', createdAt: new Date() },
    { id: 2, name: 'Criminal Law', description: 'Criminal legal matters', icon: '🚨', createdAt: new Date() },
    { id: 3, name: 'Family Law', description: 'Family and matrimonial matters', icon: '👨‍👩‍👧‍👦', createdAt: new Date() }
  ];
  private mockLegalArticles: LegalArticle[] = [
    { 
      id: 1, 
      categoryId: 1, 
      title: 'Understanding Civil Law', 
      content: 'Civil law deals with disputes between individuals...', 
      summary: 'Introduction to civil law',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    try {
      const db = await getDatabase();
      const collection = db.collection('lega_users');
      
      const user = await collection.findOne({ id });
      if (user) {
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl || null,
          role: user.role || 'user',
          phoneNumber: user.phoneNumber || null,
          address: user.address || null,
          barNumber: user.barNumber || null,
          specialization: user.specialization || null,
          experience: user.experience || null,
          isVerified: user.isVerified || false,

          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date()
        };
      }
    } catch (error) {
      console.error('Database connection failed:', error);
      console.log('Falling back to mock data');
    }
    
    // Fallback to mock data
    return this.mockUsers.find(user => user.id === id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    try {
      const db = await getDatabase();
      const collection = db.collection('lega_users');
      
      // Check if user exists by email
      const existingUser = await collection.findOne({ email: userData.email });
      
      if (existingUser) {
        // Update existing user
        const updateData = {
          ...userData,
          updatedAt: new Date(),
        };
        
        await collection.updateOne(
          { email: userData.email },
          { $set: updateData }
        );
        
        return {
          id: existingUser.id,
          email: userData.email || existingUser.email,
          firstName: userData.firstName || existingUser.firstName,
          lastName: userData.lastName || existingUser.lastName,
          profileImageUrl: userData.profileImageUrl || existingUser.profileImageUrl,
          role: userData.role || existingUser.role,
          phoneNumber: userData.phoneNumber || existingUser.phoneNumber,
          address: userData.address || existingUser.address,
          barNumber: userData.barNumber || existingUser.barNumber,
          specialization: userData.specialization || existingUser.specialization,
          experience: userData.experience ? parseInt(userData.experience.toString()) : existingUser.experience,
          isVerified: userData.isVerified !== undefined ? userData.isVerified : existingUser.isVerified,

          createdAt: existingUser.createdAt,
          updatedAt: new Date(),
        } as User;
      } else {
        // Create new user
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = {
          id: userId,
          email: userData.email || null,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          profileImageUrl: userData.profileImageUrl || null,
          role: userData.role || "user",
          phoneNumber: userData.phoneNumber || null,
          address: userData.address || null,
          barNumber: userData.barNumber || null,
          specialization: userData.specialization || null,
          experience: userData.experience ? parseInt(userData.experience.toString()) : null,
          isVerified: userData.isVerified || false,
  
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await collection.insertOne(newUser);
        
        return newUser as User;
      }
    } catch (error) {
      console.log('Database connection failed, using mock data');
      // Fallback to mock data
      const mockUser: User = {
        id: `mock-user-${Date.now()}`,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: null,
        role: userData.role || 'user',
        phoneNumber: null,
        address: null,
        barNumber: null,
        specialization: null,
        experience: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockUsers.push(mockUser);
      return mockUser;
    }
  }

  async authenticateUser(email: string, password: string): Promise<User | undefined> {
    try {
      const db = await getDatabase();
      const collection = db.collection('lega_users');
      
      // Note: In a real application, you would hash the password and compare the hashes
      // For this demo, we're just checking if the email and password match directly
      // TODO: Implement proper password hashing using bcrypt for production
      const user = await collection.findOne({ email, password });
      
      if (user) {
        // Return user without password for security
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl || null,
          role: user.role || 'user',
          phoneNumber: user.phoneNumber || null,
          address: user.address || null,
          barNumber: user.barNumber || null,
          specialization: user.specialization || null,
          experience: user.experience || null,
          isVerified: user.isVerified || false,

          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date()
        };
      }
      return undefined;
    } catch (error) {
      console.error('Database connection failed:', error);
      // Fallback to mock data
      const mockUser = this.mockUsers.find(user => user.email === email && user.password === password);
      if (mockUser) {
        // Return user without password for security
        const { password, ...userWithoutPassword } = mockUser;
        return userWithoutPassword as User;
      }
      return undefined;
    }
  }

  async createUserFromSignup(userData: SignupData): Promise<User> {
    try {
      const db = await getDatabase();
      const collection = db.collection('lega_users');
      
      const id = crypto.randomUUID();
      const now = new Date();
      
      // TODO: For production, implement password hashing
      // const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const newUser = {
        id,
        email: userData.email,
        password: userData.password, // In production, store hashedPassword instead
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
        profileImageUrl: null,
        isVerified: userData.role === 'lawyer' ? false : true, // Lawyers need verification
        createdAt: now,
        updatedAt: now
      };
      
      // Add lawyer-specific fields if the role is lawyer
      if (userData.role === 'lawyer') {
        Object.assign(newUser, {
          phoneNumber: userData.phoneNumber || null,
          address: userData.address || null,
          barNumber: userData.barNumber || null,
          specialization: userData.specialization || null,
          experience: typeof userData.experience === 'string' ? parseInt(userData.experience) : userData.experience || null
        });
      }
      
      await collection.insertOne(newUser);
      
      // Return user without password for security
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword as User;
    } catch (error) {
      console.error('Failed to create user in database:', error);
      
      // Fallback to creating a mock user
      const id = crypto.randomUUID();
      const now = new Date();
      
      const newUser: User = {
        id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
        profileImageUrl: null,
        phoneNumber: userData.role === 'lawyer' ? userData.phoneNumber || null : null,
        address: userData.role === 'lawyer' ? userData.address || null : null,
        barNumber: userData.role === 'lawyer' ? userData.barNumber || null : null,
        specialization: userData.role === 'lawyer' ? userData.specialization || null : null,
        experience: userData.role === 'lawyer' ? (typeof userData.experience === 'string' ? parseInt(userData.experience) : userData.experience) || null : null,
        isVerified: userData.role === 'lawyer' ? false : true,
        createdAt: now,
        updatedAt: now
      };
      
      this.mockUsers.push({
        ...newUser,
        password: userData.password // Store password in mock data for authentication
      });
      
      return newUser;
    }
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const newConversation: Conversation = {
      id: this.mockConversations.length + 1,
      userId: conversation.userId,
      lawyerId: conversation.lawyerId || null,
      title: conversation.title || null,
      type: conversation.type || "ai",
      status: conversation.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockConversations.push(newConversation);
    return newConversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.mockConversations.filter(conv => conv.userId === userId);
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.mockConversations.find(conv => conv.id === id);
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const newMessage: Message = {
      id: this.mockMessages.length + 1,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      createdAt: new Date(),
    };
    this.mockMessages.push(newMessage);
    return newMessage;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return this.mockMessages.filter(msg => msg.conversationId === conversationId);
  }

  // Legal category operations
  async createLegalCategory(category: InsertLegalCategory): Promise<LegalCategory> {
    const newCategory: LegalCategory = {
      id: 1,
      name: category.name,
      description: category.description || null,
      icon: category.icon || null,
      createdAt: new Date(),
    };
    return newCategory;
  }

  async getLegalCategories(): Promise<LegalCategory[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection('legal_categories');
      const categories = await collection.find({}).toArray();
      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        createdAt: cat.createdAt || new Date(),
      })) as LegalCategory[];
    } catch (error) {
      console.log('Database connection failed, using mock data');
      return this.mockLegalCategories;
    }
  }

  // Legal article operations
  async createLegalArticle(article: InsertLegalArticle): Promise<LegalArticle> {
    const newArticle: LegalArticle = {
      id: 1,
      title: article.title,
      content: article.content,
      categoryId: article.categoryId,
      summary: article.summary || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return newArticle;
  }

  async getLegalArticles(categoryId?: number): Promise<LegalArticle[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection('legal_articles');
      const query = categoryId ? { categoryId } : {};
      const articles = await collection.find(query).toArray();
      return articles.map(article => ({
        id: article.id,
        categoryId: article.categoryId,
        title: article.title,
        content: article.content,
        summary: article.summary,
        createdAt: article.createdAt || new Date(),
        updatedAt: article.updatedAt || new Date(),
      })) as LegalArticle[];
    } catch (error) {
      console.log('Database connection failed, using mock data');
      return this.mockLegalArticles;
    }
  }

  async searchLegalArticles(query: string): Promise<LegalArticle[]> {
    return this.getLegalArticles();
  }

  // Complaint operations - Now using MongoDB
  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    try {
      const db = await getDatabase();
      const collection = db.collection('lega_complaint');
      
      const complaintNumber = `C${Date.now()}`;
      const newComplaint = {
        userId: complaint.userId,
        complaintNumber,
        type: complaint.type,
        subject: complaint.subject,
        description: complaint.description,
        status: "pending",
        priority: "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = await collection.insertOne(newComplaint);
      
      return {
        id: result.insertedId.toString(),
        userId: complaint.userId,
        complaintNumber,
        type: complaint.type,
        subject: complaint.subject,
        description: complaint.description,
        status: "pending",
        priority: "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Complaint;
    } catch (error) {
      console.log('Database connection failed, using mock data');
      // Fallback to mock data
      const mockComplaint: Complaint = {
        id: `complaint-${Date.now()}`,
        userId: complaint.userId,
        complaintNumber: `C${Date.now()}`,
        type: complaint.type,
        subject: complaint.subject,
        description: complaint.description,
        status: "pending",
        priority: "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.mockComplaints.push(mockComplaint);
      return mockComplaint;
    }
  }

  async getUserComplaints(userId: string): Promise<Complaint[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection('lega_complaint');
      
      const complaints = await collection.find({ userId }).toArray();
      return complaints.map(complaint => ({
        id: complaint._id.toString(),
        userId: complaint.userId,
        complaintNumber: complaint.complaintNumber,
        type: complaint.type,
        subject: complaint.subject,
        description: complaint.description,
        status: complaint.status || "pending",
        priority: complaint.priority || "medium",
        createdAt: complaint.createdAt || new Date(),
        updatedAt: complaint.updatedAt || new Date(),
      })) as Complaint[];
    } catch (error) {
      console.log('Database connection failed, using mock data');
      return this.mockComplaints.filter(complaint => complaint.userId === userId);
    }
  }

  async getComplaint(id: string): Promise<Complaint | undefined> {
    try {
      const db = await getDatabase();
      const collection = db.collection('lega_complaint');
      
      const objectId = new ObjectId(id);
      const complaint = await collection.findOne({ _id: objectId });
      if (complaint) {
        return {
          id: complaint._id.toString(),
          userId: complaint.userId,
          complaintNumber: complaint.complaintNumber,
          type: complaint.type,
          subject: complaint.subject,
          description: complaint.description,
          status: complaint.status || "pending",
          priority: complaint.priority || "medium",
          createdAt: complaint.createdAt || new Date(),
          updatedAt: complaint.updatedAt || new Date(),
        } as Complaint;
      }
      return undefined;
    } catch (error) {
      console.log('Database connection failed, using mock data');
      return this.mockComplaints.find(complaint => complaint.id === id);
    }
  }

  async updateComplaintStatus(id: string, status: string): Promise<void> {
    try {
      const db = await getDatabase();
      const collection = db.collection('lega_complaint');
      
      const objectId = new ObjectId(id);
      await collection.updateOne(
        { _id: objectId },
        { 
          $set: { 
            status, 
            updatedAt: new Date() 
          } 
        }
      );
    } catch (error) {
      console.log('Database connection failed, using mock data');
      const complaint = this.mockComplaints.find(c => c.id === id);
      if (complaint) {
        complaint.status = status;
        complaint.updatedAt = new Date();
      }
    }
  }

  // Community post operations
  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const newPost: CommunityPost = {
      id: this.mockPosts.length + 1,
      userId: post.userId,
      title: post.title || null,
      content: post.content,
      likesCount: 0,
      commentsCount: 0,
      isModerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockPosts.push(newPost);
    return newPost;
  }

  async getCommunityPosts(limit = 20, offset = 0): Promise<CommunityPost[]> {
    return this.mockPosts.slice(offset, offset + limit);
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    return this.mockPosts.find(post => post.id === id);
  }

  // Community post interaction operations
  async togglePostLike(postId: number, userId: string): Promise<void> {
    const post = this.mockPosts.find(p => p.id === postId);
    if (post && post.likesCount !== null) {
      post.likesCount += 1;
    }
  }

  async addPostComment(comment: InsertCommunityPostComment): Promise<CommunityPostComment> {
    const newComment: CommunityPostComment = {
      id: 1,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      createdAt: new Date(),
    };
    
    const post = this.mockPosts.find(p => p.id === comment.postId);
    if (post && post.commentsCount !== null) {
      post.commentsCount += 1;
    }
    
    return newComment;
  }

  async getPostComments(postId: number): Promise<CommunityPostComment[]> {
    return [];
  }
}

export const storage = new DatabaseStorage();
