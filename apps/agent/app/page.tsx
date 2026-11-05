'use client'

import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import { Streamdown } from 'streamdown'
import 'streamdown/styles.css'

export default function AgentPage() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status } = useChat()

  return (
    <main
      style={{ maxWidth: 640, margin: '40px auto', fontFamily: 'sans-serif' }}
    >
      <h1>Agent</h1>
      {messages.map((message) => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) =>
            part.type === 'text' ? (
              <Streamdown
                key={`${message.id}-${i}`}
                isAnimating={status === 'streaming'}
              >
                {part.text}
              </Streamdown>
            ) : null,
          )}
        </div>
      ))}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          sendMessage({ text: input })
          setInput('')
        }}
      >
        <input
          value={input}
          placeholder="What's the weather in New York in celsius?"
          onChange={(event) => setInput(event.currentTarget.value)}
          style={{ width: '100%' }}
        />
      </form>
    </main>
  )
}
