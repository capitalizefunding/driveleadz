"use client"

import { useEffect, useState } from "react"
import InvoiceTemplate from "@/components/invoice-template"
import { useRouter } from "next/navigation"

export default function InvoiceDownloadPage() {
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get the invoice data from localStorage
    const invoiceData = localStorage.getItem("downloadInvoice")

    if (!invoiceData) {
      // If no invoice data, redirect back to invoices page
      router.push("/admin/invoices")
      return
    }

    try {
      const parsedInvoice = JSON.parse(invoiceData)
      setInvoice(parsedInvoice)

      // Clear the localStorage item after retrieving it
      localStorage.removeItem("downloadInvoice")

      // Generate PDF after a short delay to ensure the template is rendered
      setTimeout(() => {
        generatePDF(parsedInvoice)
      }, 1000)
    } catch (error) {
      console.error("Error parsing invoice data:", error)
      router.push("/admin/invoices")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Update the generatePDF function to handle the new template styling
  const generatePDF = async (invoiceData: any) => {
    try {
      // Dynamically import html2pdf to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default

      const element = document.getElementById("invoice-template")
      if (!element) {
        console.error("Invoice template element not found")
        return
      }

      const opt = {
        margin: 0,
        filename: `invoice-${invoiceData.invoiceNumber}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          // After PDF is generated, redirect back to invoices page
          setTimeout(() => {
            router.push("/admin/invoices")
          }, 1000)
        })
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("There was an error generating the PDF. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Generating Invoice PDF...</h1>
        <p>Please wait while we prepare your download.</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">No Invoice Data Found</h1>
        <p>Redirecting back to invoices page...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Invoice Preview</h1>
      <p className="text-center mb-8">Your PDF is being generated and will download automatically.</p>

      <InvoiceTemplate
        invoice={{
          id: invoice.id,
          invoice_number: invoice.invoiceNumber,
          date_issued: invoice.dateIssued,
          amount: invoice.amount,
          status: invoice.status,
          payment_method: invoice.paymentMethod,
          date_paid: invoice.datePaid,
          lead_type: invoice.leadType,
          quantity: invoice.quantity,
          unit_price: invoice.unitPrice,
          order_description: invoice.orderDescription,
          clients: {
            id: invoice.clients?.id || "",
            company_name: invoice.clientName,
          },
        }}
      />
    </div>
  )
}
