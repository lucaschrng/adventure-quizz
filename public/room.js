// const createQuizButton = document.querySelector('#createQuiz')
// const leaveRoomButton = document.querySelector('#leaveRoom');
// const copyLinkButton = document.querySelector('#copyLinkButton');
// const roomLinkInput = document.querySelector('#roomLink');

// function decodeHtmlEntities(text) {
//   const textArea = document.createElement('textarea');
//   textArea.innerHTML = text;
//   return textArea.value;
// }

// function fetchCategories() {
//   fetch('https://opentdb.com/api_category.php')
//     .then(response => response.json())
//     .then(data => {
//       const categories = data.trivia_categories;
//       const categorySelect = document.getElementById('category');
//       categories.forEach(cat => {
//         let option = document.createElement('option');
//         option.value = cat.id;
//         option.text = cat.name;
//         categorySelect.appendChild(option);
//       });
//     });
// }

// function submitAnswer(room, answer, correctAnswer) {
//   const isCorrect = answer === correctAnswer;
//   const feedbackElement = document.createElement('div');
//   feedbackElement.className = 'feedback';
//   if (isCorrect) {
//     feedbackElement.textContent = 'Correct!';
//     feedbackElement.classList.add('text-green-500');
//   } else {
//     feedbackElement.textContent = `Wrong! The correct answer was ${decodeHtmlEntities(correctAnswer)}.`;
//     feedbackElement.classList.add('text-red-500');
//   }
//   document.getElementById('answers').appendChild(feedbackElement);
//   document.querySelectorAll('#answers button').forEach(button => {
//     console.log(button)
//     button.disabled = true;
//     button.classList.add('bg-zinc-500', 'opacity-50')
//   });
// }


// function displayPodium(scores) {
//     const podiumElement = document.getElementById('podium');
//     podiumElement.innerHTML = '';
  
//     const sortedScores = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  
//     sortedScores.forEach(([id, { username, score }], index) => {
//       const playerElement = document.createElement('div');
//       playerElement.className = `player player-${index + 1}`;
//       playerElement.innerHTML = `
//         <h2 class="username">${username}</h2>
//         <p class="score">${score} points</p>
//       `;
//       podiumElement.appendChild(playerElement);
//     });
  
//     podiumElement.classList.remove('hidden');
//   }

// document.addEventListener('DOMContentLoaded', function () {
//   const socket = io();
//   const messages = document.getElementById('messages');
//   const msgInput = document.getElementById('msg-input');
//   const messageForm = document.getElementById('message-form');
//   const room = document.getElementById('room-id').textContent;
//   const scoresPanel = document.getElementById('scores');

//   function generateDefaultUsername() {
//     return `User${Math.floor(Math.random() * 10000)}`;
//   }

//   let username = localStorage.getItem('username');
//   if (!username) {
//     username = generateDefaultUsername();
//     localStorage.setItem('username', username);
//   }

//   function updateUsername(newUsername) {
//     username = newUsername;
//     localStorage.setItem('username', username);
//   }

//   const usernameInput = document.querySelector('#username-input');
//   usernameInput.value = username;

//   usernameInput.onchange = function () {
//     const newUsername = document.getElementById('username-input').value;
//     if (newUsername) {
//       updateUsername(newUsername);
//     }
//   };

//   socket.emit('join-room', room, username);

//   const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

//   if (isAdmin) {
//     document.getElementById('adminPanel').style.display = 'flex';
//     fetchCategories();
//   } else {
//     document.getElementById('loader').classList.remove('hidden');
//   }

//   messageForm.onsubmit = function (event) {
//     event.preventDefault();
//     const message = msgInput.value;
//     if (message && room) {
//       socket.emit('message', room, {message, username});
//       msgInput.value = '';
//     }
//   };

//   socket.on('new-message', ({message, username}) => {
//     const messageLi = document.createElement('li');
//     messageLi.innerHTML = `<b>${username}</b>: ${message}`;
//     messages.appendChild(messageLi);
//   });

//   socket.on('user-joined', (room, id, username) => {
//     const messageLi = document.createElement('li');
//     messageLi.textContent = `User ${username} joined the room.`;
//     messages.appendChild(messageLi);
//   });

//   socket.on('user-left', (room, id, username) => {
//     const messageLi = document.createElement('li');
//     messageLi.textContent = `User ${username} left the room.`;
//     messages.appendChild(messageLi);
//   });

