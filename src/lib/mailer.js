const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "557442d6bb89e0",
      pass: "dc40d78d005060"
    }
});

