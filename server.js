global.__basedir = __dirname;

const {Express} = require("./Express");

const app = new Express();
app.get("/users/:group/:id", (req, rsp) => {
    rsp.setHeader("Content-Type", "application/json");

    rsp.write(JSON.stringify(req.routeParams));
    rsp.end();

});

app.post("createUser/", (req, rsp) => {
    rsp.setHeader("Content-Type", "application/json");
    rsp.write(JSON.stringify({works: true}))
    rsp.end();
});

app.use((req, res, next) => {
    next();
})

app.listen(3000, () => console.log("Server started on port 3000"));