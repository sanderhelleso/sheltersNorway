const nodemailer = require("nodemailer");

module.exports = app => {

    // new shelter form
    app.post("/form", (req, res) => {
        let formData = [];
        let getData = req.body.shelterData.split(",");
        getData.forEach(data => {
            formData.push(data);
        });

        // contact data
        let name = formData[0].split(": ")[1];
        let from = process.env.EMAIL_HOST;
        let to = process.env.EMAIL_HOST;
        let subject = "Innsendelse av tilfluktsrom";
        let message = "<h2>Nytt skjema sendt inn av: <b>" + name + "</b></h2><br><ul>";
        let count = 0;
        formData.forEach(data => {
            count++;
            // exclude name
            if (count > 1) {
                message += "<li><h3>" + data + "</h3></li>";
            }
        });
        message += "</ul>";

        // smpt setup
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                type: "login",
                user: process.env.EMAIL_HOST,
                pass: process.env.EMAIL_PASS
            }
        });

        // setup email data
        let mailOptions = {
            from: name + " - " + from + " <" + from + ">",
            to: to,
            subject: subject,
            html: message
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }

            // mail sendt
            console.log('Message sent: %s', info.messageId);
            return;
        });
    });
}