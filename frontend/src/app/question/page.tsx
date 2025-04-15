'use client';

import React, { useState } from 'react';

interface QuestionPart {
  [index: number]: string;
}

const QuestionGenerationPage = () => {
  const [content, setContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('intermediate');
  const [questions, setQuestions] = useState<QuestionPart[][] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setQuestions(null);
    setLoading(true);

    try {
      // Directly call the backend API
      const backendUrl = 'http://localhost:8000/api/generate-questions/'; // Replace with your actual backend URL
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, num_questions: numQuestions, difficulty }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate questions.');
        return;
      }

      const data = await response.json();
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Question Generation</h1>
      <div className="max-w-lg mx-auto bg-zinc-800 bg-opacity-70 backdrop-blur-md p-6 rounded-lg shadow-md border border-zinc-600">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-300 text-sm font-bold mb-2">
              Content:
            </label>
            <textarea
              id="content"
              className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-zinc-700 text-white"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter content to generate questions from"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="numQuestions" className="block text-gray-300 text-sm font-bold mb-2">
              Number of Questions:
            </label>
            <input
              type="number"
              id="numQuestions"
              className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-zinc-700 text-white"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              min="1"
              max="10"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="difficulty" className="block text-gray-300 text-sm font-bold mb-2">
              Difficulty:
            </label>
            <select
              id="difficulty"
              className="shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline bg-zinc-700 text-white"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loading}
          >
            {loading ? <><span className="animate-spin">&#9696;</span> Generating...</> : 'Generate Questions'}
          </button>
        </form>

        {error && <div className="text-red-400 mb-4 p-3 bg-red-900 bg-opacity-20 rounded-md border border-red-600">{error}</div>}

        {questions && (
          <div className="mt-6 text-gray-300">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-500 pb-2">Generated Questions</h2>
            {questions.map((questionArray: QuestionPart[], index: number) => (
              <div key={index} className="mb-6 p-4 bg-zinc-700 rounded-md">
                {questionArray.map((questionPart: QuestionPart, partIndex: number) => {
                  if (questionPart[0] === "question") {
                    return (
                      <p key={partIndex} className="mb-2">
                        <span className="font-bold">Question {index + 1}:</span> {questionPart[1]}
                      </p>
                    );
                  } else if (questionPart[0] === "option_a") {
                    return <li key={partIndex}>A. {questionPart[1]}</li>;
                  } else if (questionPart[0] === "option_b") {
                    return <li key={partIndex}>B. {questionPart[1]}</li>;
                  } else if (questionPart[0] === "option_c") {
                    return <li key={partIndex}>C. {questionPart[1]}</li>;
                  } else if (questionPart[0] === "option_d") {
                    return <li key={partIndex}>D. {questionPart[1]}</li>;
                  } else if (questionPart[0] === "answer") {
                    return (
                      <p key={partIndex} className="mt-2">
                        <span className="font-bold">Answer:</span> {questionPart[1]}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionGenerationPage;