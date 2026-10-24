import type { TemplateId } from "./templates";

// Wedding guides: original articles written for Aavjoo. Each answers a question couples search for,
// with sample wordings they can copy, and ends with designs that suit the occasion.

export type GuideSection = {
  h: string;
  p?: string[];
  list?: string[];
  samples?: { label: string; text: string }[];
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  topic: string;
  readMins: number;
  updated: string;
  intro: string;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  designs: TemplateId[];
};

export const guides: Guide[] = [
  {
    slug: "haldi-invitation-wording",
    title: "Haldi invitation wording: messages, timing and what to include",
    description: "Haldi ceremony invitation wording in English and Hindi, what details guests need, and when to send it, with ready-to-use samples.",
    topic: "Ceremonies",
    readMins: 5,
    updated: "2026-10-28",
    intro:
      "The Haldi is usually the most relaxed, most colourful function of the wedding: turmeric paste, yellow clothes, music and a lot of laughter. Its invitation can be lighter in tone than the main wedding card, but guests still need a few practical details to turn up in the right clothes, at the right place and time.",
    sections: [
      {
        h: "What a Haldi invitation should include",
        list: [
          "The couple's names, and which family is hosting (Haldi is often held separately at the bride's and groom's homes).",
          "Day, date and start time. Haldi is usually a morning or early-afternoon function, so say so clearly.",
          "The venue with a map link. Many Haldis happen at home, so add the flat or building name.",
          "Dress code. Most families ask for yellow; some prefer white or pastels so the colour shows.",
          "A note to wear clothes guests don't mind getting stained, and to bring a change if they're travelling on.",
        ],
      },
      {
        h: "Haldi invitation wording in English",
        samples: [
          {
            label: "Warm and simple",
            text: "With love and turmeric, the Sharma family invites you to the Haldi ceremony of Meera.\nSunday, 12 January · 10:30 am\nSharma Residence, Pune\nDress in yellow and come ready to get a little messy!",
          },
          {
            label: "Fun and casual",
            text: "Things are about to get yellow! Join us for Aarav's Haldi.\nSaturday, 11 January · 11 am onwards\nWear something you love, but not too much.",
          },
        ],
      },
      {
        h: "Haldi invitation wording in Hindi",
        samples: [
          {
            label: "Traditional",
            text: "सादर आमंत्रण\nहमारी सुपुत्री मीरा की हल्दी की रस्म में आप सपरिवार सादर आमंत्रित हैं।\nरविवार, 12 जनवरी · प्रातः 10:30 बजे\nपीले वस्त्रों में पधारें।",
          },
        ],
      },
      {
        h: "When to send it",
        p: [
          "If the Haldi is part of one combined wedding invitation, it goes out with everything else, usually four to six weeks before the wedding. If you send a separate Haldi message, the week before is fine, with a reminder the evening before.",
          "With a digital invitation you can add the Haldi as its own card, with its own map and dress code, inside the same link as the wedding.",
        ],
      },
    ],
    faqs: [
      { q: "Is Haldi held before or after Mehndi?", a: "It varies by family and region. Many weddings hold Haldi on the morning before the wedding and Mehndi the evening before that, but plenty of families do it the other way round. Follow your family's custom and state the date clearly." },
      { q: "Can the bride and groom have one combined Haldi?", a: "Yes, more couples now do a joint Haldi, especially at destination weddings. Mention both names and both families in the wording." },
    ],
    designs: ["gulmohar", "khat", "rajwada"],
  },
  {
    slug: "mehndi-invitation-wording",
    title: "Mehndi invitation wording: samples for the bride's mehndi night",
    description: "Mehndi ceremony invitation wording in English and Hindi, what to include, and how to plan the dress code and timings.",
    topic: "Ceremonies",
    readMins: 5,
    updated: "2026-10-28",
    intro:
      "The Mehndi is where the bride's hands and feet are decorated with henna while family and friends sing, dance and eat. It's often an afternoon-into-evening function and one of the most photographed, so a little guidance in the invitation goes a long way.",
    sections: [
      {
        h: "What to include",
        list: [
          "Whose Mehndi it is and who is hosting.",
          "Start time, and roughly how long it runs. Henna takes hours, so guests like to know when the music and food begin.",
          "Venue and map link.",
          "Dress code: greens, pinks, florals or 'festive casual' are common.",
          "Whether guests can get mehndi applied too. Many families arrange extra artists.",
        ],
      },
      {
        h: "Mehndi invitation wording in English",
        samples: [
          {
            label: "Classic",
            text: "Join us for an evening of henna, music and dancing as we celebrate Tara's Mehndi.\nFriday, 22 January · 4 pm onwards\nThe Orchid Garden, Koregaon Park, Pune\nDress code: pastels and florals",
          },
          {
            label: "Playful",
            text: "Bring your best moves, we'll bring the mehndi cones.\nTara's Mehndi night · Friday, 22 January · 6 pm",
          },
        ],
      },
      {
        h: "Mehndi invitation wording in Hindi",
        samples: [
          {
            label: "Traditional",
            text: "मेहंदी की रस्म\nहमारी लाडली तारा की मेहंदी के शुभ अवसर पर आप सादर आमंत्रित हैं।\nशुक्रवार, 22 जनवरी · शाम 4 बजे से\nगीत, संगीत और भोज के साथ।",
          },
        ],
      },
      {
        h: "Tips that make the evening smoother",
        list: [
          "Put food and music timings in the note, so guests who don't want henna know when to arrive.",
          "If artists are limited, say 'mehndi for the first 40 guests' or ask guests to RSVP for it.",
          "Share the sangeet or wedding details in the same link so nobody needs a second message.",
        ],
      },
    ],
    faqs: [
      { q: "Is Mehndi only for the bride's side?", a: "Traditionally it was hosted by the bride's family, but many weddings now hold one Mehndi for both sides, or a small one at the groom's home too." },
      { q: "How long before the wedding is the Mehndi?", a: "Usually one or two days before. Henna darkens over 24 to 48 hours, which is why it isn't held on the wedding morning." },
    ],
    designs: ["gulmohar", "khat", "bagh"],
  },
  {
    slug: "sangeet-invitation-wording",
    title: "Sangeet invitation wording: messages for the music night",
    description: "Sangeet night invitation wording ideas, dress codes and what to tell guests about performances, with copy-ready samples.",
    topic: "Ceremonies",
    readMins: 4,
    updated: "2026-10-28",
    intro:
      "The Sangeet has grown from an evening of folk songs into a full night of performances, choreographed dances and a party. Your invitation sets the tone: is it a family evening of songs, or a black-tie dance night?",
    sections: [
      {
        h: "What guests want to know",
        list: [
          "Start time and whether dinner is served.",
          "Dress code. 'Indo-western', 'sequins and shimmer' and 'festive glam' are popular.",
          "Whether there are performances, and whether guests are invited to perform. Give a contact person and deadline.",
          "Venue and map link. Sangeets often run late, so mention parking or cab pick-up if you've arranged it.",
        ],
      },
      {
        h: "Sangeet invitation wording",
        samples: [
          {
            label: "Party night",
            text: "Lights, music, dhol! You're invited to the Sangeet of Rhea & Arjun.\nFriday, 12 March · 7:30 pm\nSunset Lawns, Jaipur\nDress code: festive glam. Bring your dancing shoes.",
          },
          {
            label: "Family evening",
            text: "An evening of songs, laughter and family.\nThe Kapoor and Malhotra families invite you to the Sangeet of Rhea and Arjun.\nFriday, 12 March · 7 pm · Dinner to follow",
          },
          {
            label: "Calling performers",
            text: "Want to perform at the Sangeet? Message Simran by 28 February with your song so we can plan the running order.",
          },
        ],
      },
    ],
    faqs: [
      { q: "Can the Sangeet and Mehndi be one event?", a: "Yes. Many weddings combine them into a single afternoon-to-night function, with mehndi first and performances after sunset. Name it 'Mehndi & Sangeet' so guests know both are happening." },
    ],
    designs: ["phulkari", "rajwada", "agni"],
  },
  {
    slug: "marathi-lagna-patrika-format",
    title: "Marathi lagna patrika format: wording, order and sample text",
    description: "How a Marathi wedding invitation (lagna patrika) is laid out, the honorifics used for the bride and groom, and sample Marathi wording.",
    topic: "Regional",
    readMins: 6,
    updated: "2026-10-28",
    intro:
      "A traditional Marathi lagna patrika follows a familiar order: an invocation, the hosts, the couple with their honorifics, the muhurta, the venue, and the family members who invite you. Getting the honorifics right matters to elders, so it's worth checking them before you print or share.",
    sections: [
      {
        h: "The usual order of a lagna patrika",
        list: [
          "An invocation at the top, such as ॥ श्री गणेशाय नमः ॥ or the family deity's name.",
          "A line inviting you with the family's blessings.",
          "The groom's name with चि. (chiranjeev) and the bride's name with चि. सौ. कां. (chiranjeev saubhagyakankshini), each with their parents' names.",
          "The day, date and the shubh muhurta time.",
          "The venue (often a karyalay or mangal karyalay) with address.",
          "Other ceremonies such as Simant Pujan, Haldi or the reception, with times.",
          "The names of family members inviting you, often under आग्रहाचे निमंत्रण or सस्नेह निमंत्रण.",
        ],
      },
      {
        h: "Sample Marathi wording",
        samples: [
          {
            label: "Main invitation",
            text: "॥ श्री गणेशाय नमः ॥\nआमच्या कुलदेवतेच्या कृपेने\nचि. आदित्य (श्री. व सौ. देशपांडे यांचे सुपुत्र)\nआणि\nचि. सौ. कां. तारा (श्री. व सौ. कुलकर्णी यांची सुकन्या)\nयांचा शुभविवाह\nरविवार, दिनांक २४ जानेवारी रोजी, शुभ मुहूर्त सकाळी ११:३० वाजता\nस्थळ: श्री मंगल कार्यालय, पुणे\nया मंगल प्रसंगी आपण सहकुटुंब उपस्थित राहून वधू-वरांस शुभाशीर्वाद द्यावेत, ही नम्र विनंती.",
          },
          {
            label: "Closing line",
            text: "आपले नम्र: देशपांडे व कुलकर्णी परिवार",
          },
        ],
      },
      {
        h: "Going digital without losing tradition",
        p: [
          "A digital invitation can keep the Devanagari invocation and honorifics exactly as on a printed patrika, while adding a map for each karyalay, a countdown to the muhurta, and RSVP on WhatsApp. Ask an elder in the family to read the Marathi text once before you share it.",
        ],
      },
    ],
    faqs: [
      { q: "What does चि. सौ. कां. mean?", a: "It stands for chiranjeev saubhagyakankshini, the honorific traditionally used for an unmarried bride: wishing her a long life and a blessed married life. The groom is written as चि., chiranjeev." },
      { q: "Should the muhurta time be exact?", a: "Yes. Families usually print the exact muhurta given by the priest, and guests plan to arrive before it." },
    ],
    designs: ["rajwada", "agni", "mahal"],
  },
  {
    slug: "nikah-invitation-wording",
    title: "Nikah invitation wording in English, Urdu and Hindi",
    description: "Nikah and Walima invitation wording with Bismillah, how to word the hosts and timings, and sample messages for a Muslim wedding.",
    topic: "Regional",
    readMins: 5,
    updated: "2026-10-28",
    intro:
      "A Nikah invitation usually opens with Bismillah, names the couple and their parents, and gives timings for the Nikah and, often separately, the Walima hosted by the groom's family. The wording tends to be graceful and formal, with a dua for the couple.",
    sections: [
      {
        h: "What to include",
        list: [
          "Bismillah at the top, in Arabic script or as 'In the name of Allah, the Most Gracious, the Most Merciful'.",
          "The couple's names and their parents' names.",
          "The Nikah date and time (often after a particular namaz), and the venue.",
          "The Walima details, noting which family hosts it.",
          "Any separate arrangements, such as separate seating or timings for men and women.",
        ],
      },
      {
        h: "Sample wording",
        samples: [
          {
            label: "English",
            text: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ\nWith the blessings of Allah, Mr. & Mrs. Siddiqui request the pleasure of your company at the Nikah of their daughter\nInaya\nwith Zaid, son of Mr. & Mrs. Qureshi\nSaturday, 19 December · after Isha namaz\nYour duas and presence will be our greatest blessing.",
          },
          {
            label: "Walima",
            text: "The Qureshi family invites you to the Walima of Zaid & Inaya.\nMonday, 21 December · 8 pm onwards",
          },
          {
            label: "Hindi",
            text: "बिस्मिल्लाह\nअल्लाह के फ़ज़ल से हमारी बेटी इनाया का निकाह ज़ैद के साथ होना तय पाया है।\nइस मुबारक मौक़े पर आपकी शिरकत हमारे लिए बाइस-ए-इज़्ज़त होगी।",
          },
        ],
      },
    ],
    faqs: [
      { q: "Who hosts the Walima?", a: "The Walima is traditionally hosted by the groom's family after the Nikah, so its invitation usually names them as hosts." },
      { q: "Can we put the Nikah and Walima in one invitation?", a: "Yes. A digital invitation can show each as its own card with its own venue, time and hosts, inside one link." },
    ],
    designs: ["noor", "khat", "mahal"],
  },
  {
    slug: "anand-karaj-invitation-wording",
    title: "Anand Karaj invitation wording for a Sikh wedding",
    description: "How to word a Sikh wedding (Anand Karaj) invitation, with Ik Onkar, gurdwara details, the Milni and sample text.",
    topic: "Regional",
    readMins: 4,
    updated: "2026-10-28",
    intro:
      "An Anand Karaj invitation usually opens with ੴ (Ik Onkar), invites guests to the gurdwara for the ceremony, and lists the surrounding functions, from the Jaggo and Maiyan to the reception. Gurdwara etiquette is worth a gentle mention for guests who haven't attended one before.",
    sections: [
      {
        h: "What to include",
        list: [
          "ੴ at the top, and often a line of Gurbani chosen by the family.",
          "The couple's names with Singh and Kaur, and their parents.",
          "Milni time, Anand Karaj time and the gurdwara's name and address.",
          "Langar after the laavan, and the reception details if any.",
          "A short note: heads covered, shoes removed, and no alcohol or tobacco at the gurdwara.",
        ],
      },
      {
        h: "Sample wording",
        samples: [
          {
            label: "Main invitation",
            text: "ੴ\nWith the grace of Waheguru, S. Harpreet Singh & Sdn. Manjeet Kaur Gill request your presence at the Anand Karaj of their son\nJasraj Singh\nwith Simran Kaur, daughter of S. Gurdeep Singh & Sdn. Navneet Kaur Sandhu\nSunday, 14 February · Milni 9 am · Anand Karaj 10 am\nGurdwara Sahib, Ranjit Avenue, Amritsar · Langar to follow",
          },
          {
            label: "Etiquette note",
            text: "Please cover your head and remove your shoes at the gurdwara. Head scarves will be available at the entrance.",
          },
        ],
      },
    ],
    faqs: [
      { q: "What are the four laavan?", a: "They are the four hymns sung during the Anand Karaj, as the couple walks around the Guru Granth Sahib once for each. Some families explain them briefly in the invitation for guests new to the ceremony." },
    ],
    designs: ["phulkari", "rajwada", "mahal"],
  },
  {
    slug: "south-indian-wedding-invitation-wording",
    title: "South Indian wedding invitation wording: muhurtham, format and samples",
    description: "How to word a Tamil, Telugu, Kannada or Malayali wedding invitation, with the muhurtham time, family names and sample English text.",
    topic: "Regional",
    readMins: 5,
    updated: "2026-10-28",
    intro:
      "South Indian weddings are often early-morning affairs built around a precise muhurtham, and many guests travel in from other cities. Invitations therefore put the auspicious time front and centre and give clear venue and travel details, often alongside text in the family's language.",
    sections: [
      {
        h: "What to include",
        list: [
          "An invocation or the family deity's name at the top.",
          "The couple's names and both sets of parents, and often grandparents.",
          "The muhurtham window, for example 'between 6:30 and 7:30 am', and the day and date.",
          "Functions before and after: Nichayathartham, Nalangu, Mehendi, Reception.",
          "The kalyana mandapam or temple venue, with a map link and nearby stay options for outstation guests.",
        ],
      },
      {
        h: "Sample wording in English",
        samples: [
          {
            label: "Formal",
            text: "With the blessings of our elders\nSmt. Kamala & Shri. Sundaram Venkatesan\nrequest the pleasure of your company at the marriage of their daughter\nMeenakshi\nwith Karthik, son of Smt. Lalitha & Shri. Raghavan Srinivasan\nThursday, 28 January · Muhurtham 6:30 – 7:30 am\nSri Meenakshi Kalyana Mandapam, Madurai\nBreakfast follows the muhurtham.",
          },
        ],
      },
      {
        h: "Adding your own language",
        p: [
          "Most families add a line or two in Tamil, Telugu, Kannada or Malayalam, such as the invocation or the closing blessing. Send us the exact text you'd like and we set it in the right script, then ask an elder to read it once before you share.",
        ],
      },
    ],
    faqs: [
      { q: "Why is the muhurtham so early?", a: "The time is chosen by the family priest according to the panchangam, and auspicious windows often fall at dawn. Putting the exact time on the invitation helps guests plan travel the night before." },
    ],
    designs: ["gopuram", "kolam", "mahal"],
  },
  {
    slug: "when-to-send-wedding-invitations",
    title: "When to send wedding invitations in India: a simple timeline",
    description: "How many weeks before the wedding to send save-the-dates, invitations and reminders, for local and destination weddings in India.",
    topic: "Planning",
    readMins: 4,
    updated: "2026-10-28",
    intro:
      "Send too early and invitations get forgotten; too late and guests have already made plans or can't book travel. Here's a timeline that works for most Indian weddings, with a little extra time for destination celebrations.",
    sections: [
      {
        h: "A timeline that works",
        list: [
          "3 to 6 months before: a save-the-date for destination weddings or guests flying in.",
          "6 to 8 weeks before: the full invitation for destination weddings.",
          "4 to 6 weeks before: the full invitation for weddings in your city.",
          "2 weeks before: an RSVP deadline, so caterers and venues get final numbers.",
          "The day before each function: a short reminder with the map link.",
        ],
      },
      {
        h: "Why digital helps with timing",
        p: [
          "With a printed card, a date or venue change means calling everyone. A digital invitation lets you update the same link, so the details guests open are always the latest, and the RSVP replies arrive straight on your WhatsApp.",
        ],
      },
    ],
    faqs: [
      { q: "Is it rude to send only a digital invitation?", a: "Far less so than it used to be. Many families send a digital invitation to everyone and hand-deliver printed cards only to close elders. Calling elders personally after sending the link is a thoughtful touch." },
    ],
    designs: ["agni", "khat", "gulmohar"],
  },
  {
    slug: "digital-vs-printed-wedding-invitations",
    title: "Digital vs printed wedding invitations: an honest comparison",
    description: "Cost, convenience, etiquette and guest experience compared, so you can decide between digital and printed wedding cards, or use both.",
    topic: "Planning",
    readMins: 5,
    updated: "2026-10-28",
    intro:
      "Printed cards still carry weight with elders, and a beautiful box can be a keepsake. But a digital invitation is faster to share, easier to update and much cheaper. Many families now do both. Here's how they compare.",
    sections: [
      {
        h: "Side by side",
        list: [
          "Cost: printed boxed cards often run to tens of thousands for a large guest list; a digital invitation is a one-time fee.",
          "Changes: a venue or time change means reprinting; a digital link updates instantly for everyone.",
          "Reach: printed cards need delivery or courier; a link reaches guests anywhere in seconds.",
          "Practical details: digital invites can include maps, a countdown, RSVP and music; print can't.",
          "Keepsake value: a printed card is something you can hold; a digital invite can be revisited but isn't physical.",
        ],
      },
      {
        h: "A balanced approach",
        p: [
          "Send the digital invitation to everyone, and print a small number of cards for grandparents, elders and anyone you'd visit in person. You save most of the cost and still honour tradition where it matters most.",
        ],
      },
    ],
    faqs: [
      { q: "Do older relatives manage with digital invitations?", a: "If they use WhatsApp, yes. A good digital invitation opens in one tap with no app or login, and uses large text. A quick call explaining the link helps too." },
    ],
    designs: ["mahal", "rajwada", "bagh"],
  },
  {
    slug: "wedding-invitation-wording-guide",
    title: "Wedding invitation wording: who to name, in what order, and mistakes to avoid",
    description: "How to word an Indian wedding invitation: hosts, honorifics, the couple's names, parents and grandparents, with examples and common mistakes.",
    topic: "Planning",
    readMins: 6,
    updated: "2026-10-28",
    intro:
      "The wording of an Indian wedding invitation carries a lot of family meaning: who is hosting, whose names come first, which elders are mentioned. A few simple conventions keep everyone happy.",
    sections: [
      {
        h: "The usual structure",
        list: [
          "Invocation: a deity's name or a blessing, if your family uses one.",
          "Hosts: usually the parents, sometimes 'together with their families' or the couple themselves.",
          "The request: 'request the pleasure of your company' (formal) or 'invite you to celebrate' (warmer).",
          "The couple: full names, often with parents' names under each.",
          "Date, time and venue, then other functions.",
          "A closing line, and often the names of family members inviting you.",
        ],
      },
      {
        h: "Whose name comes first?",
        p: [
          "Conventionally, the hosting family's child is named first: the bride's family lists the bride first, and the groom's family lists the groom first. When both families host jointly, either order is fine. Many couples simply choose what sounds best.",
        ],
      },
      {
        h: "Mistakes to avoid",
        list: [
          "Misspelt names, especially of elders. Read every name aloud once.",
          "A missing day of the week. Guests use it to check the date.",
          "AM/PM confusion for early muhurtams. Write 'morning' or 'night' if in doubt.",
          "No RSVP contact, so guests don't know whom to tell.",
          "Too much text on one page. Split functions into separate cards.",
        ],
      },
      {
        h: "Sample opening lines",
        samples: [
          { label: "Formal", text: "Mr. & Mrs. Rathore request the honour of your presence at the marriage of their son Aarav with Meera." },
          { label: "Warm", text: "Together with their families, Riya and Aditya invite you to celebrate their wedding." },
          { label: "Hindi", text: "आप सपरिवार सादर आमंत्रित हैं। आपकी उपस्थिति हमारे लिए सबसे बड़ा आशीर्वाद होगी।" },
        ],
      },
    ],
    faqs: [
      { q: "Should grandparents be named on the invitation?", a: "Many families add a line such as 'With the blessings of' followed by grandparents' names. It's a lovely touch and especially common in North and South Indian invitations." },
    ],
    designs: ["mahal", "gulmohar", "agni"],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
