const LocalStrategy = require('passport-local').Strategy;

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Load User Model

const User = mongoose.model('users');


module.exports = function (passport) {
  passport.use(new LocalStrategy({ mailField: 'mail' }, (mail, password, done) => {
    // Match user
    User.findOne({
      mail: mail
    }).then(user => {
      if (!user) {
        return done(null, false, { message: 'Kullanıcı bulunamadı!' });
      }

      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Şifrenizi kontrol edin!' });
        }
      })
    })
  }));

  passport.serializeUser(function (user, done) {
    done(null, user.id);
    console.log('User logged in : ' + user.id)
    
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);

    });
  });


  
}
