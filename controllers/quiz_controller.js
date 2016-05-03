/**
 * Created by adricacho on 3/5/16.
 */

exports.question = function (req, res, next) {
    var answer = req.query.answer || "";
    res.render("quizes/question", {
        question: "Capital de Italia",
        answer: answer
    });
};


exports.check = function (req, res, next) {
    var answer = req.query.answer || "";
    var result = ((answer === "Roma") ? "Correcta" : "Erronea");
    res.render("quizes/check", {result: result,
        answer: answer
    });

};