const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const pug = require('pug');
const path = require('path');
const { htmlToText } = require('html-to-text');

dotenv.config({ path: './config.env' });

class Email {
	constructor(to) {
		this.to = to;
	}

	// Connect to mail service
	newTransport() {

		return nodemailer.createTransport({
			host: 'smtp.mailtrap.io',
			port: 2525,
			auth: {
				user: process.env.MAILTRAP_USER,
				pass: process.env.MAILTRAP_PASSWORD,
			},
		});
	}

	// Send the actual mail
	async send(template, subject, mailData) {
		const html = pug.renderFile(
			path.join(__dirname, '..', 'views', 'emails', `${template}.pug`),
			mailData
		);

		await this.newTransport().sendMail({
			from: process.env.MAIL_FROM,
			to: this.to,
			subject,
			html,
			text: htmlToText(html),
		});
	}

	async sendWelcome(username) {
		await this.send('welcome', 'Welcome to the app', {username});
	}

	 async sendNewOrder(cart, username, totalPrice) {
	 	await this.send('newOrder', 'You have placed a new Order ', {
	 		cart,
	 		username,
			totalPrice
	 	});
	 }
}

module.exports = { Email };
