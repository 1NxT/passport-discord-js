import "dotenv/config";
import app from "./src/server.js";

// eslint-disable-next-line no-undef
const PORT = process.env.PORT;


//Iniciar app
app.listen(PORT, () => {
	console.log(`Discord passport backend online! Listening: ${PORT}.`);
});