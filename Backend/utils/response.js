export const successResponse = (res, status = 200, message, data = {}) => {
    res.status(status).json({
        success: true,
        message,
        data,
    });
};