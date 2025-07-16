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
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

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
  getComplaint(id: number): Promise<Complaint | undefined>;
  updateComplaintStatus(id: number, status: string): Promise<void>;
  
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
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [result] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return result;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db
      .insert(messages)
      .values(message)
      .returning();
    return result;
  }

  async getConversationMessages(conversationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Legal category operations
  async createLegalCategory(category: InsertLegalCategory): Promise<LegalCategory> {
    const [result] = await db
      .insert(legalCategories)
      .values(category)
      .returning();
    return result;
  }

  async getLegalCategories(): Promise<LegalCategory[]> {
    return await db
      .select()
      .from(legalCategories)
      .orderBy(legalCategories.name);
  }

  // Legal article operations
  async createLegalArticle(article: InsertLegalArticle): Promise<LegalArticle> {
    const [result] = await db
      .insert(legalArticles)
      .values(article)
      .returning();
    return result;
  }

  async getLegalArticles(categoryId?: number): Promise<LegalArticle[]> {
    if (categoryId) {
      return await db
        .select()
        .from(legalArticles)
        .where(eq(legalArticles.categoryId, categoryId))
        .orderBy(desc(legalArticles.createdAt));
    }
    return await db
      .select()
      .from(legalArticles)
      .orderBy(desc(legalArticles.createdAt));
  }

  async searchLegalArticles(query: string): Promise<LegalArticle[]> {
    return await db
      .select()
      .from(legalArticles)
      .where(
        sql`${legalArticles.title} ILIKE ${'%' + query + '%'} OR ${legalArticles.content} ILIKE ${'%' + query + '%'}`
      )
      .orderBy(desc(legalArticles.createdAt));
  }

  // Complaint operations
  async createComplaint(complaint: InsertComplaint): Promise<Complaint> {
    const complaintNumber = `C${Date.now()}`;
    const [result] = await db
      .insert(complaints)
      .values({
        ...complaint,
        complaintNumber,
      })
      .returning();
    return result;
  }

  async getUserComplaints(userId: string): Promise<Complaint[]> {
    return await db
      .select()
      .from(complaints)
      .where(eq(complaints.userId, userId))
      .orderBy(desc(complaints.createdAt));
  }

  async getComplaint(id: number): Promise<Complaint | undefined> {
    const [complaint] = await db
      .select()
      .from(complaints)
      .where(eq(complaints.id, id));
    return complaint;
  }

  async updateComplaintStatus(id: number, status: string): Promise<void> {
    await db
      .update(complaints)
      .set({ status, updatedAt: new Date() })
      .where(eq(complaints.id, id));
  }

  // Community post operations
  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [result] = await db
      .insert(communityPosts)
      .values(post)
      .returning();
    return result;
  }

  async getCommunityPosts(limit = 20, offset = 0): Promise<CommunityPost[]> {
    return await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getCommunityPost(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db
      .select()
      .from(communityPosts)
      .where(eq(communityPosts.id, id));
    return post;
  }

  // Community post interaction operations
  async togglePostLike(postId: number, userId: string): Promise<void> {
    const [existingLike] = await db
      .select()
      .from(communityPostLikes)
      .where(
        and(
          eq(communityPostLikes.postId, postId),
          eq(communityPostLikes.userId, userId)
        )
      );

    if (existingLike) {
      // Remove like
      await db
        .delete(communityPostLikes)
        .where(eq(communityPostLikes.id, existingLike.id));
      
      // Decrement likes count
      await db
        .update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} - 1` })
        .where(eq(communityPosts.id, postId));
    } else {
      // Add like
      await db
        .insert(communityPostLikes)
        .values({ postId, userId });
      
      // Increment likes count
      await db
        .update(communityPosts)
        .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
        .where(eq(communityPosts.id, postId));
    }
  }

  async addPostComment(comment: InsertCommunityPostComment): Promise<CommunityPostComment> {
    const [result] = await db
      .insert(communityPostComments)
      .values(comment)
      .returning();

    // Increment comments count
    await db
      .update(communityPosts)
      .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
      .where(eq(communityPosts.id, comment.postId));

    return result;
  }

  async getPostComments(postId: number): Promise<CommunityPostComment[]> {
    return await db
      .select()
      .from(communityPostComments)
      .where(eq(communityPostComments.postId, postId))
      .orderBy(communityPostComments.createdAt);
  }
}

export const storage = new DatabaseStorage();
