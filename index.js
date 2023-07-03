const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors");

let RedisStore = require("connect-redis").default;
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, SESSION_SECRET, REDIS_PORT } = require("./config/config");

let redisClient = redis.createClient({
	url: `redis://${REDIS_URL}:${REDIS_PORT}`
});
redisClient.connect().catch(console.error);

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();
app.use(express.json());

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
	mongoose
		.connect(mongoURL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			// useFindAndModify: false,
		})
		.then(() => console.log("Succesfully connected to db."))
		.catch(err => {
			console.log(err)
			setTimeout(connectWithRetry, 5000);
		});
}

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}));
app.use(session({
	store: new RedisStore({ client: redisClient }),
	secret: SESSION_SECRET,
	cookie: {
		secure: false,
		resave: false,
		saveUninitialized: false,
		httpOnly: true,
		maxAge: 30000,
	}
}));

app.get("/api/v1", (req, res) => {
	res.send("<h2>Hi There!!!</h2>");
	console.log("yeah it ran");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`Listening at port ${port}`));
