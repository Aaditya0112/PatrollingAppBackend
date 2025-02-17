import { getUsers, getUserDetails, updateUserDetails, changePassword, deleteUser } from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

async function usersRoutes(fastify, options) {

    fastify.addHook('preHandler', verifyJWT)

    fastify.get("/users", getUsers);
    fastify.get("/users/:userId", getUserDetails);
    fastify.patch("/users/:userId", updateUserDetails);
    fastify.post("/users/change-password", changePassword)
    fastify.delete("/users/:userId", deleteUser);
}

// Export as a Fastify plugin
export default usersRoutes;