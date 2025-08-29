
import fastify from "fastify";
import cors from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import fastifyMultipart from "@fastify/multipart";
import formbody from "@fastify/formbody";
import fastifySocketIO from "fastify-socket.io";
import fastifyRateLimit from "@fastify/rate-limit";

import setupSocket from "./socket/index.js";




const app = fastify({
  logger: true
});

// fastify.decorateRequest('io', null);
// fastify.addHook('onRequest', async (req, reply) => {
//   req.io = app.io;
// });

app.register(fastifySocketIO)

app.ready().then(() => {
  setupSocket(app);
}).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});



await app.register(import("@fastify/express"))


// Apply the rate limiting middleware to all requests
await app.register(fastifyRateLimit, {
  max: 200, // max requests per window
  timeWindow: "15 minutes", // window duration
  errorResponseBuilder: (req, context) => {
    return {
      statusCode: 429,
      error: "Too Many Requests",
      message: `You are only allowed ${context.max} requests per ${context.after}`,
    };
  },
});

// 🔹 CORS Configuration
await app.register(cors, {
  origin: process.env.CORS_ORIGIN,
  credentials: true
});

// 🔹 JSON & URL-Encoded Middleware
await app.register(formbody); /// For handling `application/x-www-form-urlencoded`

app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
  try {
    const json = JSON.parse(body);
    done(null, json);
  } catch (err) {
    done(err, undefined);
  }
});


await app.register(fastifyCookie, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 6
  }
});

// 🔹 Multipart/Form-data (if needed)
await app.register(fastifyMultipart)


app.get('/', (req, res) => {
  res.send(app.printRoutes())
});
app.get('/health', (req, res) => {
  res.status(200).send('OK');
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

await app.register(authRoutes, { prefix: '/api/v1/auth' });
await app.register(usersRoutes, { prefix: '/api/v1' })
await app.register(assignmentRoutes, { prefix: "/api/v1" })
await app.register(locationRoutes, { prefix: "/api/v1/gps" })
await app.register(crimeAreaRoutes, { prefix: "/api/v1" })
await app.register(selfieRoutes, { prefix: "/api/v1" })
await app.register(reportRoutes, { prefix: "/api/v1" })

export { app };