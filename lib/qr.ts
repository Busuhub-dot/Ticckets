import QRCode from "qrcode";

export async function generateQrDataUrl(token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const url = `${baseUrl}/ticket/${token}`;

  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 500,
  });
}
