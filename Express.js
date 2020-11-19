const http = require('http');
const pathToRegex = require('path-to-regex');


function Express() {
    this.routers = {
        "GET": [

        ],
        "POST" : [

        ]
    };

    this.middlewares = [];

    this.server = http.createServer( (req, res) => {
        let handlersArr = [...this.middlewares];
        this.handleRequest(req, res).then(d => {
            const {req: cReq, res: cRes, handler} = d;
             handlersArr = [...handlersArr, handler];
            const next = () => {
                const nextMiddleware = handlersArr.shift();
                if(!nextMiddleware) return;

                nextMiddleware(cReq, cRes, next);
            };
            handlersArr.shift()(cReq, cRes, next);
        });
    });
}

Express.prototype.handleRequest = function(req, res) {
    return new Promise((resolve, reject) => {
        const requestType = req.method;
        const routeHandler = (this.routers[requestType].find(({ regEx }) => regEx.match(req.url)));

        if(!routeHandler){
            res.statusCode = 404;
            res.end();
            return;
        }

        const {handler, regEx} = routeHandler;
        req.routeParams = regEx.match(req.url);

        const requestTypesWithBody = ['POST', 'PUT'];

        if (!requestTypesWithBody.includes(requestType)){
            resolve({req, res, handler});
        }else {
            this.getBody(req).then(body => resolve({ req: {...req, body}, res, handler }));
        }
    })
};

Express.prototype.getBody = function(req) {
    return new Promise((resolve, reject) => {
        let body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            resolve(body);
        }).on('error', (err) => reject(err));
    });
};

Express.prototype.get = function(path, handler){
    const regEx = new pathToRegex(path);
    this.routers.GET.push({
        regEx,
        handler
    })
};

Express.prototype.post = function(path, handler){
    const regEx = new pathToRegex(path);
    this.routers.POST.push({
        regEx,
        handler
    })
};

Express.prototype.listen = function(port, cb){
    this.server.listen(port, cb);
};

Express.prototype.use = function (fn){
    this.middlewares.push(fn);
}

module.exports = {
    Express: Express
}