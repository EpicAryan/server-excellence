// controllers/topic.controller.ts
import { Request, Response } from "express";
import { topicSchema } from "../schemas/course.schema";
import {
    createTopic,
    findChapterById,
    getTopicsByChapterId,
    updateTopic,
    deleteTopic,
    uploadPdfToCloudinary,
    deleteFileFromCloudinary,
    getTopicById,
    getTopicsFiltered,
    updateTopicStatusById
} from "../services";

export const addTopic = async (req: Request, res: Response): Promise<void> => {
    let pdfUrl: string | null = null;
    try {
        const { chapterId, topicName, isActive } = req.body;
        const numericChapterId = Number(chapterId);
     
        if (isNaN(numericChapterId)) {
            res.status(400).json({ message: "Invalid chapter ID" });
            return;
        }
        
        const existingChapter = await findChapterById(numericChapterId);
        if (existingChapter.length === 0) {
          res.status(404).json({ message: 'Chapter not found' });
          return;
        }
        
        // Get chapter name
        const chapterName = existingChapter[0].chapterName;

        if (req.file) {
          pdfUrl = await uploadPdfToCloudinary(
            req.file.buffer, 
            req.file.originalname,
            numericChapterId,
            chapterName
          );
        }

        const topicData = {
            topicName,
            chapterId: numericChapterId,
            pdfUrl,
            isActive: isActive === "true" || isActive === true,
        };

        // Validate input data
        const validationResult = topicSchema.safeParse(topicData);
        if (!validationResult.success) {
            if (pdfUrl) {
                await deleteFileFromCloudinary(pdfUrl);
            }
            res.status(400).json({
                errors: validationResult.error.format(),
            });
            return;
        }

        if (existingChapter.length === 0) {
          if (pdfUrl) {
            await deleteFileFromCloudinary(pdfUrl);
          }
            res.status(404).json({ message: "Chapter not found" });
            return;
        }

        // Insert topic
        const newTopic = await createTopic(validationResult.data);

        res.status(201).json({
            message: "Topic added successfully",
            data: newTopic[0],
        });
        return;
    } catch (error) {
      if (pdfUrl) {
        try {
          await deleteFileFromCloudinary(pdfUrl);
        } catch (cloudinaryError) {
          console.error('Error deleting file from Cloudinary:', cloudinaryError);
        }
      }
        console.error("Error adding topic:", error);
        res.status(500).json({ message: "Server error" });

    }
};


export const getTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      chapterId,
      boardId,
      classId,
      subjectId,
      page,
      limit
    } = req.query;
    
    // Convert params to appropriate types
    const params: any = {};
    
    if (chapterId) {
      const numericChapterId = parseInt(chapterId as string, 10);
      if (!isNaN(numericChapterId)) {
        params.chapterId = numericChapterId;
      }
    }
    
    if (boardId) {
      const numericBoardId = parseInt(boardId as string, 10);
      if (!isNaN(numericBoardId)) {
        params.boardId = numericBoardId;
      }
    }
    
    if (classId) {
      const numericClassId = parseInt(classId as string, 10);
      if (!isNaN(numericClassId)) {
        params.classId = numericClassId;
      }
    }
    
    if (subjectId) {
      const numericSubjectId = parseInt(subjectId as string, 10);
      if (!isNaN(numericSubjectId)) {
        params.subjectId = numericSubjectId;
      }
    }
    
    if (search) {
      params.search = search as string;
    }
    
    if (page) {
      const numericPage = parseInt(page as string, 10);
      if (!isNaN(numericPage) && numericPage > 0) {
        params.page = numericPage;
      }
    }
    
    if (limit) {
      const numericLimit = parseInt(limit as string, 10);
      if (!isNaN(numericLimit) && numericLimit > 0) {
        params.limit = numericLimit;
      }
    }
    
    // If it's a legacy call looking for topics by chapterId only, use the original function
    if (Object.keys(params).length === 1 && params.chapterId) {
      const topics = await getTopicsByChapterId(params.chapterId);
      res.status(200).json(topics);
      return;
    }
    
    // Otherwise use the new filtered function
    const result = await getTopicsFiltered(params);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTopicById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const topicId = parseInt(req.params.id, 10);
        const numericTopicId = Number(topicId)
        if (isNaN(numericTopicId)) {
            res.status(400).json({ message: "Invalid topic ID" });
            return;
        }

        // Get existing topic to check if it has a PDF URL
        const existingTopics = await getTopicById(numericTopicId);
        if (existingTopics.length === 0) {
          res.status(404).json({ message: 'Topic not found' });
          return;
        }
       

        const topicData: Partial<typeof topicSchema._type> = {
            ...(req.body.topicName && { topicName: req.body.topicName }),
        };
        

        // Update the topic
        const updatedTopic = await updateTopic(topicId, topicData);

        if (updatedTopic.length === 0) {
            res.status(404).json({ message: "Topic not found" });
            return;
        }

        res.status(200).json({
            message: "Topic updated successfully",
            data: updatedTopic[0],
        });
    } catch (error) {
        console.error("Error updating topic:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const deleteTopicById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const topicId = parseInt(req.params.id, 10);
        const numberTopicId = Number(topicId);
        if (isNaN(numberTopicId)) {
            res.status(400).json({ message: "Invalid topic ID" });
            return;
        }

        const existingTopics = await getTopicById(numberTopicId);
    if (existingTopics.length === 0) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }

    const existingTopic = existingTopics[0];
        const deletedTopic = await deleteTopic(numberTopicId);

        if (deletedTopic.length === 0) {
            res.status(404).json({ message: "Topic not found" });
            return;
        }
        if (existingTopic.pdfUrl) {
          try {
            await deleteFileFromCloudinary(existingTopic.pdfUrl);
          } catch (cloudinaryError) {
            console.error('Error deleting file from Cloudinary:', cloudinaryError);
          }
        }

        res.status(200).json({
            message: "Topic deleted successfully",
            data: deletedTopic[0],
        });
    } catch (error) {
        console.error("Error deleting topic:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const toggleTopicStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topicId } = req.params;
    const { isActive } = req.body;

    if (!topicId || isNaN(Number(topicId))) {
      res.status(400).json({ message: 'Invalid topicId' });
      return;
    }

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ message: 'Invalid isActive value' });
      return;
    }

    const updated = await updateTopicStatusById(Number(topicId), isActive);
    res.status(200).json(updated[0]);
  } catch (error) {
    console.error('Error toggling topic status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const createTopicWithUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { chapterId, topicName, pdfUrl, isActive } = req.body;
        const numericChapterId = Number(chapterId);
     
        if (isNaN(numericChapterId)) {
            res.status(400).json({ message: "Invalid chapter ID" });
            return;
        }
        
        const existingChapter = await findChapterById(numericChapterId);
        if (existingChapter.length === 0) {
            res.status(404).json({ message: 'Chapter not found' });
            return;
        }

        const topicData = {
            topicName,
            chapterId: numericChapterId,
            pdfUrl,
            isActive: isActive === "true" || isActive === true,
        };

        // Validate input data
        const validationResult = topicSchema.safeParse(topicData);
        if (!validationResult.success) {
            res.status(400).json({
                errors: validationResult.error.format(),
            });
            return;
        }

        // Insert topic
        const newTopic = await createTopic(validationResult.data);

        res.status(201).json({
            message: "Topic created successfully",
            data: newTopic[0],
        });
        return;
    } catch (error) {
        console.error("Error creating topic:", error);
        res.status(500).json({ message: "Server error" });
    }
};
