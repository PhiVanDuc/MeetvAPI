const unitToMs = {
    seconds: 1000,
    minutes: 60 * 1000,
    hours: 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
};

module.exports = ({ time, unit = "minutes" }) => {
    return Date.now() + time * unitToMs[unit];
}