import { useState, useEffect } from 'react'
import Head from 'next/head'

const scenarios = [
  {
    id: 1,
    text: "Hi, I just created a Coinbase account but I can't figure out how to enable two-factor authentication. Can you help me?",
    keywords: ["2-factor", "two factor", "enable", "authentication", "account"],
  },
  {
    id: 2,
    text: "I sent some bitcoin to the wrong address. Is there any way to get it back?",
    keywords: ["no", "irreversible", "can't", "refund"],
  },
]

function simpleScore(answer, keywords) {
  const lower = answer.toLowerCase()
  let matched = 0
  keywords.forEach(k => {
    if (lower.includes(k.toLowerCase())) matched += 1
  })
  return matched / keywords.length
}

function grammarScore(answer) {
  const goodStart = /^[A-Z]/.test(answer)
  const goodEnd = /[.!?]$/.test(answer.trim())
  return (goodStart && goodEnd) ? 1 : 0
}

function empathyScore(answer) {
  return /(sorry|apologize|understand|appreciate)/i.test(answer) ? 1 : 0
}

export default function Training() {
  const [step, setStep] = useState(0)
  const [answer, setAnswer] = useState('')
  const [scores, setScores] = useState([])
  const [listening, setListening] = useState(false)
  const [recognition, setRecognition] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      const rec = new window.SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.onresult = e => {
        const txt = e.results[0][0].transcript
        setAnswer(txt)
        setListening(false)
      }
      rec.onend = () => setListening(false)
      setRecognition(rec)
    } else if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const rec = new window.webkitSpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      rec.onresult = e => {
        const txt = e.results[0][0].transcript
        setAnswer(txt)
        setListening(false)
      }
      rec.onend = () => setListening(false)
      setRecognition(rec)
    }
  }, [])

  const current = scenarios[step]

  const handleStart = () => {
    if (recognition) {
      setAnswer('')
      setListening(true)
      recognition.start()
    }
  }

  const handleSubmit = () => {
    const accuracy = simpleScore(answer, current.keywords)
    const grammar = grammarScore(answer)
    const empathy = empathyScore(answer)
    const fluency = answer.split(/\s+/).length > 4 ? 1 : 0
    const total = (accuracy + grammar + empathy + fluency) / 4
    setScores([...scores, { accuracy, grammar, empathy, fluency, total }])
    setAnswer('')
    if (step + 1 < scenarios.length) {
      setStep(step + 1)
    }
  }

  const finished = step >= scenarios.length
  const summary = scores.reduce((acc, s) => acc + s.total, 0) / scores.length

  return (
    <div className="container">
      <Head>
        <title>Training Module</title>
      </Head>
      <main>
        <h1>Coinbase Customer Support Training</h1>
        {!finished && (
          <div>
            <p><strong>Scenario {current.id}:</strong> {current.text}</p>
            {recognition ? (
              <button onClick={handleStart} disabled={listening}>Start Answer</button>
            ) : (
              <p>Your browser does not support speech recognition. Please type your answer.</p>
            )}
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} rows={4} cols={50} />
            <button onClick={handleSubmit}>Submit</button>
          </div>
        )}
        {finished && (
          <div>
            <h2>Training Complete</h2>
            <p>Average Score: {(summary * 100).toFixed(0)}%</p>
            <p>This demo is not affiliated with Coinbase. Use for training purposes only.</p>
          </div>
        )}
      </main>
    </div>
  )
}

