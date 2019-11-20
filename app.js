let express = require("express");
let bodyParser = require('body-parser');
let ejs = require('ejs');
let mongoose = require("mongoose");
let app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist/'));

app.set('view engine', 'ejs');

mongoose.Promise = global.Promise;

//mongodb connection string
mongoose.connect("mongodb://127.0.0.1:27017/minor-node", { useNewUrlParser: true });
 
let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback () {
        console.log('Conntected To Mongo Database');
    });

let accountSchema = new mongoose.Schema({
    initials: String,
    lastname: String,
    street: String,
    housenumber: String,
    city: String,
    zipcode: String,
    bsn: String,
    birthDate: String,
    phonenumber: String,
    email: String
}, {collection: 'account'});

let Account = mongoose.model("Account", accountSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post("/api/accountDetails", (req, res) => {
    Account.find({ email:req.body.email }).remove().exec()
    let myData = new Account(req.body);

    myData.save()
        .then(item => {
            res.redirect("/overview");
        })
        .catch(err => {
            res.status(400).send("Unable to save to database");
        });
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/login.html");
});

app.post('/api/login', (req, res) => {
    let body = (req.body);
    if (body.username == 'test@test.nl' && body.password == 'topsecret') {
        res.sendFile(__dirname + "/accountform.html");
    } 
    else {
        res.send("Incorrect login details");
    }
});

function getAccounts(callback){
    Account.find({}, function(err, objs){
        if (objs.length > 0)
        {
            console.log(objs);
            callback(objs);
        }
    });
}

app.get('/overview', function(req, res) {
    getAccounts(function(data){
        res.render('pages/overview', {
            accounts: data,
        });
    });
});

app.listen(port, () => {
    console.log("Server listening on port " + port);
});