let express = require("express");
let mongoose = require("mongoose");
let app = express();
app.use(express.json());
let port = process.env.PORT || 4500;
// let fawn = require("f")

let config = require("config");

if(!config.get("ENV_PASSWORD")){
        console.log("ACCESS DENIED !!");
        process.exit(1);
}

require("./WrapAllMiddlewares/startupWrapper")(app);

mongoose.connect("mongodb://localhost/Project",{ useNewUrlParser: true, useUnifiedTopology: true })
        .then(()=>console.log("database got connected"))
        .catch(error=>console.log(`database not connected :( ${error.message}`));

app.listen(port,console.log(`APP is working on port ${port}`));