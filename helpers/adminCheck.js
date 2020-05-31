module.exports = {
  adminCheck: function (req, res, next) {
    return next()
  }

  /*adminCheck: function (req, res, next) {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    req.flash('error_msg', 'Yetkiniz bulunmamaktadır.');
    res.redirect('/');
  }*/
}
