module.exports = {

  
  ensureAuthenticated: function(req, res, next){
      return next();
  }

  /*ensureAuthenticated: function(req, res, next){
    if(req.isAuthenticated()){
      return next();
    }
    req.flash('error_msg', 'Please login first.');
    res.redirect('/users/login');
  }*/

}
