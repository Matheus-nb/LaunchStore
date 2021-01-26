async function post(req, res, next) {
    const keys = Object.keys(req.body);

    for(key of keys) {
        if(req.body[key] == "") {
            return res.send("Porfavor, volte e preencha todos os campos!!");
        };
    };

    if(!req.files || req.files.length == 0) {
        return res.send("Please, send 1 image!");
    };

    next();
};

async function put(req, res, next) {
    const keys = Object.keys(req.body);

    for(key of keys) {
        if(req.body[key] == "" && key != "removed_files") {
            return res.send("Porfavor, volte e preencha todos os campos!!");
        };
    };

    next();
};

module.exports = {
    post,
    put
};