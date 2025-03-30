import { getAllReport, submitReport } from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

async function reportRoutes(fastify, options){
    fastify.addHook('preHandler', verifyJWT)

    fastify.post("/report", submitReport);
    fastify.get("/report", getAllReport);
}

export default reportRoutes;