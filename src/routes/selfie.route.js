import { getSelfies, sendSelfie, verifySelfie } from "../controllers/selfie.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

async function selfieRoutes(fastify, options){
    fastify.addHook('preHandler', verifyJWT)

    fastify.post("/selfies", {preHandler:  upload.single('selfie')}, sendSelfie);
    fastify.get("/selfies", getSelfies);
    fastify.patch("/selfies/:selfieId/verify", verifySelfie)
}

export default selfieRoutes;