//   socket.on('countdown', function (timeLeft) {
//     const countdownElement = document.getElementById('countdown');
//     const countdownLobbyElement = document.getElementById('countdown-lobby');
//     const countdownAdminElement = document.getElementById('countdown-admin');

//     countdownElement.textContent = `${timeLeft} seconds left...`;
//     countdownLobbyElement.textContent = `${timeLeft} seconds left...`;
//     countdownAdminElement.textContent = `${timeLeft} seconds left...`;
//   });

//   socket.on('displayQuestion', (question) => {
//     console.log(question)
//     document.getElementById('adminPanel').style.display = 'none';
//     document.getElementById('loader').classList.add('hidden');
//     document.getElementById('quizQuestionPanel').classList.remove('hidden');

//     const questionElement = document.getElementById('question');
//     const answersElement = document.getElementById('answers');
//     questionElement.textContent = decodeHtmlEntities(question.question);
//     answersElement.innerHTML = '';

//     const allAnswers = [...question.incorrect_answers];
//     allAnswers.splice(Math.floor(Math.random() * (allAnswers.length + 1)), 0, question.correct_answer);

//     allAnswers.forEach((answer) => {
//       const button = document.createElement('button');
//       button.innerText = decodeHtmlEntities(answer);
//       button.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block mb-2';
//       button.addEventListener('click', () => {
//         submitAnswer(room, answer, question.correct_answer)
//         const time = Date.now();
//         const isCorrect = answer === question.correct_answer;
//         console.log(socket.id)
//         socket.emit('answer', {answer, correctAnswer: question.correct_answer, time, isCorrect}, room)
//       })
//       answersElement.appendChild(button);
//     });
//   });

//   createQuizButton.addEventListener('click', () => {
//     const config = {
//       amount: document.getElementById('amount').value,
//       category: document.getElementById('category').value,
//       difficulty: document.getElementById('difficulty').value,
//       type: document.getElementById('type').value
//     }

//     socket.emit('startQuiz', room, config)
//   })

//   leaveRoomButton.addEventListener('click', () => { 
//     socket.emit('leave-room', room);
//     window.location.href = '/';
//   });

//   copyLinkButton.addEventListener('click', () => {
//     roomLinkInput.select();
//     roomLinkInput.setSelectionRange(0, 99999);
//     navigator.clipboard.writeText(roomLinkInput.value).then(() => {
//       alert('Room link copied to clipboard!');
//     }).catch(err => {
//       console.error('Failed to copy room link: ', err);
//     });
//   });

//   const url = new URL(window.location.href);
//   url.searchParams.delete('admin');
//   roomLinkInput.value = url.href; 

//   socket.on('quizOver', (finalScores) => {
//     const quizPanel = document.getElementById('quizQuestionPanel');
//     quizPanel.classList.add('hidden');
//     displayPodium(finalScores);
//   });

//   socket.on('score-update', (scores) => {
//     console.log(scores)
//     scoresPanel.innerHTML = '';
//     for (const [player, score] of Object.entries(scores)) {
//         console.log(player,score)
//       const scoreElement = document.createElement('div');
//       scoreElement.textContent = `Player ${player}: ${score}`;
//       scoresPanel.appendChild(scoreElement);
//     }
//   });

// });
// const createQuizButton = document.querySelector('#createQuiz');
// const leaveRoomButton = document.querySelector('#leaveRoom');
// const copyLinkButton = document.querySelector('#copyLinkButton');
// const roomLinkInput = document.querySelector('#roomLink');
// const restartQuizButton = document.querySelector('#restartQuiz');

// function decodeHtmlEntities(text) {
//   const textArea = document.createElement('textarea');
//   textArea.innerHTML = text;
//   return textArea.value;
// }

// function fetchCategories() {
//   fetch('https://opentdb.com/api_category.php')
//     .then(response => response.json())
//     .then(data => {
//       const categories = data.trivia_categories;
//       const categorySelect = document.getElementById('category');
//       categories.forEach(cat => {
//         let option = document.createElement('option');
//         option.value = cat.id;
//         option.text = cat.name;
//         categorySelect.appendChild(option);
//       });
//     });
// }

