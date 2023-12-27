import jwt from "jsonwebtoken";

// CSR_AUTH_TOKEN is the name of the cookie that will be sent to the client
const CSR_AUTH_TOKEN = process.env.CSR_AUTH_TOKEN;

// Check if the request has a cookie with the CSR_AUTH_TOKEN and veriify it.
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

