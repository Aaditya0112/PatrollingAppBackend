
import { registerUser, loginUser, logoutUser, getUser } from "../controllers/authentication.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

async function authRoutes(fastify, options) {
    fastify.post("/register", registerUser);
    fastify.post("/login", loginUser);
    fastify.post("/logout",{ preHandler: verifyJWT }, logoutUser);
    fastify.get("/me", { preHandler: verifyJWT }, getUser);
}


export default authRoutes;



