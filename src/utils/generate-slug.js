const slugify = require("slugify");

module.exports = (string) => {
    if (!string) return;

    return slugify(
        string,
        {
            lower: true,
            strict: true,
            locale: "vi",
            trim: true
        }
    )
}