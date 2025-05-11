import db from "../config/db_connect";
import { users, refreshTokens } from "../models";
import {
    hashPassword,
    comparePassword,
    generateAccessToken,
    generateRefreshToken,
} from "../utils";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

export const registerUser = async (
    username: string,
    email: string,
    password: string,
    role: string
) => {
    try {
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

        if (existingUser.length > 0) {
            return { success: false, message: "User already exists" };
        }

        const hashedPassword = await hashPassword(password);

        const [newUser] = await db
            .insert(users)
            .values({ username, email, password: hashedPassword, role })
            .returning();

        return { success: true, user: { id: newUser.id, username, email, role } };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, message: "Failed to register user" };
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            return { success: false, message: "User not found" };
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return { success: false, message: "Invalid credentials" };
        }

        await db
            .delete(refreshTokens)
            .where(eq(refreshTokens.userId, user.id));
            
        const { password: _, ...userWithoutPassword } = user;
        const accessToken = generateAccessToken(userWithoutPassword);
        const refreshToken = generateRefreshToken(userWithoutPassword);

        const sessionId = crypto.randomUUID();

        await db
            .insert(refreshTokens)
            .values({
                userId: user.id,
                sessionId: sessionId,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                createdAt: new Date(),
                updatedAt: new Date()
            });

        return { success: true, accessToken, sessionId, userWithoutPassword };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "Login failed" };
    }
};

export const refreshUserTokenBySessionId = async (sessionId: string) => {
    // Find the existing token in the database
    const existingTokens = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.sessionId, sessionId))
        .limit(1);

    if (!existingTokens.length) {
        return { success: false, message: "Invalid session or no refresh token found" };
    }

    const existingToken = existingTokens[0];

    try {
        // Verify the refresh token
        const decoded = jwt.verify(
            existingToken.token, // This is the actual refresh token stored in DB
            process.env.JWT_REFRESH_SECRET || "refresh_secret"
          ) as { userId: number };

        // Check if token is expired
        if (existingToken.expiresAt < new Date()) {
        // Delete expired token
            await db
                .delete(refreshTokens)
                .where(eq(refreshTokens.sessionId, sessionId));
            return { success: false, message: "Refresh token expired" };
        }

        // Get the user information for generating new tokens
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, decoded.userId))
            .limit(1);

        if (!user) {
            // Delete the token if user doesn't exist
            await db
                .delete(refreshTokens)
                .where(eq(refreshTokens.sessionId, sessionId));
                
            return { success: false, message: "User not found" };
        }

        // Create user object without sensitive data
        const { password: _, ...userWithoutPassword } = user;

        // Generate new tokens
        const newAccessToken = generateAccessToken(userWithoutPassword);
        const newRefreshToken = generateRefreshToken(userWithoutPassword);


        const newSessionId = sessionId;
        // Store the new refresh token
        await db
            .update(refreshTokens)
            .set({
                token: newRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                updatedAt: new Date()
            })
            .where(eq(refreshTokens.sessionId, sessionId));

        // Return both tokens
        return { 
            success: true, 
            accessToken: newAccessToken,
            sessionId: newSessionId,
            user: userWithoutPassword
        };
    } catch (error) {
        // If token verification fails, delete the token
        await db
            .delete(refreshTokens)
            .where(eq(refreshTokens.sessionId, sessionId));
            
        console.error("Token refresh error:", error);
        return { success: false, message: "Invalid token" };
    }
};

export const logoutUser = async (sessionId: string) => {
    try {
        await db.delete(refreshTokens).where(eq(refreshTokens.sessionId, sessionId));
        return { success: true, message: "Logged out successfully" };
    } catch (error) {
        console.error("Logout error:", error);
        return { success: false, message: "Logout failed" };
    }
};


export const getUserByIdMe = async (userId: Number) => {
    try {
        const numericUserId = Number(userId);
        if (isNaN(numericUserId)) {
            console.error('Invalid userId: not a number');
            null;
        }
      const result = await db.select().from(users).where(eq(users.id, numericUserId)).limit(1);
  
      if (result.length === 0) {
        return null;
      }
  
      const { password, ...safeUser } = result[0];
      return safeUser 
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  };
  