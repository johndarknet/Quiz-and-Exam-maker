import React, { useState } from 'react';

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);

  const onFileChange = (e) => setFile(e.target.files[0]);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Choose a file (PDF or PPTX)');
      return;
    }

    setLoading(true);
    setError(null);

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:5000/generate-quiz', {
        method: 'POST',
        body: fd
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      setQuiz(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Quiz from PDF / PPTX</h1>

      <form onSubmit={submit}>
        <input type="file" accept=".pdf,.pptx" onChange={onFileChange} />
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
          {loading ? 'Generating...' : 'Upload & Generate Quiz'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: 12 }}>
          Error: {error}
        </div>
      )}

      {quiz && (
        <div style={{ marginTop: 20 }}>
          <h2>Generated quiz for: {quiz.title}</h2>
          <div>Source text length: {quiz.source_text_length} characters</div>

          <ol>
            {quiz.questions.map((q) => (
              <li key={q.id} style={{ marginBottom: 16 }}>
                <div><strong>Question:</strong></div>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{q.question}</pre>

                {q.type === "multiple_choice" && (
                  <>
                    <div><strong>Choices:</strong></div>
                    <ul>
                      {q.choices.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </>
                )}

                <div style={{ fontSize: 12, color: '#666' }}>
                  <strong>Answer:</strong>{" "}
                  {Array.isArray(q.answer) ? q.answer.join(", ") : q.answer}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
