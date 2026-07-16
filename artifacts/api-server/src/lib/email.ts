import { Resend } from "resend";
import { appendFileSync } from "fs";
import { join } from "path";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESTAURANT_EMAIL =
  process.env.RESTAURANT_EMAIL ?? "reservierung@quindici.de";
const FROM_EMAIL =
  process.env.FROM_EMAIL ?? "Quindici Trattoria <noreply@quindici.de>";

const EMAIL_DEAD_LETTER_LOG = join(
  process.env.LOG_DIR ?? process.cwd(),
  "email-failures.ndjson",
);

/**
 * Appends a structured failure record to the dead-letter log so ops can
 * identify and manually resend missed emails.
 */
function recordEmailFailure(entry: {
  at: string;
  kind: string;
  reservationId: string;
  guestEmail: string;
  status?: string;
  error: string;
}) {
  try {
    appendFileSync(EMAIL_DEAD_LETTER_LOG, JSON.stringify(entry) + "\n", "utf8");
  } catch (fsErr) {
    console.error("[email] Could not write to dead-letter log:", fsErr);
  }
}

function getResendClient(): Resend | null {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return null;
  }
  return new Resend(RESEND_API_KEY);
}

interface ReservationEmailData {
  id: string;
  date: string;
  time: string;
  guests: string | number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes?: string;
}

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
  } catch {
    return dateStr;
  }
}

