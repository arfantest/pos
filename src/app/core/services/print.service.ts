import { Injectable } from "@angular/core"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

@Injectable({
  providedIn: "root",
})
export class PrintService {
  constructor() {}

  async printInvoice(elementId: string, filename = "invoice.pdf"): Promise<void> {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error("Element not found")
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")

      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw error
    }
  }

  printElement(elementId: string,text?:any): void {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error("Element not found")
    }

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      throw new Error("Could not open print window")
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${text || 'Print'} </title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .total { font-weight: bold; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  async generateReport(data: any, title: string): Promise<void> {
    const pdf = new jsPDF()

    // Add title
    pdf.setFontSize(20)
    pdf.text(title, 20, 20)

    // Add date
    pdf.setFontSize(12)
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35)

    let yPosition = 50

    // Add data (this is a simple implementation, you can enhance it)
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        pdf.text(`${index + 1}. ${JSON.stringify(item)}`, 20, yPosition)
        yPosition += 10

        if (yPosition > 280) {
          pdf.addPage()
          yPosition = 20
        }
      })
    }

    pdf.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`)
  }
}
