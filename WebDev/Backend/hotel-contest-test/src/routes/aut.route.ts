import { Router } from "express";
import { signInController, loginController } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/signup", signInController);
authRouter.post("/login", loginController);

export default authRouter;
