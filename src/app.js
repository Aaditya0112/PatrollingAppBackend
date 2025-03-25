
import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";
import formbody from "@fastify/formbody"; 
import fastifySocketIO from "fastify-socket.io";
import rateLimit from "express-rate-limit";

import setupSocket from "./socket/index.js";




const app = fastify({
  logger:true
});



await app.register(fastifySocketIO)

await app.ready().then(() => {
  setupSocket(app);
}).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});



await app.register(import("@fastify/express"))


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator: (req, res) => {
      return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
    },
    handler: (_, __, ___, options) => {
      throw new ApiError(
        options.statusCode || 500,
        `There are too many requests. You are only allowed ${
          options.max
        } requests per ${options.windowMs / 60000} minutes`
      );
    },
  });
  
  // Apply the rate limiting middleware to all requests
// await app.register(limiter);

// 🔹 CORS Configuration
await app.register(cors, {
    origin: process.env.CORS_ORIGIN,
    credentials: true
});

// 🔹 JSON & URL-Encoded Middleware
await app.register(formbody); /// For handling `application/x-www-form-urlencoded`

await app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
    try {
        const json = JSON.parse(body);
        done(null, json);
    } catch (err) {
        done(err, undefined);
    }
});

// 🔹 Cookie Parser
await app.register(fastifyCookie);

// 🔹 Multipart/Form-data (if needed)
await app.register(fastifyMultipart)


app.get('/', (req, res) => {
    res.send(server.printRoutes())
});

import authRoutes from "./routes/authentication.route.js";
import usersRoutes from "./routes/users.route.js";
import assignmentRoutes from "./routes/assignments.route.js";
import locationRoutes from "./routes/location.route.js";
import crimeAreaRoutes from "./routes/crimeArea.route.js";
import selfieRoutes from "./routes/selfie.route.js";
import reportRoutes from "./routes/report.route.js";

// import setupSocket from "./controllers/socket.controller.js";
// setupSocket(socketServer)

await app.register(authRoutes, {prefix : '/api/v1/auth'});
await app.register(usersRoutes, {prefix : '/api/v1'})
await app.register(assignmentRoutes, {prefix : "/api/v1"})
await app.register(locationRoutes, {prefix : "/api/v1/gps"})
await app.register(crimeAreaRoutes, {prefix : "/api/v1"})
await app.register(selfieRoutes, {prefix : "/api/v1"})
await app.register(reportRoutes, {prefix : "/api/v1"})

export {app};