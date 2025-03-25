export const DB_NAME = "patrollingdb"

export const EventEnum = Object.freeze({
    // ? once user is ready to go
    CONNECTED_EVENT: "connected",
    // ? when user gets disconnected
    DISCONNECT_EVENT: "disconnect",
    // ? when user joins a socket room
    JOIN_CHAT_EVENT: "joinChat",

    MESSAGE_RECEIVED_EVENT: "messageReceived",
    // ? when there is new one on one chat, new group chat or user gets added in the group
    NEW_CHAT_EVENT: "newChat",
    // ? when there is an error in socket
    SOCKET_ERROR_EVENT: "socketError",
    // ? when participant stops typing
    STOP_TYPING_EVENT: "stopTyping",
    // ? when participant starts typing
    TYPING_EVENT: "typing",
    // ? when message is deleted
    MESSAGE_DELETE_EVENT: "messageDeleted",

    LOCATION_UPDATE_EVENT : "locationUpdate",

    LOCATION_LOG_EVENT : "locationLogged"
  });

export const AvailableChatEvents = Object.values(EventEnum);