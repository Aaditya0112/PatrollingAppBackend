import { addCrimeArea, deleteArea, getAllCrimeAreas, getCrimeArea, updateAreaDetails } from "../controllers/crimeArea.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

async function crimeAreaRoutes(fastify, options){
    fastify.post("/crime-areas", {preHandler : verifyJWT}, addCrimeArea)
    fastify.get("/crime-areas", {preHandler : verifyJWT}, getAllCrimeAreas)
    fastify.get("/crime-areas/:areaId", {preHandler : verifyJWT}, getCrimeArea)
    fastify.patch("/crime-areas/:areaId", {preHandler : verifyJWT}, updateAreaDetails)
    fastify.delete("/crime-areas/:areaId", {preHandler : verifyJWT}, deleteArea)

}

export default crimeAreaRoutes;