import express from "express"
import cors from "cors"
import Fastify from "fastify";
import fastifyExpress from "@fastify/express"


const fastify = Fastify({
    logger: true
})

await fastify.register(fastifyExpress)


fastify.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true   
}))
// fastify.get('/', function (request, reply) {
//     reply.send({ hello: 'world' })
//   })

export {fastify};