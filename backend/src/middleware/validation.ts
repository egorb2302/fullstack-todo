import { NextFunction, Request, Response } from "express";
import { ZodError, ZodObject } from "zod";

type ValidationSource = 'body' | 'params' | 'query'

export const validate = (schema: ZodObject<any>, source: ValidationSource) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = await schema.parseAsync(req[source])
            
            if (source === 'params') {
                req.params = validatedData as any;
            } else if (source === 'query') {
                req.query = validatedData as any;
            } else {
                req.body = validatedData;
            }

            next()
        } catch (error) {
            if (error instanceof ZodError) {
                const flattened = error.flatten();

                res.status(400).json({
                    error: "Validation failed",
                    formErrors: flattened.formErrors,
                    fieldErrors: flattened.fieldErrors
                })
            } else {
                res.status(500).json({ error: "Internal server error" })
            }
        }
    }
}