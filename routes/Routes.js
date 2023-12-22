import express from "express";
import user from "../controller/auth.js";
import Tree from "../controller/Tree.js";
import { verifyRequest } from "../middleware/middleware.js";
const Router = express.Router();

Router.post("/login", user.login);
Router.post("/register", user.register);
Router.get("/verify", user.verifyAndSendMail);
Router.get("/logout", user.logout);
Router.get("/pw-reset-mail", user.resetPasswordMail);
Router.post("/reset-password", user.resetPasswordFromCode);
Router.post("/adopt", verifyRequest, user.adoptTree);
Router.get("/adopted-trees", verifyRequest, user.getAdoptedTrees);
Router.get("/users", user.getAllUsers);
Router.get("/produce", verifyRequest, user.getProduceShare);


Router.post("/addTree", Tree.addTree);
Router.get("/userTrees", Tree.getAdoptedByUser);
Router.put('/update-produce', Tree.updateProduce);
Router.get("/trees", Tree.getAllTrees);
Router.get("/ProduceShareBySpecies", Tree.getProduceShareBySpecies);

export default Router;
