module.exports = (fields) => {
    if (!fields || (typeof fields === "object" && Object.keys(fields).length === 0)) return {};
    const filter = {};

    for (const [key, value] of Object.entries(fields)) {
        if (!value) continue;

        if (typeof value === "string") {
            if (value.includes(",")) filter[key] = value.split(",").map(item => item.trim());
            else filter[key] = value.trim();
        }
        else filter[key] = value;
    }

    return filter;
}