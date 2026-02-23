module.exports = (model) => {
    const create = async ({ data, options }) => {
        return await model.create(data, options)
    }

    const update = async ({ id, data, options }) => {
        return model.update(data, {
            where: { id },
            ...options
        });
    }

    const destroy = async ({ id, options }) => {
        return model.destroy({
            where: { id },
            ...options
        });
    }

    const findAll = async (options) => {
        return model.findAll(options);
    }

    const findOne = async (options) => {
        return model.findOne(options);
    }

    const findById = async ({ id, options }) => {
        return model.findByPk(id, options);
    }

    return {
        create,
        update,
        destroy,
        findAll,
        findOne,
        findById
    }
}