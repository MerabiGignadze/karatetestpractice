import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import questionData from "./kumiteQuestions";
import "./App.css";

const maxQuestions = 70;
const maxErrors = 6;
const timeForEachQuestion = 17;

const App = function () {
  const [randomQuestion, setRandomQuestion] = useState(null);
  const [questionCounter, setQuestionCounter] = useState(0);
  const [errorCounter, setErrorCounter] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctnessStatus, setCorrectnessStatus] = useState(null);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [incorrectQuestionIds, setIncorrectQuestionIds] = useState("");
  const [resetFlag, setResetFlag] = useState(false);

  useEffect(() => {
    if (resetFlag) {
      setIncorrectQuestionIds("");
      setResetFlag(false);
    }
  }, [resetFlag]);

  useEffect(() => {
    if (questionCounter > 0 && errorCounter >= maxErrors) {
      const incorrectIndexes = incorrectQuestionIds
        .split("_")
        .map((id) => parseInt(id))
        .map((id) => id + 1);

      const formattedMistakes = incorrectIndexes
        .map(
          (index) =>
            `Question ${index - 1} : Question ${
              questionData[index - 1].description
            }`
        )
        .join("\n\n");

      alert(
        `You've reached the maximum number of errors. The test is over.\n\n${formattedMistakes}`
      );
      window.location.reload(); // Refresh the page
    }
  }, [errorCounter, questionCounter]);

  useEffect(() => {
    if (isTestStarted && questionCounter <= maxQuestions) {
      const timer = setInterval(() => {
        if (elapsedTime >= timeForEachQuestion) {
          handleNextQuestion();
          setElapsedTime(0);
        } else {
          setElapsedTime((prevTime) => prevTime + 1);
        }
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [isTestStarted, questionCounter, elapsedTime]);

  const startTest = () => {
    setIsTestStarted(true);
    setRandomQuestion(getRandomQuestion());
  };

  const getRandomQuestion = () => {
    const questionIds = Object.keys(questionData).filter(
      (id) => !displayedQuestions.includes(id)
    );

    if (questionIds.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * questionIds.length);
    const randomId = questionIds[randomIndex];

    setDisplayedQuestions([...displayedQuestions, randomId]);
    setQuestionCounter(questionCounter + 1);

    return questionData[randomId];
  };

  const checkAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const evaluateAnswer = () => {
    if (selectedAnswer === null) {
      setErrorCounter(errorCounter + 1);
      setIncorrectQuestionIds(
        (prevIds) =>
          prevIds +
          (prevIds ? "_" : "") +
          displayedQuestions[questionCounter - 1]
      );
    } else if (randomQuestion !== null && selectedAnswer !== null) {
      if (randomQuestion.value === selectedAnswer) {
        setCorrectnessStatus("correct");
      } else {
        setCorrectnessStatus("incorrect");
        setErrorCounter(errorCounter + 1);
        setIncorrectQuestionIds(
          (prevIds) =>
            prevIds +
            (prevIds ? "_" : "") +
            displayedQuestions[questionCounter - 1]
        );
      }
    }
  };

  const handleNextQuestion = () => {
    evaluateAnswer();

    if (questionCounter < maxQuestions) {
      setRandomQuestion(getRandomQuestion());
      setSelectedAnswer(null);
      setCorrectnessStatus(null);
    } else {
      setDisplayedQuestions([]);
      setIncorrectQuestionIds("");
    }
  };

  const remainingTime =
    timeForEachQuestion - (elapsedTime % timeForEachQuestion);
  const fillBarWidth = 100 - (remainingTime / timeForEachQuestion) * 100;

  return (
    <div className="centered-container">
      <h1>Kumite Exam</h1>
      <div className="exam-info">
        <p>
          <span className="question-counter">
            Question: {questionCounter} / {maxQuestions}
          </span>{" "}
          <span className="error-counter">
            Errors: {errorCounter} / {maxErrors}
          </span>
        </p>
      </div>
      {isTestStarted && randomQuestion && questionCounter <= maxQuestions && (
        <div>
          <h2>Question: {questionCounter}</h2>
          <p>{randomQuestion.description}</p>
        </div>
      )}
      {!isTestStarted && (
        <button className="next-button" onClick={startTest}>
          Start Test
        </button>
      )}
      {isTestStarted && questionCounter > maxQuestions && (
        <div>
          <h2>Test Finished</h2>
          <p>You've completed all the questions.</p>
        </div>
      )}
      {isTestStarted && (
        <div
          className="bottom-fill-bar"
          style={{ width: `${fillBarWidth}%` }}
        ></div>
      )}
      {isTestStarted && randomQuestion && questionCounter <= maxQuestions && (
        <div className="true-false-buttons">
          <label>
            <input
              type="checkbox"
              checked={selectedAnswer === true}
              onChange={() => checkAnswer(true)}
            />
            True
          </label>
          <label>
            <input
              type="checkbox"
              checked={selectedAnswer === false}
              onChange={() => checkAnswer(false)}
            />
            False
          </label>
        </div>
      )}
      {correctnessStatus && (
        <div className={`correctness-message ${correctnessStatus}`}>
          {correctnessStatus === "correct" ? "Correct!" : "Incorrect!"}
        </div>
      )}
      {incorrectQuestionIds && (
        <div className="incorrect-questions">
          <p>Incorrect Question IDs:</p>
          <div className="question-id-list">
            {incorrectQuestionIds.split("_").map((id, index) => (
              <span key={index} className="question-id">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

createRoot(document.querySelector("#root")).render(<App />);
