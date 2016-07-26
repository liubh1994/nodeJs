var express = require('express');
var Post = require('../models/post');
var User = require('../models/user');
var router = express.Router();

/* GET users listing. */

router.post('/post',checkNoLogin);
router.post('/post',function(req,res,next){
    var currentUser = req.session.user;
    var post = new Post(currentUser.name,req.body.post);
    post.save(function(err){
        if(err){
            req.flash('error',err);
            return res.redirect('/');
        }
        req.flash('success','发表成功');
        res.redirect('/users/'+currentUser.name);
    });
});

router.get('/logout',checkNoLogin);
router.get('/logout',function(req,res,next){
    req.session.user = null;
    req.flash('success','退出成功');
    res.redirect('/');
});

router.get('/:username',function(req,res,next){
    console.log(req.params.username+'1');
    User.get(req.params.username,function(err,user){
        if(!user){
            req.flash('error','用户不存在');
            return res.redirect('/');
        }
        console.log(req.params.username+'2');
        Post.get(user.name,function(err,posts){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            console.log(req.params.username+'3');
            res.render('user',{
                title:user.name,
                posts:posts
            });
        });
    });
});

function checkNoLogin(req,res,next){
    if(!req.session.user){
        req.flash('error','用户未登录,禁止此操作!');
        return res.redirect('/');
    }
    next();
}

module.exports = router;