// function submitAnswer(room, answer, correctAnswer) {
//   const isCorrect = answer === correctAnswer;
//   const feedbackElement = document.createElement('div');
//   feedbackElement.className = 'feedback';
//   if (isCorrect) {
//     feedbackElement.textContent = 'Correct!';
//     feedbackElement.classList.add('text-green-500');
//   } else {
//     feedbackElement.textContent = `Wrong! The correct answer was ${decodeHtmlEntities(correctAnswer)}.`;
//     feedbackElement.classList.add('text-red-500');
//   }
//   document.getElementById('answers').appendChild(feedbackElement);
//   document.querySelectorAll('#answers button').forEach(button => {
//     button.disabled = true;
//     button.classList.add('bg-zinc-500', 'opacity-50');
//   });
// }

// function displayPodium(scores) {
//   const podiumElement = document.getElementById('podium-players');
//   podiumElement.innerHTML = '';

//   const sortedScores = scores.sort((a, b) => b.score - a.score);

//   sortedScores.forEach(({ username, score }, index) => {
//     const playerElement = document.createElement('div');
//     playerElement.className = `player player-${index + 1}`;
//     playerElement.innerHTML = `
//       <h2 class="username">${username}</h2>
//       <p class="score">${score} points</p>
//     `;
//     podiumElement.appendChild(playerElement);
//   });

//   document.getElementById('podium').classList.remove('hidden');
// }

// function updateScores(scores) {
//   const scoresPanel = document.getElementById('scores');
//   scoresPanel.innerHTML = '';
//   for (const playerId in scores) {
//     const { username, score } = scores[playerId];
//     const scoreElement = document.createElement('div');
//     scoreElement.textContent = `${username}: ${score} points`;
//     scoresPanel.appendChild(scoreElement);
//   }
// }

// document.addEventListener('DOMContentLoaded', function () {
//   const socket = io();
//   const messages = document.getElementById('messages');
//   const msgInput = document.getElementById('msg-input');
//   const messageForm = document.getElementById('message-form');
//   const room = document.getElementById('room-id').textContent;

//   function generateDefaultUsername() {
//     return `User${Math.floor(Math.random() * 10000)}`;
//   }

//   let username = localStorage.getItem('username');
//   if (!username) {
//     username = generateDefaultUsername();
//     localStorage.setItem('username', username);
//   }

//   function updateUsername(newUsername) {
//     username = newUsername;
//     localStorage.setItem('username', username);
//   }

//   const usernameInput = document.querySelector('#username-input');
//   usernameInput.value = username;

//   usernameInput.onchange = function () {
//     const newUsername = document.getElementById('username-input').value;
//     if (newUsername) {
//       updateUsername(newUsername);
//     }
//   };

//   socket.emit('join-room', room, username);

//   const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

//   if (isAdmin) {
//     document.getElementById('adminPanel').style.display = 'flex';
//     fetchCategories();
//   } else {
//     document.getElementById('loader').classList.remove('hidden');
//   }

//   messageForm.onsubmit = function (event) {
//     event.preventDefault();
//     const message = msgInput.value;
//     if (message && room) {
//       socket.emit('message', room, { message, username });
//       msgInput.value = '';
//     }
//   };

//   socket.on('new-message', ({ message, username }) => {
//     const messageLi = document.createElement('li');
//     messageLi.innerHTML = `<b>${username}</b>: ${message}`;
//     messages.appendChild(messageLi);
//   });

//   socket.on('user-joined', (room, scores) => {
//     updateScores(scores);
//     const messageLi = document.createElement('li');
//     messageLi.textContent = `A user joined the room.`;
//     messages.appendChild(messageLi);
//   });

//   socket.on('user-left', (room, socketId, scores) => {
//     updateScores(scores);
//     const messageLi = document.createElement('li');
//     messageLi.textContent = `A user left the room.`;
//     messages.appendChild(messageLi);
//   });

//   socket.on('countdown', function (timeLeft) {
//     const countdownElement = document.getElementById('countdown');
//     const countdownLobbyElement = document.getElementById('countdown-lobby');
//     const countdownAdminElement = document.getElementById('countdown-admin');

//     countdownElement.textContent = `${timeLeft} seconds left...`;
//     countdownLobbyElement.textContent = `${timeLeft} seconds left...`;
//     countdownAdminElement.textContent = `${timeLeft} seconds left...`;
//   });

//   socket.on('displayQuestion', (question) => {
//     document.getElementById('adminPanel').style.display = 'none';
//     document.getElementById('loader').classList.add('hidden');
//     document.getElementById('quizQuestionPanel').classList.remove('hidden');

//     const questionElement = document.getElementById('question');
//     const answersElement = document.getElementById('answers');
//     questionElement.textContent = decodeHtmlEntities(question.question);
//     answersElement.innerHTML = '';

