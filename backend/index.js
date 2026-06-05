const rateLimit = require('express-rate-limit')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const OpenAI = require('openai')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

app.use(cors())
app.use(express.json())

const hintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 requests per IP per hour
  message: { error: 'Too many hint requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'CodeSensei backend running' })
})

// AI Hint endpoint
app.post('/api/hint', hintLimiter, async (req, res) => {
  const { challengeTitle, description, code, attemptCount } = req.body

  // Mock hints per challenge for demo purposes
  const mockHints = {
    'Two Sum': [
      'Think about what data structure lets you look up values in O(1) time.',
      'A hash map can store each number and its index as you iterate through the array.',
      'For each number, check if (target - currentNumber) already exists in your hash map.',
    ],
    'Valid Parentheses': [
      'Think about what happens when you see an opening bracket vs a closing bracket.',
      'A stack is perfect here — push opening brackets, pop when you see a closing one.',
      'When you see a closing bracket, check if the top of the stack is the matching opening bracket.',
    ],
    'Reverse Linked List': [
      'Think about what pointers you need to keep track of while traversing.',
      'You need to reverse the direction of each next pointer as you go.',
      'Keep track of the previous node, current node, and next node at each step.',
    ],
  }

  const hints = mockHints[challengeTitle]
  if (hints) {
    const hintIndex = Math.min((attemptCount || 1) - 1, hints.length - 1)
    return res.json({ hint: hints[hintIndex] })
  }

  // If no mock hint, try real OpenAI
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are CodeSensei, an expert coding mentor. Give progressive hints without revealing the full solution. Max 3 sentences.`,
        },
        {
          role: 'user',
          content: `Challenge: ${challengeTitle}
            Description: ${description}
            Current code: ${code || 'No code written yet'}
            Attempt number: ${attemptCount}
            Give me a hint.`,
        },
      ],
      max_tokens: 150,
    })
    const hint = response.choices[0].message.content
    res.json({ hint })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get hint' })
  }
})

app.post('/api/execute', async (req, res) => {
  const { challengeId, code } = req.body

  const testCases = {
    1: [
      { input: [[2,7,11,15], 9], expected: [0,1] },
      { input: [[3,2,4], 6], expected: [1,2] },
      { input: [[3,3], 6], expected: [0,1] },
    ],
    2: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
    ],
    3: [
      { input: [[1,2,3,4,5]], expected: [5,4,3,2,1] },
      { input: [[1,2]], expected: [2,1] },
    ],
  }

  const cases = testCases[challengeId]
  if (!cases) return res.json({ results: [] })

  const results = cases.map((tc, i) => {
    try {
      const fn = new Function(`return (${code})`)()
      const output = fn(...tc.input)
      const passed = JSON.stringify(output) === JSON.stringify(tc.expected)
      return {
        testCase: i + 1,
        passed,
        input: JSON.stringify(tc.input),
        expected: JSON.stringify(tc.expected),
        output: JSON.stringify(output),
      }
    } catch (err) {
      return {
        testCase: i + 1,
        passed: false,
        input: JSON.stringify(tc.input),
        expected: JSON.stringify(tc.expected),
        output: `Error: ${err.message}`,
      }
    }
  })

  res.json({ results })
})

app.listen(PORT, () => {
  console.log(`CodeSensei backend running on port ${PORT}`)
})