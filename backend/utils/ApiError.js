function ApiError(res, statusCode, message, messageType) {
    return res.status(statusCode).json({
        success: false,
        message: message,
        messageType: messageType
    });
}
export default ApiError