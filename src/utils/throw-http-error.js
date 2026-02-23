module.exports = ({ status, message, data = {} }) => {
    const error = new Error(message);
    error.status = status ? status : 500;
    
    if (Object.keys(data).length > 0) {
        error.data = data;
    }
    
    throw error;
}