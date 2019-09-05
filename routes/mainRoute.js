//default route - respond to anything besides those above
app.use((req, res, next) => {
    console.log("Requested route is undefined.");
    //Page not found
    res.render("page-not-found");
});

const newLocal = 500;
//error route: reached from any of the non-default in the
//event of an error (error handler)
app.use((err, req, res, next) => {
    console.log(err);
    if (!res.headersSent) {
        res.status(newLocal);
        res.render('error', { error: err });
    }
});

module.exports = app;