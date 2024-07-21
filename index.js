var express = require('express');
var app = express();
const bodyParser = require("body-parser");
const passwordhash = require("password-hash");
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

var serviceAccount = require("./hem.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {  
  res.sendFile(__dirname + "/public/rey.html");
});
app.get('/signup', function (req, res) {  
  res.sendFile(__dirname + "/public/signup.html");
});

app.get('/login', function (req, res) {  
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/dashboard", function (req, res) {
  res.sendFile(__dirname + "/public/dashboard.html");
});

app.post('/signupsubmit', function (req, res) {
  const { username, email, password } = req.body;

  db.collection("Details")
    .where("email", "==", email)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        res.send("Hey user, this account already exists");
      } else {
        db.collection("Details").add({
          username: username,
          email: email,
          password: passwordhash.generate(password)
        })
        .then(() => {
          const successMessage = "Signup Successful. Click here to <a href='/login'>Log in</a>.";
          res.send(successMessage);
        })
      }
    })
});

app.post("/loginSubmit", function (req, res) {
  const { username, password } = req.body;

  db.collection("Details")
    .where("username", "==", username)
    .get()
    .then((docs) => {
      var verified = false;
      docs.forEach((doc) => {
        verified = passwordhash.verify(password, doc.data().password);
        if (verified) {
          res.sendFile(__dirname + "/public/dashboard.html");
        }
      });

      if (!verified) {
        res.send("Login failed");
      }
    })
});

app.get("/dashboardSubmit", function (req, res) {
  res.sendFile(__dirname + "/public/display.html");
  db.collection("Project Details").add({
    studentname: req.query.student_name,
    Studid: req.query.student_id,
    Teaminfo: req.query.teaminfo,
    Title: req.query.project_title,
    Description: req.query.project_description,
    Link: req.query.projectlink

  })
})
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
