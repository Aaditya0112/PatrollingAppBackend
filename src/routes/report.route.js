import { downloadReport, getAllReport, submitReport, updateStatus, deleteReports } from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

async function reportRoutes(fastify, options){
    fastify.addHook('preHandler', verifyJWT)

    fastify.post("/report", submitReport);
    fastify.get("/report", getAllReport);
    fastify.patch("/report/:reportId", updateStatus)
    fastify.delete("/report/delete", deleteReports)
    fastify.get("/data", downloadReport)
}

export default reportRoutes;