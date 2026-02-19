module.exports = (status = 500, message = "", data = {}) => {
    const error = new Error(message);
    error.status = status;
    
    if (Object.keys(data).length > 0) {
        error.data = data;
    }
    
    throw error;
}