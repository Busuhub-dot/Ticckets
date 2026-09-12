import jsPDF from "jspdf";
import QRCode from "qrcode";

type TicketPdfData = {
  ticketNumber: string;
  qrToken: string;
};

const TEMPLATE_WIDTH = 3650;
const TEMPLATE_HEIGHT = 1710;

const TICKET_NUMBER_X = 150;
const TICKET_NUMBER_Y = 390;

function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Could not create canvas context."));
        return;
      }

      context.drawImage(image, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    image.onerror = () => {
      reject(new Error("Failed to load ticket template."));
    };

    image.src = src;
  });
}

export async function generateTicketPdf({
  ticketNumber,
  qrToken,
}: TicketPdfData) {
  // --------------------------------------------------
  // PDF PAGE 1
  // --------------------------------------------------

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [TEMPLATE_WIDTH, TEMPLATE_HEIGHT],
    compress: true,
  });

  const templateDataUrl = await loadImageAsDataUrl("/ticket-template.png");

  pdf.addImage(templateDataUrl, "PNG", 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);

  // --------------------------------------------------
  // Ticket number
  // --------------------------------------------------

  pdf.setFont("times", "bold");
  pdf.setFontSize(100);
  pdf.setTextColor(250, 250, 250);

  // pdf.text(ticketNumber, TICKET_NUMBER_X, TICKET_NUMBER_Y);
  pdf.text(ticketNumber, TICKET_NUMBER_X, TICKET_NUMBER_Y, {
    angle: 90,
  });

  // --------------------------------------------------
  // PDF PAGE 2
  // --------------------------------------------------

  pdf.addPage([TEMPLATE_WIDTH, TEMPLATE_HEIGHT], "landscape");

  const qrDataUrl = await QRCode.toDataURL(qrToken, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 1000,
  });

  const qrSize = 800;

  const qrX = (TEMPLATE_WIDTH - qrSize) / 2;

  const qrY = (TEMPLATE_HEIGHT - qrSize) / 2;

  pdf.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --------------------------------------------------
  // QR instruction
  // --------------------------------------------------

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(32);
  pdf.setTextColor(80, 80, 80);

  pdf.text(
    "Scan this QR code at the entrance",
    TEMPLATE_WIDTH / 2,
    qrY + qrSize + 70,
    {
      align: "center",
    },
  );

  return pdf;
}
