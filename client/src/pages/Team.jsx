import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { answerQuestionWithDocs, clearQuestionAnswer } from "../features/documentSlice";

const QuestionAnswerPage = () => {
  const dispatch = useDispatch();

  const [question, setQuestion] = useState("");

  const { questionAnswer, questionAnswerLoading, error } = useSelector(
    (state) => state.documents
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    dispatch(answerQuestionWithDocs({ question }));
  };

  const handleClear = () => {
    setQuestion("");
    dispatch(clearQuestionAnswer());
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-black border border-white/20 rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Document Q&A
        </h1>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Ask a question about your documents..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 px-4 py-3 rounded-md border border-white/20 bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            disabled={questionAnswerLoading}
            className="px-5 py-3 rounded-md bg-white text-black font-medium hover:bg-gray-200 disabled:opacity-50 transition"
          >
            {questionAnswerLoading ? "Thinking..." : "Ask"}
          </button>
          {questionAnswer && (
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-3 rounded-md border border-white text-white hover:bg-white hover:text-black transition"
            >
              Clear
            </button>
          )}
        </form>

        {/* Error */}
        {error && (
          <p className="mt-2 text-red-500 text-sm">❌ {error}</p>
        )}

        {/* Answer */}
        {questionAnswer && (
          <div className="p-6 mt-4 border border-white/20 rounded-md bg-black text-white">
            <h3 className="text-lg font-semibold mb-3">Answer</h3>
            <p className="leading-relaxed">{questionAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionAnswerPage;
