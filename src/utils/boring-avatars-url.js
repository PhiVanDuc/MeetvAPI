module.exports = ({ name: paramName }) => {
    const name = paramName || "default name";
    return `https://boring-avatars-api.vercel.app/api/avatar?name=${encodeURIComponent(name)}`;
}