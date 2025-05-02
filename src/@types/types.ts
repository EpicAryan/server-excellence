type UserWithoutPassword = {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface TopicInput {
    topicName: string;
    chapterId: number;
    pdfUrl?: string | null;
    isActive?: boolean;
  }

  interface FilterOptions {
    search?: string;
    boardId?: string;
    classId?: string;
    subjectId?: string;
    chapterId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }

  interface Topic {
    topicId: number;
    topicName: string;
    pdfUrl: string | null;
    isActive: boolean | null;
  };
  
  interface Chapter {
    chapterId: number;
    chapterName: string;
    topics: Topic[];
  };
  
  interface Subject  {
    subjectId: number;
    subjectName: string;
    chapters: Chapter[];
  };
  
  interface Board  {
    boardId: number;
    boardName: string;
  };
  
  interface ClassObj  {
    classId: number;
    className: string;
    board: Board;
    subjects: Subject[];
  };


export { UserWithoutPassword, TopicInput , FilterOptions , Topic, Chapter, Subject, Board, ClassObj};
