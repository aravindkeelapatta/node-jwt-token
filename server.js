var express = require("express");

var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var morgan = require("morgan");
var jwt = require("jsonwebtoken");
var router = express.Router();


var webConfig = require("./config");
var User = require("./models/user")

app.use(morgan('dev'));
app.set('secretKey', webConfig.SECRET);
console.log(app.get('secretKey'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect(webConfig.DATABASECON, function() {
	console.log("Coneccted to database successfully");
})

router.get("/", function(request, response) {
	response.send("These is my JwT Authentication app")
})

router.post("/createUser", function(request, response) {
   var userObj = request.body;

   User.createUser(userObj, function(err, data) {
        if(err) {
        	throw err;
        }
        response.json(data)
   })
})

router.get("/getUser/:name", function(request, response) {
	var userName = request.params.name;
	User.getUserByName(userName, function(err, data) {
		if(err) {
			throw err;
		}
		response.json(data)
	})
})



router.post("/authenticate", function(request, response) {
	
	var username = request.body.name;
	var password = request.body.password;

	User.getUserByName(username, function(err, user) {
		if(err) {
			throw err;
		}
		if(!user) {
			response.json({
				success : false,
				message : "Authentication failed, user not found"
			})
		}
		else if(user) {
			if(user.password != password) {
				response.json({
					success : false,
					message : "Authentication failed, password not match"
				})
			}
			else {
				var token = jwt.sign(user, app.get('secretKey'))
				response.json({
					success : true,
					message : "Here is your token",
					token : token
				})
			}
		}
	});
})


// Middleware concept

router.use(function(request,response,next) {
    var token = request.body.token || request.query.token || request.headers["x-access-token"];
    if(token) {
    	jwt.verify(token, app.get('secretKey'),function(err, decoded) {
    		if(err) {
    			response.json({
    				success: false,
    				message : "Authentication failed, not a valid token"
    			})
    		}
    		request.decoded = decoded;
    		next();
    	})
    }
    else {
    	response.status(403).send({
    		success: false,
    		message: "please provide a token"
    	})
    }
});

router.get("/users", function(request,response) {
	User.getUser(function(err, data) {
		if(err) {
			throw err;
		}
		response.json(data)
	})
})

app.use("/api", router);

var PORT = process.env.PORT || 8081;

app.listen(PORT, function() {
	console.log("Server is Listening at PORT 8081 ");
})

