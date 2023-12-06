const usersCollection = require("../model/usersSchema");
const loggedIn = async (req, res, next) => {

    if (req.session.email) {
        try {
            const email = req.session.email;
            const userDetails = await usersCollection.findOne({ email: email });
            req.userDetails = userDetails;
            if(userDetails.block=="true"){
                req.session.destroy((err) => {
                    console.log(err);
                    res.status(500)
                })
                res.clearCookie('connect.sid')
                res.redirect('/login?message=Your account is blocked by administrator')
            }
            next();
        } catch (error) {
            console.log(error);
            return res.status(500).send('Internal Server Error');
        }

    } else {
        return res.redirect('/login?message=Log in for Accessibility');
    }

}

module.exports = {
    loggedIn,
    // notLogged,
    // verificationPanel,
    // ordered
}