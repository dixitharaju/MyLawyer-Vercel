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

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  private mockUsers: User[] = [];
  private mockConversations: Conversation[] = [];
  private mockMessages: Message[] = [];
  private mockPosts: CommunityPost[] = [];

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.mockUsers.find(user => user.id === id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUserIndex = this.mockUsers.findIndex(user => user.id === userData.id);
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (existingUserIndex >= 0) {
      this.mockUsers[existingUserIndex] = user;
    } else {
      this.mockUsers.push(user);
    }
    
    return user;
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const newConversation: Conversation = {
      id: this.mockConversations.length + 1,
      userId: conversation.userId,
      title: conversation.title || null,
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
    return [
      { id: 1, name: "Civil Law", description: "Civil legal matters", icon: "scale", createdAt: new Date() },
      { id: 2, name: "Criminal Law", description: "Criminal legal matters", icon: "shield", createdAt: new Date() },
      { id: 3, name: "Family Law", description: "Family legal matters", icon: "heart", createdAt: new Date() },
    ];
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
    return [
      {
        id: 1,
        categoryId: 1,
        title: "Understanding Your Rights",
        content: "This is a sample legal article about understanding your rights...",
        summary: "Learn about your basic legal rights",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
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
      console.error('Error creating complaint:', error);
      throw new Error('Failed to create complaint');
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
      console.error('Error fetching user complaints:', error);
      return [];
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
      console.error('Error fetching complaint:', error);
      return undefined;
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
      console.error('Error updating complaint status:', error);
      throw new Error('Failed to update complaint status');
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
