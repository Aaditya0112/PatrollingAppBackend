
import { registerUser, loginUser, logoutUser, getUser, setFCMToken } from "../controllers/authentication.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function authRoutes(fastify, options) {
    fastify.post("/register", registerUser);
    fastify.post("/login", loginUser);
    fastify.post("/fcmtoken", { preHandler: verifyJWT }, setFCMToken)
    fastify.post("/check/:txt", asyncHandler(
        async (req, res) => {
            const { txt } = req.params;
            console.log( txt )

            console.log(req.body)
        }
    ))
    fastify.post("/logout",{ preHandler: verifyJWT }, logoutUser);
    fastify.get("/me", { preHandler: verifyJWT }, getUser);
}


export default authRoutes;



