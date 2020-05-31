module.exports = {
  
  loginCheck: function(req, res, next){
    return next();
  }

  /*loginCheck: function(req, res, next){
    if(!req.isAuthenticated()){
      return next();
    }
    res.redirect('/');
  }*/
}
