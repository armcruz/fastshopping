if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const sequelize = require('./config/db');
const app = require('./server');
async function main() {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}

	app.listen(process.env.PORT, () =>
		console.log('Listening on port', process.env.PORT)
	);
}
main();
