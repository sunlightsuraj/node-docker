const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

exports.signUp = async (req, res, next) => {
	const { username, password } = req.body;
	
	try {
		const hashPassword = await bcrypt.hash(password, 12);

		const user = await User.create({
			username,
			password: hashPassword
		});
		req.session.user = user;
		res.status(201).json({
			status: 'success',
			data: {
				user
			}
		})
	} catch (e) {
		console.error(e);
		res.status(400).json({
			status: 'fail',
		});
	}
}

exports.login = async (req, res, next) => {
	const { username, password } = req.body;

	try {
		const user = await User.findOne({ username });

		if (!user) {
			return res.status(400).json({
				status: 'fail',
				message: 'User not found.'
			});
		}

		const isCorrect = await bcrypt.compare(password, user.password);

		if (isCorrect){
			req.session.user = user;
			res.status(200).json({
				status: 'success'
			})
		} else {
			res.status(400).json({
				status: 'fail',
				message: "Incorrect username or password."
			});
		}
	} catch (e) {
		console.error(e);
		res.status(400).json({
			status: 'fail'
		});
	}
}