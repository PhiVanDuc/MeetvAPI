module.exports = ({ status, message, data = {}, errors = [] }) => {
    const error = new Error(message);
    error.status = status ? status : 500;
    
    if (errors.length > 0) error.errors = errors;
    if (Object.keys(data).length > 0) error.data = data;
    
    throw error;
}