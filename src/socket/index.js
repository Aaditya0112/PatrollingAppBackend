
import { EventEnum } from "../constants.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import { ApiError } from "../utils/ApiError.js";
import { LocationLog } from "../models/locationLog.model.js";


async function setupSocket(fastify) {
    fastify.io.on('connection', async (socket) => {

        try {
            const token = socket.handshake.headers?.authorization;


            if (!token) {
                // Token is required for the socket to work
                throw new ApiError(401, "Un-authorized handshake. Token is missing");
            }

            const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET);

            const user = await User.findById(decodedToken?._id).select("-password")

            if (!user) {
                throw new ApiError(401, "Un-authorized handshake. Token is invalid");
            }
            socket.user = user;


            socket.join(user._id.toString());
            socket.emit(EventEnum.CONNECTED_EVENT)
            console.log("User connected. userId: ", user._id.toString());

            socket.on(EventEnum.LOCATION_UPDATE_EVENT, async ({ latitude, longitude }) => {
                console.log(longitude, latitude)
                const locationUpdated = await LocationLog.create({
                    officer: socket.user._id,
                    location: { type: "Point", coordinates: [longitude, latitude] }
                })
                const createdLocationLog = await LocationLog.findById(locationUpdated._id)
                if (!createdLocationLog) throw new ApiError(500, "unable to update location on server")
                // console.log
                //     ("location updated");
                socket.emit(EventEnum.LOCATION_LOG_EVENT, "Location Logged.")
            })

            socket.on(EventEnum.DISCONNECT_EVENT, () => {
                console.log("user has disconnected. userId: " + socket.user?._id);
                if (socket.user?._id) {
                    socket.leave(socket.user._id);
                }
            });


        } catch (error) {
            socket.emit(
                EventEnum.SOCKET_ERROR_EVENT,
                error?.message || "Something went wrong while connecting to the socket."
            );
            console.log("Something went wrong while connecting to the socket. ", error)
        }
    });
}

export default setupSocket;