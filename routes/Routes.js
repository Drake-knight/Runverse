import express from "express";
import auth from "../controller/auth.js";
import tree from "../controller/Tree.js";
import user from "../controller/user.js";
import { verifyRequest } from "../middleware/middleware.js";
const Router = express.Router();

Router.post("/login", auth.login);
Router.post("/register", auth.register);
Router.get("/verify", auth.verifyAndSendMail);
Router.get("/logout", auth.logout);
Router.get("/pw-reset-mail", auth.resetPasswordMail);
Router.post("/reset-password", auth.resetPasswordFromCode);


Router.post("/adopt", verifyRequest, user.adoptTree);
Router.get("/adopted-trees", verifyRequest, user.getAdoptedTrees);
Router.get("/users", user.getAllUsers);
Router.get("/produce", verifyRequest, user.getProduceShare);


Router.post("/addtree", tree.addTree);
Router.get("/usertrees", tree.getAdoptedByUser);
Router.put('/update-produce', tree.updateProduce);
Router.get("/trees", tree.getAllTrees);
Router.get("/ProduceShareBySpecies", tree.getProduceShareBySpecies);

export default Router;
