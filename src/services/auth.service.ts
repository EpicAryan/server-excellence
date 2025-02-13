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

        const { password: _, createdAt, ...userWithoutPassword } = user;
        const accessToken = generateAccessToken(userWithoutPassword);
        const refreshToken = generateRefreshToken(userWithoutPassword);

        await db
            .insert(refreshTokens)
            .values({
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

        return { success: true, accessToken, refreshToken, userWithoutPassword };
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "Login failed" };
    }
};

// export const refreshUserToken = async (token: string) => {
//     const existingToken = await db
//         .select()
//         .from(refreshTokens)
//         .where(eq(refreshTokens.token, token));

//     if (!existingToken.length) {
//         return { success: false, message: "Invalid refresh token" };
//     }

//     try {
//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_REFRESH_SECRET || "refresh_secret"
//         ) as { userId: number };
//         const newAccessToken = generateAccessToken(decoded);

//         return { success: true, accessToken: newAccessToken };
//     } catch {
//         return { success: false, message: "Invalid token" };
//     }
// };

export const logoutUser = async (token: string) => {
    try {
        await db.delete(refreshTokens).where(eq(refreshTokens.token, token));
        return { success: true, message: "Logged out successfully" };
    } catch (error) {
        console.error("Logout error:", error);
        return { success: false, message: "Logout failed" };
    }
};
