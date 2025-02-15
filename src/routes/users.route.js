import { getUsers, getUserDetails, updateUserDetails, changePassword, deleteUser } from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

async function usersRoutes(fastify, options) {

    fastify.get("/users",{ preHandler: verifyJWT }, getUsers);
    fastify.get("/users/:userId",{ preHandler: verifyJWT }, getUserDetails);
    fastify.patch("/users/:userId",{ preHandler: verifyJWT }, updateUserDetails);
    fastify.post("/users/:userId/change-password", { preHandler: verifyJWT }, changePassword)
    fastify.delete("/users/:userId", { preHandler: verifyJWT }, deleteUser);
}

// Export as a Fastify plugin
export default usersRoutes;