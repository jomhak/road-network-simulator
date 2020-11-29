import express = require("express");




const app: express.Application = express();
const port: number = 3000;
app.use("/js", express.static("build/client"));
app.use(express.static("public"));

app.get("/", (request: express.Request, response: express.Response) => {
    response.send();
});


app.listen(port, () => {
    console.log("Server running on port 3000");
});