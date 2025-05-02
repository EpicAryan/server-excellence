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
  

export const assignClassesToUser = async (userId: number, classIds: number[]) => {
  // Get existing class IDs for this user
  const existingClasses = await db.select({ classId: userClasses.classId })
    .from(userClasses)
    .where(eq(userClasses.userId, userId));
  
  const existingClassIds = existingClasses.map(c => c.classId);
  
  // Filter out classes that are already assigned to avoid duplicates
  const newClassIds = classIds.filter(id => !existingClassIds.includes(id));
  
  // If there are new classes to assign
  if (newClassIds.length > 0) {
    const values = newClassIds.map(classId => ({
      userId,
      classId,
      assignedAt: new Date(),
    }));
    
    return db.insert(userClasses)
      .values(values)
      .returning();
  }
  
  return [];
}

// export const getUserClasses = async (userId: number) => {
//   return db.select({
//     class: classes,
//   })
//     .from(userClasses)
//     .innerJoin(classes, eq(userClasses.classId, classes.classId))
//     .where(eq(userClasses.userId, userId));
// }
