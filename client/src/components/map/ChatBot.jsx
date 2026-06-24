import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addMessage, toggleChat, setLoading, setHighlight } from '../../redux/slices/chatSlice'
import { useSendChatMessageMutation } from '../../redux/api/campusApi'

const QUICK_QUERIES = [
  { label: '📚 Library',   query: 'Where is the library?' },
  { label: '🏥 Hospital',  query: 'Hospital timings?' },
  { label: '🏠 Hostels',   query: 'Tell me about hostels' },
  { label: '🍽️ Canteen',  query: 'Where is the canteen?' },
  { label: '📞 Contact',   query: 'Contact information' },
  { label: '🚨 Emergency', query: 'Emergency numbers' },
]

export default function ChatBot() {
  const dispatch  = useDispatch()
  const { messages, isOpen, isLoading } = useSelector((s) => s.chat)
  const [input, setInput]   = useState('')
  const messagesRef = useRef(null)
  const [sendMessage] = useSendChatMessageMutation()

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (text) => {
    const msg = text || input.trim()
    if (!msg || isLoading) return
    setInput('')

    dispatch(addMessage({ sender: 'user', text: msg }))
    dispatch(setLoading(true))

    try {
      const res = await sendMessage(msg).unwrap()
      dispatch(addMessage({ sender: 'bot', text: res.response }))
      if (res.highlightLocation || res.highlightMultipleLocations) {
        dispatch(setHighlight({
          single:   res.highlightLocation || null,
          multiple: res.highlightMultipleLocations || [],
        }))
      }
    } catch {
      dispatch(addMessage({ sender: 'bot', text: 'Sorry, I\'m having trouble connecting. Please try again.' }))
    } finally {
      dispatch(setLoading(false))
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-surface rounded-xl2 shadow-nav border border-border flex flex-col overflow-hidden"
             style={{ height: '480px' }}>
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-semibold text-sm">Campus Guide AI</span>
            </div>
            <button onClick={() => dispatch(toggleChat())} className="text-white/70 hover:text-white transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={m.sender === 'bot' ? 'chat-msg-bot' : 'chat-msg-user'}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="chat-msg-bot flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Quick queries — show only at start */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {QUICK_QUERIES.map((q) => (
                  <button
                    key={q.query}
                    onClick={() => handleSend(q.query)}
                    className="text-xs bg-surface-2 border border-border text-text-secondary hover:text-secondary hover:border-secondary rounded-full px-3 py-1.5 transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              maxLength={500}
              className="flex-1 text-sm bg-surface-2 border border-border rounded-xl px-3 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-secondary text-white px-3 py-2 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => dispatch(toggleChat())}
        className="w-14 h-14 rounded-full bg-primary shadow-nav flex items-center justify-center text-2xl hover:bg-primary-light transition-colors border-2 border-secondary"
      >
        {isOpen ? '✖' : '💬'}
      </button>
    </div>
  )
}
