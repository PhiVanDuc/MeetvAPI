module.exports = ({ seconds = 0, minutes = 0, hours = 0, days = 0, date }) => {
    if (date) return new Date(date);

    const now = Date.now();
    const duration =
        (seconds * 1000) +
        (minutes * 60 * 1000) +
        (hours * 60 * 60 * 1000) +
        (days * 24 * 60 * 60 * 1000);

    return new Date(now + duration);
};