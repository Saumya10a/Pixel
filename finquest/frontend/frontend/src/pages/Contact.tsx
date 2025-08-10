"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

export default function Contact() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return toast("Please fill all fields")
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success("Message sent. We'll get back to you soon!")
      setName("")
      setEmail("")
      setMessage("")
    }, 700)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">Contact</h1>
        <p className="text-muted-foreground">Questions, feedback, or partnerships? We’d love to hear from you.</p>
        <div className="glass p-6 rounded-xl">
          <p className="text-sm text-muted-foreground">
            For support, reach us via this form. We typically respond within 1–2 business days.
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="glass p-6 rounded-xl space-y-4">
        <label className="block text-sm">
          Name
          <input
            className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Email
          <input
            type="email"
            className="mt-1 w-full glass px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Message
          <textarea
            className="mt-1 w-full glass px-3 py-2 rounded-lg min-h-28 focus-visible:ring-2 focus-visible:ring-ring"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className={`ripple-btn rounded-lg px-4 py-2 ${loading ? "opacity-70 cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-90"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
        >
          {loading ? "Sending..." : "Send message"}
        </button>
      </form>
    </div>
  )
}
