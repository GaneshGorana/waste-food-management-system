function ApiResponse(res, statusCode, message, data, messageType) {
    return res.status(statusCode).json({
        success: true,
        message: message,
        data: data,
        messageType: messageType
    });
}
export default ApiResponse