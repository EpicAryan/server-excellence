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

export { UserWithoutPassword, TopicInput , FilterOptions};
