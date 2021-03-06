const express = require('express');
const router = express.Router();

//bring in article models
let Article = require('../models/article');
//bring in user models
let User = require('../models/user');
//bring in comment models
let Comment = require('../models/comment');
//Add Route
router.get('/chat',function(req,res){
    res.render('chat',{
        chat: req.user.username
    });
});
router.get('/forum',function(req,res){
    Article.find({},function(err,articles){
        if(err){
            console.log(err);
        }else{
             res.render('forum',{
                        title:'Articles',
                          articles: articles
                            });
        }
        
                     
                      });
                    });
router.get('/add',ensureAuthenticated,function(req,res){
    res.render('add_article',{
                          title:'Add Articles'
    });
});
//add submit POST route
router.post('/add',function(req,res){
    req.checkBody('title','Title is required').notEmpty();
    //req.checkBody('author','Author is required').notEmpty();
    req.checkBody('body','Body is required').notEmpty();
    
    //get errror
    let errors = req.validationErrors();
    
    if(errors){
        res.render('add_article',{
            title:'Add Article',
            errors:errors
        });
    }else{
        let article = new Article();
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    
    article.save(function(err){
        if(err){
            console.log(err);
            return;
        } else{
            req.flash('success','Article Added');
            res.redirect('/articles/forum');
        }
    });
}
    
});
//load edit
router.get('/edit/:id',ensureAuthenticated,function(req,res){
    Article.findById(req.params.id,function(err,article){
        if(article.author != req.user._id){
            req.flash('danger','Not Authorized');
            res.redirect('/');
        };
       res.render('edit_article',{
           title:'Edit Article',
           article:article
       });
    });
});

//Update submit POST route
router.post('/edit/:id',function(req,res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    
    let query ={_id:req.params.id}
    
    Article.update(query,article,function(err){
        if(err){
            console.log(err);
            return;
        } else{
            req.flash('success','Article Updated')
            res.redirect('/articles/forum');
        }
    })
});
//Delete
router.delete('/:id',function(req,res){
    if(!req.user._id){
        res.status(500).send();
    }
    let query = {_id:req.params.id}
    
    Article.findById(req.params.id,function(err,article){
       if(article.author != req.user._id){
           res.status(500).send();
       } else {
           Article.remove(query, function(err){
               if(err){
                   console.log(err);
               }
            res.send('Success');
            });
       }
    });
    
});

//Get single article
router.get('/:id',function(req,res){
    Article.findById(req.params.id,function(err,article){
        User.findById(article.author,function(err,user){
            Comment.find({id:req.params.id},function(err,comments){
            res.render('article',{
                article:article,
                author: user.name,
                comments:comments
            });
        });
       
       });
    });
});
router.post('/:id',function(req,res){
    req.checkBody('body','Comment is required').notEmpty();
    let errors = req.validationErrors();

    if(errors){
        Article.findById(req.params.id,function(err,article){
        User.findById(article.author,function(err,user){
            Comment.find({id:req.params.id},function(err,comments){
            res.render('article',{
                article:article,
                author: user.name,
                comments:comments,
                errors:errors
            });
        });

       });
    });
    } else{
    let comment = new Comment();
    comment.body = req.body.body;
    comment.id = req.params.id;
    comment.writer = req.user.name;
    comment.save(function(err){
        if(err){
            console.log(err);
            return;
        } else{
            req.flash('success','Comment Added');
            res.redirect('/articles/forum');
        }
    });

}});
//access control
function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash('danger','Please login');
        res.redirect('/users/login');
    }
};

module.exports = router;
