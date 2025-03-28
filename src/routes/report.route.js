import { submitReport } from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

async function reportRoutes(fastify, options){
    fastify.addHook('preHandler', verifyJWT)

    fastify.post("/report", submitReport);
}

export default reportRoutes;