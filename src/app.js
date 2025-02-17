import express from "express"
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";
import formbody from "@fastify/formbody"; 

import path from "path"

const server = Fastify({
    logger:true
});




// 🔹 CORS Configuration
await server.register(cors, {
    origin: process.env.CORS_ORIGIN,
    credentials: true
});

// 🔹 JSON & URL-Encoded Middleware
await server.register(formbody); // For handling `application/x-www-form-urlencoded`

server.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
    try {
        const json = JSON.parse(body);
        done(null, json);
    } catch (err) {
        done(err, undefined);
    }
});

// 🔹 Cookie Parser
await server.register(fastifyCookie);

// 🔹 Multipart/Form-data (if needed)


server.get('/', (req, res) => {
    res.send(server.printRoutes())
});

import authRoutes from "./routes/authentication.route.js";
import usersRoutes from "./routes/users.route.js";
import assignmentRoutes from "./routes/assignments.route.js";
import locationRoutes from "./routes/location.route.js";
import crimeAreaRoutes from "./routes/crimeArea.route.js";
import selfieRoutes from "./routes/selfie.route.js";

await server.register(authRoutes, {prefix : '/api/v1/auth'});
await server.register(usersRoutes, {prefix : '/api/v1'})
await server.register(assignmentRoutes, {prefix : "/api/v1"})
await server.register(locationRoutes, {prefix : "/api/v1/gps"})
await server.register(crimeAreaRoutes, {prefix : "/api/v1"})
await server.register(selfieRoutes, {prefix : "/api/v1"})

export {server};