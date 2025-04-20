import db from "../config/db_connect";
import { users, classes, userClasses } from '../models';
import { eq, like} from 'drizzle-orm';

export const searchUsersByEmail = async (email: string) => {
    return db.select({
      id: users.id,
      email: users.email,
      username: users.username,
    })
      .from(users)
      .where(like(users.email, `%${email}%`))
      .limit(10);
  }


  export const getUserById = async (id: number) => {
    const results = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return results[0] || null;
  }
  
// User-Class services
export const assignClassesToUser = async (userId: number, classIds: number[]) => {
  // First, remove existing classes for this user (optional, depends on requirements)
  await db.delete(userClasses)
    .where(eq(userClasses.userId, userId));
  
  // Insert new class assignments
  const values = classIds.map(classId => ({
    userId,
    classId,
    assignedAt: new Date(),
  }));
  
  return db.insert(userClasses)
    .values(values)
    .returning();
}

export const getUserClasses = async (userId: number) => {
  return db.select({
    class: classes,
  })
    .from(userClasses)
    .innerJoin(classes, eq(userClasses.classId, classes.classId))
    .where(eq(userClasses.userId, userId));
}
