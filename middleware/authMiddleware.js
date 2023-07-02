const protect = (req, res, next) => {
	const { user } = req.session;
console.log(user);
	if (!user) {
		return res.status(401).json({
			status: 'fail',
			message: 'unauthorized'
		});
	}

	req.user = user;

	next();
}

module.exports = protect;