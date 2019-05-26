
module.exports = app => {

    // routes
    app.get("/", (req, res) => {
        res.render("index");
    });

    // 	404
    app.get("*", (req, res) => {
        res.render("index");
    });

}