export async function sendReservationConfirmationToGuest(
  data: ReservationEmailData,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const formattedDate = formatDate(data.date);

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Georgia, serif; background: #faf9f7; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #faf9f7; padding: 40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background: #1a1a1a; padding: 32px 40px; text-align: center;">
            <h1 style="color: #c9a96e; font-family: Georgia, serif; font-size: 28px; margin: 0; letter-spacing: 2px;">QUINDICI</h1>
            <p style="color: #888; font-size: 12px; margin: 4px 0 0; letter-spacing: 1px;">TRATTORIA PIZZERIA</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 8px;">Reservierungsbestätigung</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
              Liebe/r ${data.firstName} ${data.lastName},<br><br>
              vielen Dank für Ihre Reservierung! Wir freuen uns auf Ihren Besuch und haben Ihren Tisch für Sie reserviert.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background: #faf9f7; border-radius: 4px; padding: 24px; margin-bottom: 28px;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e8e4de;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Datum</span><br>
                  <span style="color: #1a1a1a; font-size: 16px; font-weight: bold;">${formattedDate}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e8e4de;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Uhrzeit</span><br>
                  <span style="color: #1a1a1a; font-size: 16px; font-weight: bold;">${data.time} Uhr</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e8e4de;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Personen</span><br>
                  <span style="color: #1a1a1a; font-size: 16px; font-weight: bold;">${data.guests}</span>
                </td>
              </tr>
              ${
                data.notes
                  ? `<tr>
                <td style="padding: 8px 0;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Anmerkungen</span><br>
                  <span style="color: #1a1a1a; font-size: 15px;">${data.notes}</span>
                </td>
              </tr>`
                  : ""
              }
            </table>

            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
              Bei Fragen oder Änderungen erreichen Sie uns unter:
            </p>
            <p style="color: #1a1a1a; font-size: 14px; margin: 0 0 28px;">
              📞 Telefon: <a href="tel:+4930000000" style="color: #c9a96e;">+49 30 000 000</a><br>
              📧 E-Mail: <a href="mailto:${RESTAURANT_EMAIL}" style="color: #c9a96e;">${RESTAURANT_EMAIL}</a>
            </p>

            <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0; border-top: 1px solid #e8e4de; padding-top: 24px;">
              Wir bitten Sie, uns so früh wie möglich zu informieren, falls Sie Ihre Reservierung stornieren möchten.<br><br>
              Herzliche Grüße,<br>
              <strong>Das Team vom Quindici</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background: #1a1a1a; padding: 20px 40px; text-align: center;">
            <p style="color: #555; font-size: 12px; margin: 0;">
              Quindici Trattoria Pizzeria · Berlin
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Reservierungsbestätigung – ${formattedDate} um ${data.time} Uhr`,
      html,
    });
    if (error) {
      console.error("[email] Failed to send guest confirmation:", error);
    } else {
      console.info("[email] Guest confirmation sent to", data.email);
    }
  } catch (err) {
    console.error("[email] Unexpected error sending guest confirmation:", err);
  }
}

export async function sendReservationStatusUpdateToGuest(
  data: ReservationEmailData,
  newStatus: string,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const formattedDate = formatDate(data.date);

  const isConfirmed = newStatus === "bestätigt";
  const isCancelled = newStatus === "storniert";

  let subjectLine: string;
  let headingText: string;
  let bodyText: string;
  let accentColor: string;

  if (isConfirmed) {
    subjectLine = `Reservierung bestätigt – ${formattedDate} um ${data.time} Uhr`;
    headingText = "Ihre Reservierung wurde bestätigt";
    bodyText = `Liebe/r ${data.firstName} ${data.lastName},<br><br>wir freuen uns, Ihnen mitteilen zu können, dass Ihre Reservierung bei uns <strong>bestätigt</strong> wurde. Wir freuen uns auf Ihren Besuch!`;
    accentColor = "#4caf50";
  } else if (isCancelled) {
    subjectLine = `Reservierung storniert – ${formattedDate} um ${data.time} Uhr`;
    headingText = "Ihre Reservierung wurde storniert";
    bodyText = `Liebe/r ${data.firstName} ${data.lastName},<br><br>wir möchten Sie darüber informieren, dass Ihre Reservierung bei uns leider <strong>storniert</strong> wurde. Für Rückfragen stehen wir Ihnen gerne zur Verfügung.`;
    accentColor = "#e53935";
  } else {
    subjectLine = `Ihre Reservierung wurde aktualisiert – ${formattedDate} um ${data.time} Uhr`;
    headingText = "Ihre Reservierung wurde aktualisiert";
    bodyText = `Liebe/r ${data.firstName} ${data.lastName},<br><br>wir möchten Sie darüber informieren, dass Ihre Reservierung bei uns aktualisiert wurde. Den aktuellen Status entnehmen Sie bitte den Details unten.`;
    accentColor = "#c9a96e";
  }

  const statusLabel =
    newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Georgia, serif; background: #faf9f7; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #faf9f7; padding: 40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background: #1a1a1a; padding: 32px 40px; text-align: center;">
            <h1 style="color: #c9a96e; font-family: Georgia, serif; font-size: 28px; margin: 0; letter-spacing: 2px;">QUINDICI</h1>
            <p style="color: #888; font-size: 12px; margin: 4px 0 0; letter-spacing: 1px;">TRATTORIA PIZZERIA</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 8px;">${headingText}</h2>
            <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 28px;">
              ${bodyText}
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background: #faf9f7; border-radius: 4px; padding: 24px; margin-bottom: 28px;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e8e4de;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Status</span><br>
                  <span style="color: ${accentColor}; font-size: 16px; font-weight: bold;">${statusLabel}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e8e4de;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Datum</span><br>
                  <span style="color: #1a1a1a; font-size: 16px; font-weight: bold;">${formattedDate}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e8e4de;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Uhrzeit</span><br>
                  <span style="color: #1a1a1a; font-size: 16px; font-weight: bold;">${data.time} Uhr</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #e8e4de;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Personen</span><br>
                  <span style="color: #1a1a1a; font-size: 16px; font-weight: bold;">${data.guests}</span>
                </td>
              </tr>
              ${
                data.notes
                  ? `<tr>
                <td style="padding: 8px 0;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Anmerkungen</span><br>
                  <span style="color: #1a1a1a; font-size: 15px;">${data.notes}</span>
                </td>
              </tr>`
                  : ""
              }
            </table>

            <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
              Bei Fragen oder Änderungen erreichen Sie uns unter:
            </p>
            <p style="color: #1a1a1a; font-size: 14px; margin: 0 0 28px;">
              📞 Telefon: <a href="tel:+4930000000" style="color: #c9a96e;">+49 30 000 000</a><br>
              📧 E-Mail: <a href="mailto:${RESTAURANT_EMAIL}" style="color: #c9a96e;">${RESTAURANT_EMAIL}</a>
            </p>

            <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0; border-top: 1px solid #e8e4de; padding-top: 24px;">
              Herzliche Grüße,<br>
              <strong>Das Team vom Quindici</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background: #1a1a1a; padding: 20px 40px; text-align: center;">
            <p style="color: #555; font-size: 12px; margin: 0;">
              Quindici Trattoria Pizzeria · Berlin
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: subjectLine,
      html,
    });
    if (error) {
      const errorMessage = typeof error === "object" && error !== null
        ? JSON.stringify(error)
        : String(error);
      console.error("[email] Failed to send status update to guest:", {
        reservationId: data.id,
        guestEmail: data.email,
        status: newStatus,
        error: errorMessage,
      });
      recordEmailFailure({
        at: new Date().toISOString(),
        kind: "status-update",
        reservationId: data.id,
        guestEmail: data.email,
        status: newStatus,
        error: errorMessage,
      });
    } else {
      console.info(
        `[email] Status update (${newStatus}) sent to ${data.email} [reservation ${data.id}]`,
      );
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[email] Unexpected error sending status update to guest:", {
      reservationId: data.id,
      guestEmail: data.email,
      status: newStatus,
      error: errorMessage,
    });
    recordEmailFailure({
      at: new Date().toISOString(),
      kind: "status-update",
      reservationId: data.id,
      guestEmail: data.email,
      status: newStatus,
      error: errorMessage,
    });
  }
}

export async function sendReservationNotificationToRestaurant(
  data: ReservationEmailData,
): Promise<void> {
  const resend = getResendClient();
  if (!resend) return;

  const formattedDate = formatDate(data.date);

  const html = `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 40px 20px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 4px; overflow: hidden; border: 1px solid #ddd;">
        <tr>
          <td style="background: #1a1a1a; padding: 20px 32px;">
            <h1 style="color: #c9a96e; font-size: 20px; margin: 0;">🍕 Neue Reservierung</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <table width="100%" cellpadding="6" cellspacing="0">
              <tr style="background: #f9f9f9;">
                <td style="font-weight: bold; width: 140px; color: #555;">Datum</td>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Uhrzeit</td>
                <td>${data.time} Uhr</td>
              </tr>
              <tr style="background: #f9f9f9;">
                <td style="font-weight: bold; color: #555;">Personen</td>
                <td>${data.guests}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">Name</td>
                <td>${data.firstName} ${data.lastName}</td>
              </tr>
              <tr style="background: #f9f9f9;">
                <td style="font-weight: bold; color: #555;">Telefon</td>
                <td><a href="tel:${data.phone}">${data.phone}</a></td>
              </tr>
              <tr>
                <td style="font-weight: bold; color: #555;">E-Mail</td>
                <td><a href="mailto:${data.email}">${data.email}</a></td>
              </tr>
              ${
                data.notes
                  ? `<tr style="background: #f9f9f9;">
                <td style="font-weight: bold; color: #555;">Anmerkungen</td>
                <td>${data.notes}</td>
              </tr>`
                  : ""
              }
            </table>

            <p style="color: #888; font-size: 12px; margin: 24px 0 0; border-top: 1px solid #eee; padding-top: 16px;">
              Reservierungs-ID: ${data.id}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: RESTAURANT_EMAIL,
      subject: `Neue Reservierung: ${data.firstName} ${data.lastName} – ${formattedDate} um ${data.time} Uhr (${data.guests} Pers.)`,
      html,
    });
    if (error) {
      console.error(
        "[email] Failed to send restaurant notification:",
        error,
      );
    } else {
      console.info("[email] Restaurant notification sent to", RESTAURANT_EMAIL);
    }
  } catch (err) {
    console.error(
      "[email] Unexpected error sending restaurant notification:",
      err,
    );
  }
}
