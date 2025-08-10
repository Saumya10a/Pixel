export function validate(schema, where = "body") {
    return (req, res, next) => {
        const result = schema.safeParse(req[where]);
        if (!result.success) {
            return res.status(400).json({ success: false, message: "Validation error", details: result.error.flatten() });
        }
        ;
        req[where] = result.data;
        next();
    };
}