//     const allAnswers = [...question.incorrect_answers];
//     allAnswers.splice(Math.floor(Math.random() * (allAnswers.length + 1)), 0, question.correct_answer);

//     allAnswers.forEach((answer) => {
//       const button = document.createElement('button');
//       button.innerText = decodeHtmlEntities(answer);
//       button.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block mb-2';
//       button.addEventListener('click', () => {
//         submitAnswer(room, answer, question.correct_answer);
//         const time = Date.now();
//         const isCorrect = answer === question.correct_answer;
//         socket.emit('answer', { answer, correctAnswer: question.correct_answer, time, isCorrect }, room);
//       });
//       answersElement.appendChild(button);
//     });
//   });

//   createQuizButton.addEventListener('click', () => {
//     const config = {
//       amount: document.getElementById('amount').value,
//       category: document.getElementById('category').value,
//       difficulty: document.getElementById('difficulty').value,
//       type: document.getElementById('type').value
//     };

//     socket.emit('startQuiz', room, config);
//   });

//   restartQuizButton.addEventListener('click', () => {
//     const config = {
//       amount: document.getElementById('amount').value,
//       category: document.getElementById('category').value,
//       difficulty: document.getElementById('difficulty').value,
//       type: document.getElementById('type').value
//     };

//     socket.emit('restartQuiz', room, config);
//     document.getElementById('podium').classList.add('hidden');
//   });

//   leaveRoomButton.addEventListener('click', () => {
//     socket.emit('leave-room', room);
//     window.location.href = '/';
//   });

//   copyLinkButton.addEventListener('click', () => {
//     const url = new URL(window.location.href);
//     url.searchParams.delete('admin');
//     roomLinkInput.value = url.href;
//     roomLinkInput.select();
//     roomLinkInput.setSelectionRange(0, 99999); // For mobile devices
//     navigator.clipboard.writeText(roomLinkInput.value).then(() => {
//       alert('Room link copied to clipboard!');
//     }).catch(err => {
//       console.error('Failed to copy room link: ', err);
//     });
//   });

//   const url = new URL(window.location.href);
//   url.searchParams.delete('admin');
//   roomLinkInput.value = url.href; // Set the room link value

//   socket.on('quizOver', (finalScores) => {
//     const quizPanel = document.getElementById('quizQuestionPanel');
//     quizPanel.classList.add('hidden');
//     displayPodium(finalScores);
//   });

//   socket.on('score-update', (scores) => {
//     updateScores(scores);
//   });
// });

const createQuizButton = document.querySelector('#createQuiz');
const leaveRoomButton = document.querySelector('#leaveRoom');
const copyLinkButton = document.querySelector('#copyLinkButton');
const roomLinkInput = document.querySelector('#roomLink');
const restartQuizButton = document.querySelector('#restartQuiz');

function decodeHtmlEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

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
    feedbackElement.textContent = `Wrong! The correct answer was ${decodeHtmlEntities(correctAnswer)}.`;
    feedbackElement.classList.add('text-red-500');
  }
  document.getElementById('answers').appendChild(feedbackElement);
  document.querySelectorAll('#answers button').forEach(button => {
    button.disabled = true;
    button.classList.add('bg-zinc-500', 'opacity-50');
  });
}

function displayPodium(scores) {
  const podiumElement = document.getElementById('podium-players');
  podiumElement.innerHTML = '';

  const sortedScores = scores.sort((a, b) => b.score - a.score);

  sortedScores.forEach(({ username, score }, index) => {
    const playerElement = document.createElement('div');
    playerElement.className = `player player-${index + 1}`;
    playerElement.innerHTML = `
      <h2 class="username">${username}</h2>
      <p class="score">${score} points</p>
    `;
    podiumElement.appendChild(playerElement);
  });

  document.getElementById('podium').classList.remove('hidden');
}

