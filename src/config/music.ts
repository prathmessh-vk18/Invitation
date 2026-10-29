// Aavjoo's own background tracks, composed live in the browser from raga scales,
// so there is nothing to license. Licensed recordings can be added as `file` tracks:
// put the MP3 in public/music and add { id: "file:/music/name.mp3", ... } below.

export type Track = {
  id: string; // "synth:<preset>" or "file:<url>"
  name: string;
  mood: string;
};

export type SynthPreset = {
  // Sa, in Hz.
  sa: number;
  // Melody notes as ratios of Sa, low to high.
  scale: number[];
  // Tanpura drone cycle as ratios of Sa.
  drone: number[];
  droneEvery: number; // ms between drone plucks
  noteEvery: number; // ms between melody chances
  rest: number; // 0–1, how often a melody beat is left silent
  voice: OscillatorType;
  brightness: number; // filter cutoff for the melody
  sustain: number; // seconds each melody note rings
  echo: number; // 0–1 feedback amount
};

const S = { sa: 1, re: 9 / 8, komalGa: 6 / 5, ga: 5 / 4, ma: 4 / 3, teevraMa: 45 / 32, pa: 3 / 2, dha: 5 / 3, komalNi: 9 / 5, ni: 15 / 8 };
const up = (r: number) => r * 2;

export const presets: Record<string, SynthPreset> = {
  bhupali: {
    sa: 138.59,
    scale: [S.sa, S.re, S.ga, S.pa, S.dha, up(S.sa), up(S.re), up(S.ga)],
    drone: [0.75, 1, 1, 0.5],
    droneEvery: 1050,
    noteEvery: 520,
    rest: 0.42,
    voice: "triangle",
    brightness: 5000,
    sustain: 2.2,
    echo: 0.28,
  },
  yaman: {
    sa: 130.81,
    scale: [S.ni / 2, S.sa, S.re, S.ga, S.teevraMa, S.pa, S.dha, S.ni, up(S.sa), up(S.re)],
    drone: [0.75, 1, 1, 0.5],
    droneEvery: 1300,
    noteEvery: 700,
    rest: 0.5,
    voice: "sine",
    brightness: 3200,
    sustain: 3,
    echo: 0.38,
  },
  desh: {
    sa: 146.83,
    scale: [S.sa, S.re, S.ma, S.pa, S.dha, S.komalNi, S.ni, up(S.sa), up(S.re)],
    drone: [0.75, 1, 1, 0.5],
    droneEvery: 950,
    noteEvery: 430,
    rest: 0.35,
    voice: "triangle",
    brightness: 6000,
    sustain: 1.6,
    echo: 0.22,
  },
  utsav: {
    sa: 155.56,
    scale: [S.sa, S.re, S.ga, S.pa, S.dha, up(S.sa), up(S.re), up(S.ga), up(S.pa)],
    drone: [1, 0.75, 1, 0.5],
    droneEvery: 700,
    noteEvery: 300,
    rest: 0.3,
    voice: "square",
    brightness: 2600,
    sustain: 0.9,
    echo: 0.18,
  },
  kafi: {
    sa: 123.47,
    scale: [S.sa, S.re, S.komalGa, S.ma, S.pa, S.dha, S.komalNi, up(S.sa), up(S.re)],
    drone: [0.75, 1, 1, 0.5],
    droneEvery: 1400,
    noteEvery: 820,
    rest: 0.55,
    voice: "sine",
    brightness: 2600,
    sustain: 3.4,
    echo: 0.42,
  },
};

// Licensed songs (licensing is handled by Aavjoo). Files live in public/music.
// To remove a song: delete its line here and its file.
export const songs: Track[] = [
  { id: "file:/music/kesariya.mp3", name: "Kesariya", mood: "Brahmastra · romantic" },
  { id: "file:/music/raataan-lambiyan.mp3", name: "Raataan Lambiyan", mood: "Shershaah · soft and warm" },
  { id: "file:/music/tere-vaaste.mp3", name: "Tere Vaaste", mood: "Zara Hatke Zara Bachke · sweet" },
  { id: "file:/music/din-shagna-da.mp3", name: "Din Shagna Da", mood: "Phillauri · wedding classic" },
  { id: "file:/music/kabira-encore.mp3", name: "Kabira (Encore)", mood: "Yeh Jawaani Hai Deewani · emotional" },
  { id: "file:/music/aaj-sajeya.mp3", name: "Aaj Sajeya", mood: "Goldie Sohel · bridal entry" },
  { id: "file:/music/sajna.m4a", name: "Sajna", mood: "Darshan Raval · soft and romantic" },
  { id: "file:/music/vaaroon.m4a", name: "Vaaroon", mood: "Anand Bhaskar · from Mirzapur" },
  { id: "file:/music/raah-mein-unse-mulaqat.m4a", name: "Raah Mein Unse Mulaqat", mood: "Vijaypath · instrumental" },
];

export const instrumentals: Track[] = [
  { id: "synth:bhupali", name: "Shubh Aarambh", mood: "Morning raga · calm and auspicious" },
  { id: "synth:yaman", name: "Saanjh", mood: "Evening raga · soft and romantic" },
  { id: "synth:desh", name: "Barkha", mood: "Raag Desh · joyful and light" },
  { id: "synth:utsav", name: "Utsav", mood: "Festive · bright and quick" },
  { id: "synth:kafi", name: "Ehsaas", mood: "Raag Kafi · tender and slow" },
];

// Songs added for one couple: an order can use them, but they aren't offered in the song picker.
export const privateSongs: Track[] = [
  { id: "file:/music/krishna-flute.m4a", name: "Krishna Flute Theme", mood: "Iftekharul x Stereo India · flute (Akshay & Vidhi)" },
];

export const tracks: Track[] = [...songs, ...instrumentals];

/** The playable URL or synth id for a track id. */
export const trackSrc = (id: string) => (id.startsWith("file:") ? id.slice(5) : id);

export const isTrackId = (id: unknown): id is string => typeof id === "string" && [...tracks, ...privateSongs].some((t) => t.id === id);
