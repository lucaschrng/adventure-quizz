const createQuizButton = document.querySelector('#createQuiz')

function fetchCategories() {
  fetch('https://opentdb.com/api_category.php')
    .then(response => response.json())
    .then(data => {
      const categories = data.trivia_categories;
      const categorySelect = document.getElementById('category');
      categories.forEach(cat => {
        let option = document.createElement('option');
        option.value = cat.id;
        option.text = cat.name;
        categorySelect.appendChild(option);
      });
    });
}

function submitAnswer(room, answer, correctAnswer) {
    const isCorrect = answer === correctAnswer;
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'feedback';
    if (isCorrect) {
        feedbackElement.textContent = 'Correct!';
        feedbackElement.classList.add('text-green-500');
    } else {
        feedbackElement.textContent = `Wrong! The correct answer was ${correctAnswer}.`;
        feedbackElement.classList.add('text-red-500');
    }
    document.getElementById('answers').appendChild(feedbackElement);
    document.querySelectorAll('#answers button').forEach(button => {
        console.log(button)
        button.disabled = true;
        button.classList.add('bg-zinc-500', 'opacity-50')
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const messages = document.getElementById('messages');
    const msgInput = document.getElementById('msg-input');
    const sendBtn = document.getElementById('send-btn');
    const room = document.getElementById('room-id').textContent;
    const scoresPanel = document.getElementById('scores');


    socket.emit('join-room', room);

    const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

    if (isAdmin) {
        document.getElementById('adminPanel').style.display = 'block';
        fetchCategories();
    } else {
        document.getElementById('loader').classList.remove('hidden');
    }

    sendBtn.onclick = function() {
    const message = msgInput.value;
    if (message && room) {
        socket.emit('message', room, message);
        msgInput.value = ''; 
    }
    };

    socket.on('new-message', (message) => {
    messages.innerText += `\n${message}`;
    });

    socket.on('user-joined', (room, id) => {
    messages.innerText += `\nUser ${id} joined the room.`;
    });

    socket.on('countdown', function(timeLeft) {
        if (timeLeft === 0) {
            document.getElementById('messages').innerText = "Quiz is starting...";
        } else {
            document.getElementById('messages').innerText = `Starting in ${timeLeft} seconds...`;
        }
    });

    socket.on('displayQuestion', (question) => {
        console.log(question)
        document.getElementById('adminPanel').style.display = 'hidden';
        document.getElementById('quizQuestionPanel').classList.remove('hidden');

        const questionElement = document.getElementById('question');
        const answersElement = document.getElementById('answers');
        questionElement.textContent = question.question;
        answersElement.innerHTML = '';

        const allAnswers = [...question.incorrect_answers];
        allAnswers.splice(Math.floor(Math.random() * (allAnswers.length + 1)), 0, question.correct_answer);

        allAnswers.forEach((answer) => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block mb-2';
            button.addEventListener('click',()=>{
                submitAnswer(room, answer, question.correct_answer)
                const time = Date.now();
                const isCorrect = answer === question.correct_answer;
                console.log(socket.id)
                socket.emit('answer', { answer, correctAnswer: question.correct_answer, time, isCorrect }, room)
            })
            answersElement.appendChild(button);
        });
    });

    createQuizButton.addEventListener('click', () => {
        const config = {
            amount:document.getElementById('amount').value,
            category:document.getElementById('category').value,
            difficulty: document.getElementById('difficulty').value,
            type: document.getElementById('type').value
        }

        socket.emit('startQuiz', room, config)
    })

    socket.on('quizOver', () => {
        const quizPanel = document.getElementById('quizQuestionPanel');
        quizPanel.classList.add('hidden');
        alert('Quiz is over!');
    });

    socket.on('score-update', (scores) => {
        scoresPanel.innerHTML = '';
        for (const [player, score] of Object.entries(scores)) {
          const scoreElement = document.createElement('div');
          scoreElement.textContent = `Player ${player}: ${score}`;
          scoresPanel.appendChild(scoreElement);
        }
    });

});

