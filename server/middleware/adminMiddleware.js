const notlogged = (req, res, next) => {
    try {
      if (req.session.admin) {
        res.redirect('/admin-dash')
      } else {
        next()
      }
    } catch (error) {
      console.log(error.message);
    }
  }
  const loggedIn = (req, res, next) => {
    try {
      if (req.session.admin) {
        next()
      } else {
        res.redirect('/adminlogin')
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  module.exports = {
    loggedIn,
    notlogged
  }