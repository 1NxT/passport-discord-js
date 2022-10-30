/* eslint-disable no-undef */
import cors from "cors";
import express from "express";
import path from "path";
import "dotenv/config";
import passport from "passport";
import Strategy from "passport-discord";
import {fileURLToPath} from "url";

//Resolver __dirname undefined
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Express app
const app = express();

//Usando CORS para não ter error de politicas
app.use(cors());

//Definindo onde o express vai buscar os arquivos staticos para servir
app.use(express.static(path.join(__dirname, "static")));

//Rotas do html
app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, "static", "index.html"));
});
app.get("/sucess", function (req, res) {
	res.sendFile(path.join(__dirname, "static", "sucess.html"));
});


//Configurar as permissões que ele vai buscar
var scopes = ["identify", "email", "guilds", "guilds.join"];


//API do passport
passport.use(new Strategy({
	clientID: process.env.CLIENTID,
	clientSecret: process.env.CLIENTSECRET,
	callbackURL: process.env.CALLBACKURL,
	scope: scopes
},
function(accessToken, refreshToken, profile, cb) {
	User.findOrCreate({ discordId: profile.id }, function(err, user) {
		return cb(err, user);
	});
}));


//Rotas da API
app.get("/auth/discord", passport.authenticate("discord"));
app.get("/auth/discord/callback", passport.authenticate("discord", {
	failureRedirect: "/"
}), function(req, res) {
	console.log("Sucesso!");
	res.redirect("/sucess"); // Successful auth
});

export default app;
