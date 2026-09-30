interface DashboardCitasTicketProps {
  variant: "error" | "empty";
}

export function DashboardCitasTicket({ variant }: DashboardCitasTicketProps) {
  const isError = variant === "error";
  return (
    <svg
      width="120"
      height="72"
      viewBox="0 0 120 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={isError ? "drop-shadow-xs" : "text-grape drop-shadow-xs"}
    >
      {/* Ticket body with classic punch notches */}
      <path
        d="M 8 0 H 112 C 116.4 0 120 3.6 120 8 V 26 C 114.5 26 110 30.5 110 36 C 110 41.5 114.5 46 120 46 V 64 C 120 68.4 116.4 72 112 72 H 8 C 3.6 72 0 68.4 0 64 V 46 C 5.5 46 10 41.5 10 36 C 10 30.5 5.5 26 0 26 V 8 C 0 3.6 3.6 0 8 0 Z"
        fill={isError ? "var(--surface)" : "var(--surface-alt)"}
        stroke="var(--border)"
        strokeWidth="1.5"
      />
      {/* Perforated dashed line */}
      <line
        x1="44"
        y1="8"
        x2="44"
        y2="64"
        stroke="var(--border)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      {/* Ticket stamp on left section */}
      <circle cx="22" cy="36" r="11" fill={isError ? "var(--warning-soft)" : "var(--grape-soft)"} />
      <path
        d={isError ? "M 22 31 V 37 M 22 41 H 22.01" : "M 18 36 L 21 39 L 26 33"}
        stroke={isError ? "var(--warning)" : "var(--grape)"}
        strokeWidth={isError ? "2.2" : "2"}
        strokeLinecap="round"
        strokeLinejoin={isError ? undefined : "round"}
      />
      {/* Ticket lines on right section */}
      <rect
        x="54"
        y="24"
        width="50"
        height="5"
        rx="2.5"
        fill="var(--border)"
      />
      <rect
        x="54"
        y="34"
        width="36"
        height="5"
        rx="2.5"
        fill="var(--grape-soft)"
      />
      <rect
        x="54"
        y="44"
        width="24"
        height="4"
        rx="2"
        fill="var(--border)"
      />
    </svg>
  );
}
