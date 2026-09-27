import { createContext, useContext, type ReactNode } from "react";

// Tisch reservieren läuft jetzt über die Google-Maps-Reservierung statt über
// das eigene Telefon/E-Mail-Popup.
const GOOGLE_MAPS_RESERVATION_URL =
  "https://www.google.com/maps/reserve/v/dine/c/MvG_OybRE0Y?source=pa&opi=89978449&hl=de";

interface ReservationModalContextType {
  open: () => void;
}

const ReservationModalContext = createContext<ReservationModalContextType>({ open: () => {} });

export function useReservationModal() {
  return useContext(ReservationModalContext);
}

export function ReservationModalProvider({ children }: { children: ReactNode }) {
  const open = () => {
    window.open(GOOGLE_MAPS_RESERVATION_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <ReservationModalContext.Provider value={{ open }}>
      {children}
    </ReservationModalContext.Provider>
  );
}