function updateScores(scores) {
  const scoresPanel = document.getElementById('scores');
  scoresPanel.innerHTML = '';
  for (const playerId in scores) {
    const { username, score } = scores[playerId];
    const scoreElement = document.createElement('div');
    scoreElement.textContent = `${username}: ${score} points`;
    scoresPanel.appendChild(scoreElement);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const socket = io();
  const messages = document.getElementById('messages');
  const msgInput = document.getElementById('msg-input');
  const messageForm = document.getElementById('message-form');
  const room = document.getElementById('room-id').textContent;

  function generateDefaultUsername() {
    return `User${Math.floor(Math.random() * 10000)}`;
  }

  let username = localStorage.getItem('username');
  if (!username) {
    username = generateDefaultUsername();
    localStorage.setItem('username', username);
  }

  function updateUsername(newUsername) {
    username = newUsername;
    localStorage.setItem('username', username);
  }

  const usernameInput = document.querySelector('#username-input');
  usernameInput.value = username;

  usernameInput.onchange = function () {
    const newUsername = document.getElementById('username-input').value;
    if (newUsername) {
      updateUsername(newUsername);
    }
  };

  socket.emit('join-room', room, username);

  const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

  if (isAdmin) {
    document.getElementById('adminPanel').style.display = 'flex';
    fetchCategories();
  } else {
    document.getElementById('loader').classList.remove('hidden');
  }

  messageForm.onsubmit = function (event) {
    event.preventDefault();
    const message = msgInput.value;
    if (message && room) {
      socket.emit('message', room, { message, username });
      msgInput.value = '';
    }
  };

  socket.on('new-message', ({ message, username }) => {
    const messageLi = document.createElement('li');
    messageLi.innerHTML = `<b>${username}</b>: ${message}`;
    messages.appendChild(messageLi);
  });

  socket.on('user-joined', (room, scores) => {
    updateScores(scores);
    const messageLi = document.createElement('li');
    messageLi.textContent = `A user joined the room.`;
    messages.appendChild(messageLi);
  });

  socket.on('user-left', (room, socketId, scores) => {
    updateScores(scores);
    const messageLi = document.createElement('li');
    messageLi.textContent = `A user left the room.`;
    messages.appendChild(messageLi);
  });

  socket.on('countdown', function (timeLeft) {
    const countdownElement = document.getElementById('countdown');
    const countdownLobbyElement = document.getElementById('countdown-lobby');
    const countdownAdminElement = document.getElementById('countdown-admin');

    countdownElement.textContent = `${timeLeft} seconds left...`;
    countdownLobbyElement.textContent = `${timeLeft} seconds left...`;
    countdownAdminElement.textContent = `${timeLeft} seconds left...`;
  });

  socket.on('displayQuestion', (question) => {
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('quizQuestionPanel').classList.remove('hidden');

    const questionElement = document.getElementById('question');
    const answersElement = document.getElementById('answers');
    questionElement.textContent = decodeHtmlEntities(question.question);
    answersElement.innerHTML = '';

    const allAnswers = [...question.incorrect_answers];
    allAnswers.splice(Math.floor(Math.random() * (allAnswers.length + 1)), 0, question.correct_answer);

    allAnswers.forEach((answer) => {
      const button = document.createElement('button');
      button.innerText = decodeHtmlEntities(answer);
      button.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block mb-2';
      button.addEventListener('click', () => {
        submitAnswer(room, answer, question.correct_answer);
        const time = Date.now();
        const isCorrect = answer === question.correct_answer;
        socket.emit('answer', { answer, correctAnswer: question.correct_answer, time, isCorrect }, room);
      });
      answersElement.appendChild(button);
    });
  });

  createQuizButton.addEventListener('click', () => {
    const config = {
      amount: document.getElementById('amount').value,
      category: document.getElementById('category').value,
      difficulty: document.getElementById('difficulty').value,
      type: document.getElementById('type').value
    };

    socket.emit('startQuiz', room, config);
  });

  restartQuizButton.addEventListener('click', () => {
    document.getElementById('podium').classList.add('hidden');
    document.getElementById('adminPanel').style.display = 'flex';
  });

  leaveRoomButton.addEventListener('click', () => {
    socket.emit('leave-room', room);
    window.location.href = '/';
  });

  copyLinkButton.addEventListener('click', () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    roomLinkInput.value = url.href;
    roomLinkInput.select();
    roomLinkInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(roomLinkInput.value).then(() => {
      alert('Room link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy room link: ', err);
    });
  });

  const url = new URL(window.location.href);
  url.searchParams.delete('admin');
  roomLinkInput.value = url.href;

  socket.on('quizOver', (finalScores) => {
    const quizPanel = document.getElementById('quizQuestionPanel');
    quizPanel.classList.add('hidden');
    displayPodium(finalScores);
  });

  socket.on('score-update', (scores) => {
    updateScores(scores);
  });

  socket.on('quizData', (quizData) => {
    broadcastQuiz(room, quizData);
  });
});
