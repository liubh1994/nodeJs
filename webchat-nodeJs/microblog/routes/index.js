var express = require('express');
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    Post.get(null,function(err,posts){
        if(err){
            posts=[];
        }
        console.log(posts);
        res.render('index',{
            title:'首页',
            posts:posts
        });
    });

});

router.get('/reg',checkLogin);
router.get('/reg',function(req,res,next){
    res.render('reg',{title:'用户注册'});
});

router.post('/reg',checkLogin);
router.post('/reg',function(req,res,next){
    if(req.body['password-repeat'] != req.body['password']){
        req.flash('error','两次输入的密码不一致!');
        return res.redirect('/reg');
    }
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    var newUser = new User({
        name:req.body.username,
        password:password
    });

    User.get(newUser.name,function(err,user){
        if(user){
            err = 'Username already exists.';
        }
        if(err){
            req.flash('error',err);
            return res.redirect('/reg');
        }
        console.log(newUser);
        newUser.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success','注册成功!');
            res.redirect('/');
        });

    })
});

router.get('/login',checkLogin);
router.get('/login',function(req,res,next){
    res.render('login',{title:'用户登录'});
});

router.post('/login',checkLogin);
router.post('/login',function(req,res,next){
    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('base64');

    User.get(req.body.username,function(err,user){
        if(!user){
            req.flash('error','用户不存在');
            return res.redirect('/login');
        }
        console.log(user);
        if(user.password!=password){
            console.log(user.password+'  !=  '+password);
            req.flash('error','用户密码错误');
            return res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success','登陆成功');
        res.redirect('/users/'+user.name);
    });
});

function checkLogin(req,res,next){
    if(req.session.user){
        req.flash('error','用户已登陆，禁止此操作!');
        return res.redirect('/');
    }
    next();
}

module.exports = router;
