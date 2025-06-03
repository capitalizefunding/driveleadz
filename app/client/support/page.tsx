"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Modal from "@/components/modal"

export default function ClientSupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const [supportTicket, setSupportTicket] = useState({
    subject: "",
    category: "",
    message: "",
    attachments: null,
  })

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsModalOpen(false)
      }
    }

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape)
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "auto"
    }
  }, [isModalOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSupportTicket({
      ...supportTicket,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert("Support ticket submitted!")
    setSupportTicket({
      subject: "",
      category: "",
      message: "",
      attachments: null,
    })
    setIsModalOpen(false)
    // Implementation would go here
  }

  return (
    <div className="font-vectora">
      <h1 className="text-4xl font-bold mb-12 text-[#05E0E9]">Support</h1>

      {/* Three-column contact options with inline icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* Call Us */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center mb-2">
            <Image src="/images/phone-icon.png" alt="Phone" width={32} height={32} className="mr-2" />
            <h2 className="text-xl font-bold text-[#05E0E9]">Call Us</h2>
          </div>
          <p className="text-lg">(732) 387-7027</p>
        </div>

        {/* Email Us */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center mb-2">
            <Image src="/images/email-icon.png" alt="Email" width={32} height={32} className="mr-2" />
            <h2 className="text-xl font-bold text-[#05E0E9]">Email Us</h2>
          </div>
          <p className="text-lg">admin@driveleadz.com</p>
        </div>

        {/* Get Help */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center mb-2">
            <Image src="/images/support-icon.png" alt="Support" width={32} height={32} className="mr-2" />
            <h2 className="text-xl font-bold text-[#05E0E9]">Get Help</h2>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="text-lg hover:underline cursor-pointer">
            Submit a Ticket
          </button>
        </div>
      </div>

      {/* FAQ Section - Full Width */}
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold text-[#05E0E9] mb-8">Frequently Asked Questions</h2>

        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-2">How do I download my leads?</h3>
            <p className="text-gray-700">
              You can download leads by clicking the "Download" button next to any lead list on the Leadz page.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">What format are the leads provided in?</h3>
            <p className="text-gray-700">
              Leads are available for download in CSV format, which can be opened in Excel or imported into most CRM
              systems.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">How accurate is the lead information?</h3>
            <p className="text-gray-700">
              We strive for at least 95% accuracy on all lead information. If you find inaccuracies, please report them
              to our support team.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-2">Can I request leads for specific industries?</h3>
            <p className="text-gray-700">
              Yes, please contact your account manager to discuss customizing your lead criteria for specific industries
              or regions.
            </p>
          </div>
        </div>
      </div>

      {/* Support Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit a Ticket">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Subject - Inline Label */}
          <div className="flex items-center">
            <label className="text-base font-bold w-24">Subject</label>
            <input
              type="text"
              name="subject"
              value={supportTicket.subject}
              onChange={handleInputChange}
              className="flex-1 modal-form-input"
              required
            />
          </div>

          {/* Category - Inline Label */}
          <div className="flex items-center">
            <label className="text-base font-bold w-24">Category</label>
            <select
              name="category"
              value={supportTicket.category}
              onChange={handleInputChange}
              className="flex-1 modal-form-select"
              required
            >
              <option value="" className="text-gray-500">
                Select a Category
              </option>
              <option value="account" className="text-black">
                Account Issues
              </option>
              <option value="billing" className="text-black">
                Billing Questions
              </option>
              <option value="technical" className="text-black">
                Technical Support
              </option>
              <option value="leads" className="text-black">
                Lead Quality
              </option>
              <option value="other" className="text-black">
                Other
              </option>
            </select>
          </div>

          {/* Message - Label Above */}
          <div>
            <label className="modal-form-label">Message</label>
            <textarea
              name="message"
              value={supportTicket.message}
              onChange={handleInputChange}
              className="w-full modal-form-textarea"
              rows={3}
              required
            />
          </div>

          {/* Attachments - Label Above */}
          <div>
            <label className="modal-form-label">
              Attachments <span className="text-gray-500">(optional)</span>
            </label>
            <div className="text-gray-500">
              <input type="file" name="attachments" className="w-full p-2 text-gray-500" />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button type="submit" className="modal-btn-primary">
              Submit Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
