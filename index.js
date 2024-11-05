const express = require("express");
const session = require("express-session");
const ejs = require('ejs');
const path = require('path');
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const otplib = require("otplib");
const bodyParser = require("body-parser");
const users = require("./users");

const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "secretKey", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy((username, password, done) => {
    const user = users.find((u) => u.username === username && u.password === password);
    return user ? done(null, user) : done(null, false, { message: "Incorrect login." });
}));

passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => {
    const user = users.find((u) => u.username === username);
    done(null, user);
});

// Routes
app.get("/", (req, res) => res.redirect("/login"));

// Standard login with username/password
app.get("/login", (req, res) => res.render("login", {title: "Standard Login"}));
app.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => {
    req.session.totpAuthenticated = false;  // Standard login does not enable TOTP access
    res.redirect("/protected");
});

// Login with username/password, then TOTP
app.get("/login-totp", (req, res) => res.render("login-totp", {title: "TOTP Login"}));
app.post("/login-totp", passport.authenticate("local", { failureRedirect: "/login-totp" }), (req, res) => {
    req.session.isUserAuthenticated = true;
    res.redirect("/enter-totp");  // Redirect to TOTP entry page
});

// TOTP entry page
app.get("/enter-totp", (req, res) => {
    if (!req.isAuthenticated() || !req.session.isUserAuthenticated) {
        return res.redirect("/login-totp");  // Redirect if user hasn't logged in with username/password
    }
    res.render("enter-totp", {title: "Enter TOTP Code"});
});

app.post("/enter-totp", (req, res) => {
    const user = req.user;
    const isValid = otplib.authenticator.check(req.body.token, user.totpSecret);
    if (isValid) {
        req.session.totpAuthenticated = true;   // Set TOTP authentication flag
        req.session.isUserAuthenticated = false;  // Reset username/password auth flag
        res.redirect("/protected-totp");
    } else {
        res.redirect("/enter-totp");
    }
});

// Protected route (for standard login)
app.get("/protected", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("protected", {title: "Protected Page"});
    } else {
        res.redirect("/login");
    }
});

// TOTP-protected route
app.get("/protected-totp", (req, res) => {
    if (req.isAuthenticated() && req.session.totpAuthenticated) {
        res.render("protected-totp", {title: "TOTP Protected Page"});
    } else {
        res.redirect("/login-totp");
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));