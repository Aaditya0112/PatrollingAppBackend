import { getLogs, updateGPS } from "../controllers/location.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

async function locationRoutes(fastify, options) {
    fastify.post("/update", {preHandler : verifyJWT}, updateGPS)
    fastify.get("/logs", {preHandler : verifyJWT}, getLogs)
}

export default locationRoutes;