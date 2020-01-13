require("./cardEngineServer");

const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res, next) => {
    
    res.json({test: "ok"});
    
});

app.listen(80);