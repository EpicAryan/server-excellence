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
    getTopicById
} from "../services";

export const addTopic = async (req: Request, res: Response): Promise<void> => {
    let pdfUrl: string | null = null;
    try {
        // if (req.file) {
        //     pdfUrl = await uploadPdfToCloudinary(
        //         req.file.buffer,
        //         req.file.originalname
        //     );
        // }

        const { chapterId, topicName, isActive } = req.body;
        const numericChapterId = Number(chapterId);
     
        if (isNaN(numericChapterId)) {
            // if (pdfUrl) {
            //     await deleteFileFromCloudinary(pdfUrl);
            // }
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
        const chapterId = parseInt(req.query.chapterId as string, 10);

        if (isNaN(chapterId)) {
            res.status(400).json({ message: "Invalid chapter ID" });
            return;
        }

        const topics = await getTopicsByChapterId(chapterId);
        res.status(200).json(topics);
    } catch (error) {
        console.error("Error fetching topics:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const updateTopicById = async (
    req: Request,
    res: Response
): Promise<void> => {
    let newPdfUrl: string | undefined = undefined;
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
        const existingTopic = existingTopics[0];
        let chapterId = existingTopic.chapterId;
        let chapterName = ''; 
        // if (req.file) {
        //   newPdfUrl = await uploadPdfToCloudinary(req.file.buffer, req.file.originalname);
        // }
        
        // let chapterId = undefined;
        if (req.body.chapterId) {
          chapterId = parseInt(req.body.chapterId, 10);
          if (isNaN(chapterId)) {
            res.status(400).json({ message: 'Invalid chapter ID' });
            return;
          }
        }

        const chapterData = await findChapterById(chapterId);
        if (!chapterData) {
            res.status(404).json({ message: "Chapter not found" });
            return;
        }
        chapterName = chapterData[0].chapterName;
        
        if (req.file) {
          newPdfUrl = await uploadPdfToCloudinary(
            req.file.buffer,
            req.file.originalname,
            chapterId,
            chapterName
          );
        }

        const topicData: Partial<typeof topicSchema._type> = {
            ...(req.body.topicName && { topicName: req.body.topicName }),
            ...(chapterId  !== undefined && { chapterId  }),
            ...(newPdfUrl  !== undefined && { pdfUrl: newPdfUrl }),
            ...(req.body.isActive !== undefined && {
                isActive:
                    req.body.isActive === "true" || req.body.isActive === true,
            }),
        };
        

        // Update the topic
        const updatedTopic = await updateTopic(topicId, topicData);

        if (updatedTopic.length === 0) {
          if (newPdfUrl) {
            await deleteFileFromCloudinary(newPdfUrl);
          }
            res.status(404).json({ message: "Topic not found" });
            return;
        }
        
        if (newPdfUrl && existingTopic.pdfUrl && existingTopic.pdfUrl !== newPdfUrl) {
          try {
            await deleteFileFromCloudinary(existingTopic.pdfUrl);
          } catch (cloudinaryError) {
            console.error('Error deleting old file from Cloudinary:', cloudinaryError);
          }
        }

        res.status(200).json({
            message: "Topic updated successfully",
            data: updatedTopic[0],
        });
    } catch (error) {
      if (newPdfUrl) {
        try {
          await deleteFileFromCloudinary(newPdfUrl);
        } catch (cloudinaryError) {
          console.error('Error deleting file from Cloudinary:', cloudinaryError);
        }
      }
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
