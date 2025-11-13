const logCheck = (req, res, next) => {
    if (req.path === '/favicon.ico') {
        return next()
    }
    res.on('finish', () => {
        console.log(req.method, req.originalUrl, res.statusCode);
    })
    next()
}

export default logCheck;