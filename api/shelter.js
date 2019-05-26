const fs = require("fs");

module.exports = app => {

    // send dataset to client
    app.get("/dataset", (req, res) => {
        fs.readFile("./dataset/shelters.json", "utf8", (err, data) => {
            if (err) throw err;
            res.send(data);
        });
    });
}