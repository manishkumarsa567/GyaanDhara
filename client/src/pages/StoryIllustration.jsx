const PALETTES = {
  English: { sky: '#e8f4ff', hill: '#b7e0cc', ground: '#e8d8ae', accent: '#2563eb' },
  Hindi: { sky: '#fff1e6', hill: '#f4c98f', ground: '#ead7ab', accent: '#c2410c' },
  Science: { sky: '#e8fbf2', hill: '#a7dfbd', ground: '#d9e7b5', accent: '#15803d' },
  'Social Studies': { sky: '#f1edff', hill: '#c8b9ed', ground: '#e7d4ae', accent: '#6d28d9' },
  Mathematics: { sky: '#eff6ff', hill: '#b7d4f1', ground: '#e7ddb7', accent: '#0369a1' },
};

export default function StoryIllustration({ subject, topic, visual = '📖' }) {
  const palette = PALETTES[subject] || PALETTES.Science;

  return (
    <svg
      className="story-illustration"
      viewBox="0 0 640 260"
      role="img"
      aria-label={`${subject}: ${topic}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="640" height="260" rx="20" fill={palette.sky} />
      <circle cx="520" cy="58" r="30" fill="#f7c95c" />
      <path d="M0 166 Q120 104 245 165 T490 157 T640 145 V260 H0Z" fill={palette.hill} />
      <path d="M0 208 Q180 170 330 210 T640 194 V260 H0Z" fill={palette.ground} />
      <path d="M268 260 Q300 215 332 260" fill="none" stroke="#fff9e9" strokeWidth="18" strokeLinecap="round" />
      <rect x="248" y="52" width="144" height="144" rx="36" fill="white" opacity="0.92" />
      <rect x="248" y="52" width="144" height="144" rx="36" fill="none" stroke={palette.accent} strokeOpacity="0.18" strokeWidth="3" />
      <text x="320" y="143" textAnchor="middle" dominantBaseline="middle" fontSize="66" fontFamily="sans-serif">
        {visual}
      </text>
      <path d="M64 184 h64 M94 166 v36 M470 187 h76" stroke={palette.accent} strokeOpacity="0.48" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
