const progressEl = document.getElementById('progress');
const scoreEl = document.getElementById('score');
const questionNumberEl = document.getElementById('question-number');
const questionTextEl = document.getElementById('question-text');
const optionsForm = document.getElementById('options-form');
const feedbackEl = document.getElementById('feedback');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

let questions = [];
let currentIndex = 0;
let correctCount = 0;
let submitted = false;

const shuffle = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const resetState = () => {
  currentIndex = 0;
  correctCount = 0;
  submitted = false;
  scoreEl.textContent = `Teisingi: ${correctCount}`;
};

const renderQuestion = () => {
  submitted = false;
  feedbackEl.textContent = '';
  feedbackEl.className = 'feedback';
  submitBtn.disabled = false;
  nextBtn.disabled = true;

  const question = questions[currentIndex];
  progressEl.textContent = `Klausimas ${currentIndex + 1} iš ${questions.length}`;
  questionNumberEl.textContent = `Klausimas ${question.number}`;
  questionTextEl.textContent = question.text;

  optionsForm.innerHTML = '';
  question.options.forEach((option) => {
    const optionId = `option-${question.number}-${option.letter}`;
    const wrapper = document.createElement('label');
    wrapper.className = 'option';
    wrapper.dataset.letter = option.letter;

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'answer';
    input.value = option.letter;
    input.id = optionId;

    const text = document.createElement('span');
    text.textContent = `${option.letter}) ${option.text}`;

    wrapper.appendChild(input);
    wrapper.appendChild(text);
    optionsForm.appendChild(wrapper);
  });
};

const showSummary = () => {
  progressEl.textContent = `Baigta: ${questions.length} klausimų`;
  questionNumberEl.textContent = 'Testas baigtas';
  questionTextEl.textContent = '';
  optionsForm.innerHTML = '';
  feedbackEl.className = 'feedback success summary';
  feedbackEl.textContent = `Jūsų rezultatas: ${correctCount} iš ${questions.length}.`;
  submitBtn.disabled = true;
  nextBtn.disabled = true;
};

const setFeedback = ({ correct, correctOption, selectedOption }) => {
  feedbackEl.innerHTML = '';
  feedbackEl.className = `feedback ${correct ? 'success' : 'error'}`;

  const title = document.createElement('p');
  title.textContent = correct ? 'Teisingai!' : 'Neteisinga.';
  feedbackEl.appendChild(title);

  if (!correct) {
    const correctLine = document.createElement('p');
    correctLine.textContent = `Teisingas atsakymas: ${correctOption.letter}) ${correctOption.text}`;
    feedbackEl.appendChild(correctLine);
  }

  const selectedLine = document.createElement('p');
  selectedLine.textContent = `Jūsų atsakymas: ${selectedOption.letter}) ${selectedOption.text}`;
  feedbackEl.appendChild(selectedLine);
};

const handleSubmit = () => {
  if (submitted) {
    return;
  }
  const selectedInput = optionsForm.querySelector('input[name="answer"]:checked');
  if (!selectedInput) {
    feedbackEl.className = 'feedback error';
    feedbackEl.textContent = 'Pasirinkite atsakymą prieš tikrinant.';
    return;
  }

  submitted = true;
  const question = questions[currentIndex];
  const selectedLetter = selectedInput.value;
  const correctLetter = question.answer;
  const selectedOption = question.options.find((option) => option.letter === selectedLetter);
  const correctOption = question.options.find((option) => option.letter === correctLetter);

  optionsForm.querySelectorAll('.option').forEach((optionEl) => {
    const letter = optionEl.dataset.letter;
    if (letter === correctLetter) {
      optionEl.classList.add('correct');
    }
    if (letter === selectedLetter && selectedLetter !== correctLetter) {
      optionEl.classList.add('incorrect');
    }
  });

  if (selectedLetter === correctLetter) {
    correctCount += 1;
    scoreEl.textContent = `Teisingi: ${correctCount}`;
  }

  setFeedback({
    correct: selectedLetter === correctLetter,
    correctOption,
    selectedOption,
  });

  submitBtn.disabled = true;
  nextBtn.disabled = false;
};

const handleNext = () => {
  if (currentIndex + 1 >= questions.length) {
    showSummary();
    return;
  }
  currentIndex += 1;
  renderQuestion();
};

const handleRestart = () => {
  questions = shuffle(questions);
  resetState();
  renderQuestion();
};

submitBtn.addEventListener('click', handleSubmit);
nextBtn.addEventListener('click', handleNext);
restartBtn.addEventListener('click', handleRestart);

fetch('questions.json')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Nepavyko įkelti klausimų.');
    }
    return response.json();
  })
  .then((data) => {
    questions = shuffle(data);
    resetState();
    renderQuestion();
  })
  .catch(() => {
    feedbackEl.className = 'feedback error';
    feedbackEl.textContent = 'Nepavyko įkelti klausimų sąrašo. Patikrinkite questions.json.';
  });
