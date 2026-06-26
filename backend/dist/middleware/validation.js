"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema, source) => {
    return async (req, res, next) => {
        try {
            const validatedData = await schema.parseAsync(req[source]);
            if (source === 'params') {
                req.params = validatedData;
            }
            else if (source === 'query') {
                req.query = validatedData;
            }
            else {
                req.body = validatedData;
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const flattened = error.flatten();
                res.status(400).json({
                    error: "Validation failed",
                    formErrors: flattened.formErrors,
                    fieldErrors: flattened.fieldErrors
                });
            }
            else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    };
};
exports.validate = validate;
