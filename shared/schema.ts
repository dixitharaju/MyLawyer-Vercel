import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversations.id).notNull(),
  role: varchar("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legal categories
export const legalCategories = pgTable("legal_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legal articles
export const legalArticles = pgTable("legal_articles", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => legalCategories.id).notNull(),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Complaints
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  complaintNumber: varchar("complaint_number").unique().notNull(),
  type: varchar("type").notNull(),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  status: varchar("status").default("pending"), // pending, in_progress, resolved, closed
  priority: varchar("priority").default("medium"), // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community posts
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title"),
  content: text("content").notNull(),
  likesCount: integer("likes_count").default(0),
  commentsCount: integer("comments_count").default(0),
  isModerated: boolean("is_moderated").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community post likes
export const communityPostLikes = pgTable("community_post_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => communityPosts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community post comments
export const communityPostComments = pgTable("community_post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => communityPosts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  conversations: many(conversations),
  complaints: many(complaints),
  communityPosts: many(communityPosts),
  communityPostLikes: many(communityPostLikes),
  communityPostComments: many(communityPostComments),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, { fields: [conversations.userId], references: [users.id] }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, { fields: [messages.conversationId], references: [conversations.id] }),
}));

export const legalCategoriesRelations = relations(legalCategories, ({ many }) => ({
  articles: many(legalArticles),
}));

export const legalArticlesRelations = relations(legalArticles, ({ one }) => ({
  category: one(legalCategories, { fields: [legalArticles.categoryId], references: [legalCategories.id] }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  user: one(users, { fields: [complaints.userId], references: [users.id] }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, { fields: [communityPosts.userId], references: [users.id] }),
  likes: many(communityPostLikes),
  comments: many(communityPostComments),
}));

export const communityPostLikesRelations = relations(communityPostLikes, ({ one }) => ({
  post: one(communityPosts, { fields: [communityPostLikes.postId], references: [communityPosts.id] }),
  user: one(users, { fields: [communityPostLikes.userId], references: [users.id] }),
}));

export const communityPostCommentsRelations = relations(communityPostComments, ({ one }) => ({
  post: one(communityPosts, { fields: [communityPostComments.postId], references: [communityPosts.id] }),
  user: one(users, { fields: [communityPostComments.userId], references: [users.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertLegalCategorySchema = createInsertSchema(legalCategories).omit({ id: true, createdAt: true });
export const insertLegalArticleSchema = createInsertSchema(legalArticles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertComplaintSchema = createInsertSchema(complaints).omit({ id: true, complaintNumber: true, createdAt: true, updatedAt: true });
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, likesCount: true, commentsCount: true, isModerated: true, createdAt: true, updatedAt: true });
export const insertCommunityPostLikeSchema = createInsertSchema(communityPostLikes).omit({ id: true, createdAt: true });
export const insertCommunityPostCommentSchema = createInsertSchema(communityPostComments).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertLegalCategory = z.infer<typeof insertLegalCategorySchema>;
export type LegalCategory = typeof legalCategories.$inferSelect;
export type InsertLegalArticle = z.infer<typeof insertLegalArticleSchema>;
export type LegalArticle = typeof legalArticles.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPostLike = z.infer<typeof insertCommunityPostLikeSchema>;
export type CommunityPostLike = typeof communityPostLikes.$inferSelect;
export type InsertCommunityPostComment = z.infer<typeof insertCommunityPostCommentSchema>;
export type CommunityPostComment = typeof communityPostComments.$inferSelect;
