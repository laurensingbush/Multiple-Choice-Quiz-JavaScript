// define properties for Quiz constructor
function Quiz(questions) {
    this.score = 0;
    this.questions = questions;
    this.currentQuestionIndex = 0;
    this.color = "";
}

// add getCurrentQuestion() function to Quiz's prototype
Quiz.prototype.getCurrentQuestion = function() {
    return this.questions[this.currentQuestionIndex];
}

// add guess() function to Quiz's prototype
// if user guesses correctly increase their score
Quiz.prototype.guess = function(answer) {
    if(this.getCurrentQuestion().isCorrectAnswer(answer)) {
        this.score++;
        this.color = "green";
    } else {
        this.color = "red";  
    }
    this.currentQuestionIndex++; // go to next question
}

// add hasEnded() function to Quiz's prototype
// ends quiz after last question
Quiz.prototype.hasEnded = function() {
    return this.currentQuestionIndex === this.questions.length;
}

// define properties for Question constructor
function Question(text, choices, answer) {
    this.text = text;
    this.choices = choices;
    this.answer = answer;
}

// add isCorrectAnswer() function to Question's prototype
Question.prototype.isCorrectAnswer = function(choice) {
    return this.answer === choice;
}

// populate the quiz on the page
function populate() {
    if (quiz.hasEnded()) {
        showScore();
    } else {
        // show the question
        document.getElementById("question").innerHTML = quiz.getCurrentQuestion().text;
        
        // show the choices
        var choices = quiz.getCurrentQuestion().choices;
        for (var index = 0; index < choices.length; index++) {
            document.getElementById("choice" + index).innerHTML = choices[index];
            guessHandler("btn" + index, choices[index]);
        }

        // show question number
        showProgress();
    }
};



// once user clicks their guess, excute the guess() function
function guessHandler(id, guess) {
    var button = document.getElementById(id);

    button.onclick = function() {
        quiz.guess(guess);
        
        // button color changes to green if correct, red if incorrect
        // setTimeout delays loading of next question
        button.style.backgroundColor = quiz.color;
        setTimeout(function() {
            button.style.backgroundColor = null;
            populate();
        }, 500);
    }
};


// shows question number user is on
function showProgress() {
    var currentQuestionNum = quiz.currentQuestionIndex + 1;
    document.getElementById("progress").innerHTML = "Question " + currentQuestionNum + " of " + quiz.questions.length;
};

// shows the user's score at end of quiz
function showScore() {
    var quizOverHTML = "<h1 class='main-header'>Results</h1>";
    quizOverHTML += "<h2 id='score'> Your score: " + quiz.score + "/" + quiz.questions.length + "</h2>";
    quizOverHTML += "<div class='try-again'><a class='try-again-btn' href='index.html'>Try Again</a></div>"
    document.getElementById("quiz").innerHTML = quizOverHTML;
};


// use Fisher-Yates algorithm to shuffle the answers in each question
// so correct answer isn't always in same button position 
function shuffle(array) {
    for (let currentIndex = array.length - 1; currentIndex > 0; currentIndex--) {
        const randomIndex = Math.floor(Math.random() * currentIndex);

        //swap element at randomIndex with the current element
        const tempValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = tempValue;
    }
    return array;
};


// fetch the quiz data from JSON API
var quiz;
fetch("https://opentdb.com/api.php?amount=10&category=18&difficulty=easy&type=multiple")
    .then(response => response.json())
    .then(data => {
        var results = data.results;
        var questions = [];
        results.forEach(function(result) {
            var answers = result.incorrect_answers.concat(result.correct_answer);
            shuffle(answers);
            var temp = new Question(result.question, answers, result.correct_answer);
            questions.push(temp);
        })

        // create the quiz
        quiz = new Quiz(questions);
        
        // display the quiz 
        populate();
    })
    .catch(error => console.log(error))  // catch any errors
