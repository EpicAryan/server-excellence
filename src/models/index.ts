import { users } from "./user.model";
import { access, accessRelations } from "./access.model";
import { notes, notesRelations } from "./note.model";
import { uploads, uploadsRelations } from "./upload.model";
import { refreshTokens } from "./refreshToken.model";
export * from './board.model';
export * from './class.model';
export * from './subject.model';
export * from './chapter.model';
export * from './topic.model';
export * from './userClasses.model'

export { users, access, accessRelations, notes, notesRelations, uploads, uploadsRelations, refreshTokens };
