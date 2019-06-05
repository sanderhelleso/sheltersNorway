module.exports = (app) => {
	// routes
	app.get('/', (req, res) => {
		res.render('index');
	});

	app.get('/personvern', (req, res) => {
		res.render('privacyPolicy');
	});

	// 	404
	/*app.get("*", (req, res) => {
        res.render("index");
    });*/
};
