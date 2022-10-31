/* eslint-disable no-undef */
import cors from "cors";
import express, { urlencoded } from "express";
import path from "path";
import "dotenv/config";
import passport from "passport";
import Strategy from "passport-discord";
import { v4 as uuidv4 } from "uuid";

import {fileURLToPath} from "url";
import session from "express-session";
import { renderFile } from "ejs";

//Resolver __dirname undefined
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Express app
const app = express();

//Usando CORS para não ter error de politicas
app.use(cors());
app.use(urlencoded({ extended: true}));

//Session middleware
app.use(session({ 
	secret: uuidv4(),
	resave: true,
	saveUninitialized: true
})); 
app.use(passport.initialize());

//Manter o login
app.use(passport.session()); 

//Definindo onde o express vai buscar os arquivos staticos para servir
app.use(express.static(path.join(__dirname, "static")));

//Rotas do html
app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.get("/sucess", function (req, res) {
	//Valida se existe sessão, se não houver ele redireciona para a primeira tela.
	if(!req.session.passport){
		res.redirect("/");
	}else{
		const user = req.session.passport.user;
		renderFile(path.join(__dirname, "static", "sucess.ejs"), user, (err, html) => {
			if(err){
				return res.status(500).json(`${err}`);
			}else{
				return res.send(html);
			}
		});
	}
});


//Configurar as permissões que ele vai buscar na hora do login
var scopes = ["identify", "email"];


//API do passport
passport.use(new Strategy({
	clientID: process.env.CLIENTID,
	clientSecret: process.env.CLIENTSECRET,
	callbackURL: process.env.CALLBACKURL,
	scope: scopes
},
function(accessToken, refreshToken, profile, cb) {
	//Criando objeto da sessão para buscar esse objeto é so chamar "request.session".
	const user = {
		"ID": profile.id,
		"USERNAME": profile.username,
		"AVATAR_URL": `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`,
		"EMAIL": profile.email,
		"VERIFIED": profile.verified,
		"PROVIDER": profile.provider,
		"ACESSTOKEN": profile.accessToken,
		"FETCHEDAT": profile.fetchedAt
	};
	
	return cb(null, user);
}));

//Salva a sessão
passport.serializeUser(function(user, done) {
	done(null, user);
});

//Remove a sessão
passport.deserializeUser(function(user, done) {
	done(null, user);
});

//Rotas da API
app.get("/auth/discord", passport.authenticate("discord"));

//Callback do discord
app.get("/auth/discord/callback", passport.authenticate("discord", {
	failureRedirect: "/",
	successRedirect: "/sucess"
}));

export default app;
