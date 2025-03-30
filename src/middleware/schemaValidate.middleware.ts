import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate =
    (schema: ZodSchema) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsedInput = schema.safeParse(req.body);

            if (!parsedInput.success) {
                const errorMessages = parsedInput.error.errors.map((error) => ({
                    message: error.message,
                    path: error.path.join('.'), // Join the path array to a string
                }));
                res.status(400).json({ errors: errorMessages });
                return;
            }

            // Attach validated data to request object
            req.body = parsedInput.data;
            next(); // Call next to proceed to the next middleware/handler
        } catch (error) {
            // Handle unexpected errors within the middleware
            console.error("Validation middleware error:", error);
            res.status(500).json({ message: "Internal server error during validation" });
            return;
        }
    };
