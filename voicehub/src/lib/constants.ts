export const audioLanguages = [
  { value: "auto", label: "Auto detect" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "hi", label: "Hindi" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "pt", label: "Portuguese" },
];

export const voiceOptions = [
  { value: "alloy", label: "Alloy", tone: "Balanced and versatile" },
  { value: "ash", label: "Ash", tone: "Warm and grounded" },
  { value: "coral", label: "Coral", tone: "Clear and conversational" },
  { value: "marin", label: "Marin", tone: "Crisp and premium" },
  { value: "sage", label: "Sage", tone: "Calm and thoughtful" },
  { value: "shimmer", label: "Shimmer", tone: "Bright and energetic" },
  { value: "verse", label: "Verse", tone: "Narrative and expressive" },
];

export const pitchOptions = [
  { value: "neutral", label: "Neutral", instructions: "Maintain a natural, confident tone." },
  { value: "warm", label: "Warm", instructions: "Sound warm, reassuring, and slightly softer." },
  { value: "bright", label: "Bright", instructions: "Sound brighter, slightly more animated, and higher in energy." },
  { value: "deep", label: "Deep", instructions: "Sound deeper, calmer, and more anchored." },
];

export const audioOutputFormats = [
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV" },
  { value: "aac", label: "AAC" },
  { value: "flac", label: "FLAC" },
  { value: "opus", label: "Opus" },
];

export const navigationItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/studio/stt", label: "Speech to Text" },
  { href: "/studio/tts", label: "Text to Speech" },
  { href: "/library", label: "Library" },
  { href: "/activity", label: "Activity" },
  { href: "/settings", label: "Settings" },
];
