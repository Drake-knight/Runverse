import jwt from "jsonwebtoken";

const CSR_AUTH_TOKEN = process.env.CSR_AUTH_TOKEN;

export const verifyRequest = (req, res, next) => {
    try {
        const payload = jwt.verify(
            req.cookies[CSR_AUTH_TOKEN],
            process.env.SECRET
        );
        res.locals = payload;
        return next();
    } catch (error) {
        console.error(error);
        return res.status(400).send("Unauthorized Request");
    }
};

