import { createAssignment, deleteAssignment, getAllAssignments, getAssignment, updateAssignment } from "../controllers/assignments.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

async function assignmentRoutes(fastify, options) {
    fastify.post("/assignments", {preHandler : verifyJWT}, createAssignment)
    fastify.get("/assignments", {preHandler : verifyJWT}, getAllAssignments)
    fastify.get("/assignments/:assignmentId", {preHandler : verifyJWT}, getAssignment)
    fastify.patch("/assignments/:assignmentId", {preHandler : verifyJWT}, updateAssignment)
    fastify.delete("/assignments/:assignmentId", {preHandler : verifyJWT}, deleteAssignment)
}

export default assignmentRoutes;