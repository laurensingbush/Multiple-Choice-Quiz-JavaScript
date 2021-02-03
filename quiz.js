/**
 * Quiz class
 * 
 * @constructor
 * @param {Object} questions - questions of a quiz
 */

class Quiz {
    constructor(questions) {
        this.score = 0;
        this.questions = questions;
        this.currentQuestionIndex = 0;
        this.color = "";
    }

    getCurrentQuestion() {
        return this.questions[this.currentQuestionIndex];
    }

    guess(answer) {
        if(this.getCurrentQuestion().isCorrectAnswer(answer)) {
            this.score++;
            this.color = "green";
        } else {
            this.color = "red";
        }
        this.currentQuestionIndex++;
    }

    hasEnded() {
        return this.currentQuestionIndex === this.questions.length;
    }
}

/**
 * Question class
 * 
 * @constructor
 * @param {String} text - question
 * @param {Array} choices - choices of a question
 * @param {String} answer - answer of a question
 */

class Question {
    constructor(text, choices, answer) {
        this.text = text;
        this.choices = choices;
        this.answer = answer;
    }

    isCorrectAnswer(choice) {
        return this.answer === choice;
    }
}


/**
 * Progress Bar class
 * 
 * @constructor
 * @param {Object} element - DOM element of progress bar
 * @param {Number} initialValue - value of progress bar
 */

 class ProgressBar {
    constructor(element, initialValue = 0) {
        this.fillElement = element.querySelector("#progressBarFill");
        this.setValue(initialValue);
    }

    setValue(newValue) {
        if (newValue < 0) {
            newValue = 0;
        }
        if (newValue > 100) {
            newValue = 100;
        }
        this.value = newValue;
        this.update();
    }

    update() {
        const percentage = this.value + '%';
        this.fillElement.style.width = percentage;
    }
 }


// populate the quiz on the page
function populate() {
    if (quiz.hasEnded()) {
        // show user's score
        showScore();
    } else {
        // show the question
        document.getElementById("question").innerHTML = quiz.getCurrentQuestion().text;
        
        // show the choices
        const choices = quiz.getCurrentQuestion().choices;
        for (let index = 0; index < choices.length; index++) {
            document.getElementById("choice" + index).innerHTML = choices[index];
            guessHandler("btn" + index, choices[index]);
        }

        // show progress
        showProgress();
        const progressBar = new ProgressBar(document.querySelector("#progressBar"));
        progressBar.setValue(((quiz.currentQuestionIndex + 1) / quiz.questions.length) * 100);
    }
};


// handle user's guesses on click
function guessHandler(id, guess) {
    const button = document.getElementById(id);

    button.onclick = function() {
        quiz.guess(guess);
        
        // button color changes to green if correct, red if incorrect
        // delay loading of next question
        button.style.backgroundColor = quiz.color;
        setTimeout(function() {
            button.style.backgroundColor = null;
            populate();
        }, 500);
    }
};


function showProgress() {
    const currentQuestionNum = quiz.currentQuestionIndex + 1;
    document.getElementById("progress").innerHTML = "Question " + currentQuestionNum + " of " + quiz.questions.length;
};


function showScore() {
    let quizOverHTML = "<h1 class='main-header'>Results</h1>";
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
async function fetchData() {
    let response = await fetch("https://opentdb.com/api.php?amount=10&category=18&difficulty=easy&type=multiple");
    if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`);
    } else {
        return await response.json();
    }
}

let quiz;
fetchData().then((data) => {
    const results = data.results;
    const questions = [];
    results.forEach(function(result) {
        const answers = result.incorrect_answers.concat(result.correct_answer);
        shuffle(answers);
        const question = new Question(result.question, answers, result.correct_answer);
        questions.push(question);
    });

    // create the quiz
    quiz = new Quiz(questions);

    // display the quiz
    populate();

}).catch(err => console.log(err));