import db from '../config/db_connect';
import { users } from '../models';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../utils';
import crypto from 'crypto';

export const getUserByEmail = async (email: string) => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

export const createOrUpdateGoogleUser = async (
  email: string,
  name: string,
  googleId: string,
) => {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    
    if (!existingUser) {
      return { success: false, message: 'User does not exist. Please sign up using email/password first.' };
    }

    // If user exists but doesn't have googleId, update it
    if (!existingUser.googleId) {
      await db
        .update(users)
        .set({ 
          googleId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existingUser.id));
        
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, existingUser.id))
        .limit(1);
        
      return { success: true, user: updatedUser };
    }
    
    // User exists and has googleId
    return { success: true, user: existingUser };
    
  } catch (error) {
    console.error('Error processing Google login:', error);
    return { success: false, message: 'Failed to process Google login' };
  }
};
