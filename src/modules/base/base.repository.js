module.exports = {
    paginate: async ({ model, page, limit, options = {} }) => {
        const offset = (page - 1) * limit;

        const { count, rows } = await model.findAndCountAll({
            limit,
            offset,
            distinct: true,
            order: [["createdAt", "DESC"]],
            ...options
        });

        return {
            rows,
            pagination: {
                page,
                limit,
                totalItems: count,
                totalPages: Math.ceil(count / limit)
            }
        }
    }
}