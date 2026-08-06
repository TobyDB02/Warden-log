module.exports = (err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        error:
            err.status
                ? err.message
                : 'An unexpected error occurred'
    });
};