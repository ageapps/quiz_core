var models = require('../models');
var Sequelize = require('sequelize');


exports.load = function(req, res, next, categoryId) {
    // find through categoryId including associated models
    models.Category.findById(categoryId, {
        include: [{
            model: models.Quiz,
            as: 'QuizesInCategories',
            include: [{
                model: models.User,
                as: "Author"
            }, {
                model: models.Attachment
            }]
        }]
    }).then(function(category) {
        if (category) {
            // pre-load category in req
            req.category = category;
            //console.log(JSON.stringify(category));
            next();
        } else {
            throw new Error(categoryId + "Does not exist");
        }
    }).catch(function(error) {
        next(error);
    });
};

exports.index = function(req, res, next) {
    // find all categries including associated models
    models.Category.findAll({
        include: [{
            model: models.Quiz,
            as: 'QuizesInCategories',
            include: [{
                model: models.Attachment,
            }]
        }]
    }).then(function(categories) {
        if (req.params.format == "json") {
            // JSON request
            res.json(categories);
        } else {
            var search = ""; // no search text
            res.render('categories/index', {
                categories: categories,
                indexTitle: "Look for a Category",
                search: search
            });
        }

    }).catch(function(error) {
        next(error);
    });
};

exports.search = function(req, res, next) {
    var text = req.query.search || "";
    var title = text ? "Categories Found" : "Look for a Category"
        // find searched categories including associated models
    models.Category.findAll({
        include: [{
            model: models.Quiz,
            as: 'QuizesInCategories',
            include: [{
                model: models.Attachment,
            }]
        }],
        where: {
            text: {
                $like: "%" + text + "%"
            }
        }
    }).then(function(categories) {
        if (req.params.format == "json") {
            // JSON request
            res.json(categories);
        } else {
            res.render('categories/index', {
                categories: categories,
                indexTitle: title,
                search: text
            });
        }
    }).catch(function(error) {
        next(error);
    });
};

exports.category = function(req, res, next) {
    if (req.params.format == "json") {
        // JSON request
        res.json(req.category);
    } else {
        res.render("categories/category", {
            category: req.category,
            quizzes: req.category.QuizesInCategories,
            indexTitle: "Look for a Quiz in this Category",
            search: ""
        });
    }
};


exports.searchInCategory = function(req, res, next) {
    var text = req.query.search || "";
    var title = text ? "Quizzes Found in this Category" : "Look for a Quizz in this Category";
    // find searched quizzes inside a category including associated models
    req.category.getQuizesInCategories({
        include: [{
            model: models.User,
            as: "Author"
        }, {
            model: models.Attachment
        }],
        where: {
            question: {
                $like: "%" + text + "%"
            }
        }
    }).then(function(quizzes) {
        if (req.params.format == "json") {
            // JSON request
            res.json(quizzes);
        } else {
            res.render('categories/category', {
                category: req.category,
                quizzes: quizzes,
                indexTitle: title,
                search: text
            });
        }
    }).catch(function(error) {
        next(error);
    });
};
