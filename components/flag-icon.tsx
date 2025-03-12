interface FlagIconProps {
  country: "uk" | "en"
  className?: string
}

export function FlagIcon({ country, className = "" }: FlagIconProps) {
  if (country === "uk") {
    return (
      <svg
        className={`inline-block ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 800"
        width="24"
        height="16"
      >
        <rect width="1200" height="800" fill="#005BBB" />
        <rect width="1200" height="400" y="400" fill="#FFD500" />
      </svg>
    )
  } else {
    return (
      <svg
        className={`inline-block ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 30"
        width="24"
        height="16"
      >
        <clipPath id="s">
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id="t">
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clipPath="url(#s)">
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    )
  }
}

