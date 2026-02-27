module.exports = (model) => {
    const add = async ({ data, options }) => {
        return model.create(data, options);
    }

    const update = async ({ data, options }) => {
        return model.update(data, options);
    }

    const destroy = async (options) => {
        return model.destroy(options);
    }

    const find = async (options) => {
        return model.findOne(options);
    }

    const findAll = async (options) => {
        return model.findAll(options);
    }

    const findById = async ({ id, options }) => {
        return model.findByPk(id, options)
    }

    return {
        add,
        update,
        destroy,
        find,
        findAll,
        findById
    }
}