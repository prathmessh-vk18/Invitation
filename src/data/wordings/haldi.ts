import type { WordingPage } from "./types";

export const haldiPages: WordingPage[] = [
  // 1. English, traditional
  {
    slug: "haldi-invitation-message",
    fn: "haldi",
    lang: "en",
    tone: "traditional",
    title: "Haldi invitation message",
    description:
      "Haldi invitation message samples in warm, card-style English for the bride, the groom or both, with date, time, venue and a gentle yellow dress code note.",
    intro:
      "These are respectful, card-style wordings for a Haldi ceremony, written the way you would print them on an invitation or a digital card. Some are for the bride's Haldi, some for the groom's and a few for a joint ceremony. Pick one, swap in your names and details, and add a line about the dress code if your family has one.",
    wordings: [
      {
        label: "Classic and graceful",
        text: "We request the pleasure of your company\nat the Haldi ceremony of our dear {bride}\non {date} at {time}\nat {venue}.\nYour blessings will make the morning complete.",
      },
      {
        label: "Short and warm",
        text: "Join us for {groom}'s Haldi ceremony\n{date} · {time}\n{venue}",
      },
      {
        label: "Blessings first",
        text: "As {bride} steps towards a new beginning,\nwe gather to bless her with turmeric and love.\nYou are warmly invited to her Haldi ceremony.\n{date}, {time}\n{venue}",
      },
      {
        label: "For a joint Haldi",
        text: "Two families, one bright yellow morning.\nPlease join us for the Haldi ceremony of\n{bride} and {groom}\non {date} at {time}\nat {venue}.",
      },
      {
        label: "With a dress code line",
        text: "You are cordially invited to the Haldi ceremony of {groom}.\n{date} at {time}\n{venue}\nWe would love to see you in shades of yellow.",
      },
      {
        label: "Morning at home",
        text: "Our home will be filled with turmeric, music and family\nas we celebrate {bride}'s Haldi.\nDo come and be a part of it.\n{date}, {time} onwards\n{venue}",
      },
      {
        label: "Two lines for a card insert",
        text: "Haldi ceremony of {bride}\n{date} · {time} · {venue}",
      },
      {
        label: "Gentle and poetic",
        text: "A touch of turmeric, a shower of blessings,\nand the people we love most around us.\nPlease join us for the Haldi of {groom}\non {date} at {time},\n{venue}.",
      },
      {
        label: "With a practical note",
        text: "We warmly invite you to the Haldi ceremony of {bride}.\n{date} · {time}\n{venue}\nKindly wear something you don't mind getting a little turmeric on.",
      },
      {
        label: "Formal and complete",
        text: "With joy in our hearts, we invite you\nto the auspicious Haldi ceremony of\n{groom}\nto be held on {date} at {time}\nat {venue}.\nWe look forward to welcoming you.",
      },
      {
        label: "Before the wedding day",
        text: "The wedding celebrations of {bride} and {groom} begin with the Haldi.\nPlease join us on {date} at {time}\nat {venue}.",
      },
      {
        label: "Simple and heartfelt",
        text: "Your presence means the world to us.\nPlease bless {bride} at her Haldi ceremony\non {date}, {time}, at {venue}.",
      },
    ],
    tips: [
      "Mention that it's a morning or early-afternoon function by writing the time clearly, e.g. \"10:30 am onwards\", so nobody arrives at lunch expecting it to start.",
      "If the bride's and groom's Haldis are held separately, send each side's guests only their own invitation to avoid confusion.",
      "Keep the dress code to one short line at the end; a card-style message reads better without a list of instructions.",
      "If the Haldi is at home, include the flat number or building name and the nearest landmark along with the venue.",
    ],
    faqs: [
      {
        q: "What should a Haldi invitation message include?",
        a: "Whose Haldi it is, the day, date and start time, the venue, and ideally a dress code. A short line asking guests to wear clothes they don't mind staining is also helpful.",
      },
      {
        q: "How long does a Haldi ceremony usually last?",
        a: "Most Haldi ceremonies run about two to three hours, including the ritual, music and a meal or snacks. You don't need to give an end time unless guests are travelling on to another function.",
      },
      {
        q: "Should the Haldi be on a separate card or part of the wedding invitation?",
        a: "Either works. Many families list Haldi as one of the functions on the main invitation, while others send a separate, lighter message closer to the day.",
      },
    ],
    designs: ["khat", "gulmohar", "chameli"],
  },

  // 2. English, WhatsApp
  {
    slug: "haldi-invitation-message-for-whatsapp",
    fn: "haldi",
    lang: "en",
    tone: "whatsapp",
    title: "Haldi invitation message for WhatsApp",
    description:
      "Short Haldi invitation messages for WhatsApp in English: quick to forward, easy to read on a phone, with date, time, venue and a yellow dress code reminder.",
    intro:
      "These Haldi messages are short enough to read in a WhatsApp preview and easy to forward to family groups. Each one fits in a few lines, so you can paste it above your map link or digital invitation. Pick a message that matches how you usually talk to the group you're sending it to.",
    wordings: [
      {
        label: "Quick and clear",
        text: "You're invited to {bride}'s Haldi 💛\n{date}, {time}\n{venue}",
      },
      {
        label: "With dress code",
        text: "Haldi time for {groom}! 🌼\n{date} at {time}, {venue}\nDress code: yellow",
      },
      {
        label: "Warm one-liner",
        text: "Please join us for {bride}'s Haldi on {date} at {time}, {venue}. See you there!",
      },
      {
        label: "For a family group",
        text: "Dear all, {groom}'s Haldi is on {date} at {time} at {venue}. Do come and bless him 🙏",
      },
      {
        label: "Joint Haldi",
        text: "{bride} & {groom}'s Haldi 💛\n{date} · {time}\n{venue}\nCome in yellow, leave even more yellow!",
      },
      {
        label: "Day-before reminder",
        text: "Reminder: {bride}'s Haldi is tomorrow at {time} at {venue}. Wear yellow and something you don't mind staining 🌼",
      },
      {
        label: "Morning-of reminder",
        text: "Good morning! Haldi starts at {time} today at {venue}. See you soon 💛",
      },
      {
        label: "With a staining note",
        text: "Join us for {groom}'s Haldi\n{date}, {time} · {venue}\nPlease wear old or easy-to-wash clothes, the haldi will find you!",
      },
      {
        label: "With your map link",
        text: "{bride}'s Haldi 🌼\n{date} · {time}\n{venue}\nLocation: (paste map link)",
      },
      {
        label: "Personal invite to a friend",
        text: "It won't feel complete without you. Come for my Haldi on {date} at {time}, {venue}? 💛",
      },
      {
        label: "With the invitation link",
        text: "The celebrations begin! {groom}'s Haldi is on {date} at {time}.\nAll details are in the invite: (paste link)",
      },
      {
        label: "Status update",
        text: "Haldi day is coming 💛 {date} · {venue}",
      },
    ],
    tips: [
      "Send the Haldi message about 7 to 10 days before, then a short reminder the evening before, since it's an early function that people easily forget.",
      "Paste the Google Maps link on its own line right after the message so WhatsApp shows a clickable location preview.",
      "Put the date and time in the first two lines; many people only read the notification preview.",
      "For large family groups, send one broadcast list message instead of posting in several groups, so replies don't get buried.",
    ],
    faqs: [
      {
        q: "Is it okay to invite people to a Haldi only on WhatsApp?",
        a: "Yes, for Haldi it's very common, as it's a more informal family function. For elders, a quick phone call along with the message is a nice touch.",
      },
      {
        q: "When should I send the Haldi invitation on WhatsApp?",
        a: "About a week to ten days before is ideal. Follow up with a reminder the evening before, especially if the Haldi starts early in the morning.",
      },
      {
        q: "Should I send a PDF card or a text message?",
        a: "A short text with a map link is the easiest to read on a phone. If you have a digital invitation link, send it with a one-line message so guests can open details like the dress code and location.",
      },
    ],
    designs: ["bagh", "gulmohar"],
  },

  // 3. English, family
  {
    slug: "haldi-invitation-wording-from-parents",
    fn: "haldi",
    lang: "en",
    tone: "family",
    title: "Haldi invitation wording from parents",
    description:
      "Haldi invitation wording from parents and family hosts in English, for a son's or daughter's Haldi, with respectful lines, date, time, venue and dress code.",
    intro:
      "Use these wordings when the parents or the wider family are hosting the Haldi and inviting guests in their own name. They work for a daughter's Haldi, a son's Haldi or a joint ceremony hosted by both families. Type the way you sign off in the Family box above, such as \"Mr. & Mrs. Rajesh Sharma\" or \"the Sharma family\".",
    wordings: [
      {
        label: "Mr. & Mrs. style",
        text: "{family}\nrequest the pleasure of your presence\nat the Haldi ceremony of their daughter\n{bride}\non {date} at {time}\nat {venue}.",
      },
      {
        label: "For a son's Haldi",
        text: "{family} invite you to bless their son {groom}\nat his Haldi ceremony.\n{date} · {time}\n{venue}",
      },
      {
        label: "Short family invite",
        text: "{family} cordially invites you and your family\nto {bride}'s Haldi on {date} at {time}, {venue}.",
      },
      {
        label: "Parents' blessing",
        text: "Our little girl is getting married.\nBefore the big day, we would love you to join us\nas we apply haldi and shower {bride} with blessings.\n{date}, {time}\n{venue}\nWith love, {family}",
      },
      {
        label: "With family elders",
        text: "With the blessings of our elders,\n{family} invites you to the Haldi ceremony of\n{groom}\non {date} at {time}\nat our residence, {venue}.",
      },
      {
        label: "Both families hosting",
        text: "The families of {bride} and {groom}\njoyfully invite you to their joint Haldi ceremony\non {date} at {time}\nat {venue}.",
      },
      {
        label: "Including the dress code",
        text: "{family} warmly invites you to the Haldi of our son {groom}.\n{date} · {time} · {venue}\nWe request guests to come dressed in yellow.",
      },
      {
        label: "From the mother",
        text: "It would mean a lot to me to have you by my side\nwhen we celebrate {bride}'s Haldi.\nPlease join us on {date} at {time} at {venue}.",
      },
      {
        label: "Family and friends together",
        text: "{family}, along with friends and well-wishers,\ninvites you to share in the joy of {groom}'s Haldi.\n{date}, {time} onwards\n{venue}\nLunch will follow the ceremony.",
      },
      {
        label: "With an RSVP request",
        text: "{family} invites you to the Haldi ceremony of {bride}.\n{date} · {time}\n{venue}\nKindly let us know if you can join us.",
      },
      {
        label: "Brief and dignified",
        text: "{family} solicits your gracious presence\nat the Haldi of {groom} on {date} at {time}, {venue}.",
      },
      {
        label: "Warm and homely",
        text: "Our home is getting ready for {bride}'s Haldi,\nand it won't feel complete without you.\n{date} at {time}\n{venue}\nAffectionately, {family}",
      },
    ],
    tips: [
      "Decide how the family signs off before you start, e.g. \"Mr. & Mrs. Rajesh Sharma\" for a formal card or \"the Sharma family\" for something warmer, and use it consistently on every function.",
      "If grandparents are the senior hosts, name them first or add \"with the blessings of\" above the parents' names.",
      "When the Haldi is at your residence, write \"at our residence\" followed by the full address so out-of-town relatives can find it.",
      "If a meal follows the Haldi, say so; relatives coming from far away will plan their day around it.",
    ],
    faqs: [
      {
        q: "Who usually hosts the Haldi ceremony?",
        a: "Traditionally each family hosts the Haldi for their own child at their home, so the bride's parents host hers and the groom's parents host his. Some couples now hold a joint Haldi hosted by both families.",
      },
      {
        q: "How should parents' names be written on a Haldi invitation?",
        a: "The common formal style is \"Mr. & Mrs.\" followed by the father's full name, e.g. \"Mr. & Mrs. Rajesh Sharma\". Many families also write both parents' first names, like \"Rajesh and Sunita Sharma\".",
      },
      {
        q: "Should the Haldi invitation say \"and family\"?",
        a: "If you want the guest's whole household to come, add \"you and your family\" or \"sapariwar\" in Hindi. If space at home is limited, address it to the guest by name only.",
      },
    ],
    designs: ["khat", "chameli", "gulmohar"],
  },

  // 4. English, fun
  {
    slug: "funny-haldi-invitation-message",
    fn: "haldi",
    lang: "en",
    tone: "fun",
    title: "Funny Haldi invitation messages",
    description:
      "Funny Haldi invitation messages in English for friends and cousins: playful lines about turmeric, yellow outfits and last days of single life, ready to copy.",
    intro:
      "These playful Haldi messages are for friends, cousins and anyone who'll appreciate a laugh. They joke about turmeric, yellow outfits and the couple, but stay friendly enough that nobody's aunt will be offended. Send them in the friends' group, and keep a more traditional wording for elders.",
    wordings: [
      {
        label: "Fair warning",
        text: "Warning: {bride} is about to turn yellow 💛\nCome help on {date} at {time}, {venue}.\nWear clothes you've already given up on.",
      },
      {
        label: "Last day as a free man",
        text: "{groom} has one last morning before marriage takes over.\nLet's at least make him yellow.\n{date} · {time} · {venue} 😄",
      },
      {
        label: "Dress code joke",
        text: "Dress code: yellow.\nAfter the Haldi: also yellow.\n{bride}'s Haldi, {date}, {time}, {venue} 🌼",
      },
      {
        label: "Skincare routine",
        text: "{bride}'s skincare routine for the big day:\nStep 1: turmeric.\nStep 2: all of you applying it.\nJoin us on {date} at {time}, {venue} ✨",
      },
      {
        label: "Mission briefing",
        text: "Mission: cover {groom} in haldi.\nTeam: you.\nTime: {date}, {time}\nLocation: {venue}\nThis message will not self-destruct, please RSVP.",
      },
      {
        label: "No escape",
        text: "{groom} has been trying to stay clean all week.\nOn {date}, that ends.\nHaldi at {time}, {venue}. Bring your aim 🎯",
      },
      {
        label: "For a joint Haldi",
        text: "{bride} and {groom} will be yellow by noon.\nYou probably will be too.\n{date} · {time} · {venue} 💛",
      },
      {
        label: "Short and cheeky",
        text: "Come get haldi'd! {bride}'s Haldi, {date}, {time}, {venue} 🌼",
      },
      {
        label: "The wedding-glow theory",
        text: "Scientists can't explain the bridal glow.\nWe can: it's turmeric and too many cousins.\nBe one of them at {bride}'s Haldi\n{date}, {time}, {venue} 😄",
      },
      {
        label: "Outfit advice",
        text: "Wear yellow. Not your favourite yellow. The yellow you won't miss.\n{groom}'s Haldi, {date} at {time}, {venue}.",
      },
      {
        label: "Group chat style",
        text: "Ok everyone, Haldi plan 👇\nWhen: {date}, {time}\nWhere: {venue}\nWhat to bring: energy, and no white clothes",
      },
      {
        label: "Countdown",
        text: "Days left for {groom} to look normal: very few.\nHaldi on {date} at {time}, {venue}. Don't miss it 💛",
      },
    ],
    tips: [
      "Send the funny version only to friends and cousins; for elders and family groups, use a traditional or family wording instead.",
      "Keep the jokes about turmeric, outfits and the couple, not about marriage being a trap or anything a parent might forward with a frown.",
      "Even in a fun message, put the date, time and venue on clear lines so the important bits don't get lost in the jokes.",
      "Add a practical nudge like \"no white clothes\" or \"bring a spare T-shirt\" if friends are heading to another function or to work afterwards.",
    ],
    faqs: [
      {
        q: "Can a Haldi invitation be funny?",
        a: "Yes. Haldi is the most relaxed function of most weddings, so a light, playful invitation suits it, especially for friends. Keep a more formal version for older relatives.",
      },
      {
        q: "What's a good funny dress code line for a Haldi?",
        a: "Something like \"Wear yellow, preferably something you won't miss\" works well. It's a joke and a useful warning at the same time, since turmeric stains are hard to wash out.",
      },
      {
        q: "Is it okay to use emojis in a Haldi invitation?",
        a: "In a WhatsApp or social media message for friends, a few emojis like 💛 or 🌼 are perfectly fine. Leave them out of a printed card or a message to elders.",
      },
    ],
    designs: ["bagh", "gulmohar"],
  },

  // 5. Hindi, traditional
  {
    slug: "haldi-invitation-message-in-hindi",
    fn: "haldi",
    lang: "hi",
    tone: "traditional",
    title: "Haldi invitation message in Hindi",
    description:
      "Haldi invitation message in Hindi: traditional, card-style wordings in Devanagari for the bride's or groom's haldi rasm, with date, time, venue and blessings.",
    intro:
      "These are traditional Hindi wordings for a Haldi ceremony, written the way families write invitation cards, with phrases like \"सादर आमंत्रित\" and \"शुभ अवसर\". There are versions for the bride, the groom and a joint ceremony. Copy one as it is, or open it in the wording generator to fill in your names and details.",
    wordings: [
      {
        label: "Classic card style",
        text: "शुभ विवाह के मंगल अवसर पर\n{bride} की हल्दी रस्म में\nआप सादर आमंत्रित हैं।\nदिनांक: {date}\nसमय: {time}\nस्थान: {venue}",
      },
      {
        label: "Short and warm",
        text: "{groom} की हल्दी रस्म में पधारकर\nहमारी खुशियों में शामिल हों।\n{date}, {time} · {venue}",
      },
      {
        label: "With blessings",
        text: "हल्दी का रंग, अपनों का संग\nऔर बड़ों का आशीर्वाद।\n{bride} की हल्दी के शुभ अवसर पर\nआपकी उपस्थिति प्रार्थनीय है।\n{date} · {time}\n{venue}",
      },
      {
        label: "Joint Haldi",
        text: "{bride} एवं {groom} के शुभ विवाह के उपलक्ष्य में\nहल्दी रस्म का आयोजन किया गया है।\nआप सादर आमंत्रित हैं।\n{date}, {time}\n{venue}",
      },
      {
        label: "With dress code",
        text: "{groom} की हल्दी रस्म\n{date} · {time}\n{venue}\nकृपया पीले वस्त्र धारण करके पधारें।",
      },
      {
        label: "Morning at home",
        text: "मंगल गीतों और हल्दी की खुशबू के बीच\n{bride} की हल्दी रस्म हमारे निवास पर होगी।\nआप पधारें और आशीर्वाद दें।\n{date}, प्रातः {time}\n{venue}",
      },
      {
        label: "Two-line card insert",
        text: "हल्दी रस्म: {bride}\n{date} · {time} · {venue}",
      },
      {
        label: "Poetic",
        text: "पीली हल्दी, मंगल गीत,\nअपनों का प्यार और ढेर सारा आशीर्वाद।\n{groom} की हल्दी में आपका इंतज़ार रहेगा।\n{date}, {time}\n{venue}",
      },
      {
        label: "With a practical note",
        text: "{bride} की हल्दी रस्म में आप सादर आमंत्रित हैं।\n{date} · {time} · {venue}\nकृपया ऐसे वस्त्र पहनें जिन पर हल्दी लगने से कोई चिंता न हो।",
      },
      {
        label: "Formal and complete",
        text: "॥ शुभ मंगलम् ॥\nहर्ष के साथ सूचित करते हैं कि\n{groom} की हल्दी रस्म\n{date} को {time}\n{venue} में सम्पन्न होगी।\nआपकी गरिमामयी उपस्थिति प्रार्थनीय है।",
      },
      {
        label: "Start of the celebrations",
        text: "विवाह उत्सव का शुभारंभ हल्दी रस्म से।\n{bride} एवं {groom}\n{date}, {time}\n{venue}\nपधारकर शोभा बढ़ाएं।",
      },
      {
        label: "Simple and heartfelt",
        text: "आपके आशीर्वाद के बिना यह रस्म अधूरी है।\n{bride} की हल्दी पर अवश्य पधारें।\n{date}, {time}, {venue}",
      },
    ],
    tips: [
      "Write the time with \"प्रातः\" (morning) or \"दोपहर\" (afternoon) so elders know at a glance it's a day function.",
      "Use \"सादर आमंत्रित\" or \"उपस्थिति प्रार्थनीय है\" for printed cards; they read as respectful without sounding stiff.",
      "If you are printing the card, check that the Hindi font renders matras and conjuncts like \"श्र\" and \"त्र\" correctly before sending it to everyone.",
      "Keep the date in a format your relatives use, e.g. \"रविवार, 12 जनवरी\", and avoid mixing English and Hindi month names in one card.",
    ],
    faqs: [
      {
        q: "How do I write Haldi ceremony in a Hindi invitation?",
        a: "The most common phrases are \"हल्दी रस्म\", \"हल्दी की रस्म\" or \"हल्दी समारोह\". \"हल्दी रस्म\" is the most natural on cards and messages.",
      },
      {
        q: "What does \"उपस्थिति प्रार्थनीय है\" mean on an invitation?",
        a: "It means \"your presence is requested\". It's a formal, respectful line used on printed Hindi invitation cards, often at the end.",
      },
      {
        q: "Can I mix Hindi and English on a Haldi invitation?",
        a: "Yes, many families write the main lines in Hindi and the venue address in English so it can be pasted into maps. Just keep each line in one language so it reads cleanly.",
      },
    ],
    designs: ["khat", "chameli", "gulmohar"],
  },

  // 6. Hindi, WhatsApp
  {
    slug: "haldi-invitation-message-in-hindi-for-whatsapp",
    fn: "haldi",
    lang: "hi",
    tone: "whatsapp",
    title: "Haldi invitation message in Hindi for WhatsApp",
    description:
      "Haldi invitation message in Hindi for WhatsApp: short Devanagari messages to forward to family groups, with date, time, venue and day-before reminders.",
    intro:
      "These short Hindi messages are made for WhatsApp, where relatives read them in a notification or a family group. Each is one to four lines, with the date, time and venue up front. There are also reminder messages for the evening before and the morning of the Haldi.",
    wordings: [
      {
        label: "Quick and clear",
        text: "{bride} की हल्दी में आप सादर आमंत्रित हैं 💛\n{date}, {time}\n{venue}",
      },
      {
        label: "For the family group",
        text: "सभी को सूचित किया जाता है कि {groom} की हल्दी {date} को {time} {venue} में है। आप सब ज़रूर आइए 🙏",
      },
      {
        label: "With dress code",
        text: "{bride} की हल्दी 🌼\n{date} · {time} · {venue}\nड्रेस कोड: पीला",
      },
      {
        label: "One-line invite",
        text: "{groom} की हल्दी पर {date} को {time} {venue} में आपका इंतज़ार रहेगा।",
      },
      {
        label: "Joint Haldi",
        text: "{bride} और {groom} की हल्दी रस्म 💛\n{date}, {time}\n{venue}\nपरिवार सहित पधारें।",
      },
      {
        label: "Day-before reminder",
        text: "याद दिला दें, कल {time} {venue} में {bride} की हल्दी है। पीले कपड़ों में आइए 🌼",
      },
      {
        label: "Morning-of reminder",
        text: "सुप्रभात! आज {time} से हल्दी की रस्म शुरू होगी। समय पर पहुँचें 🙏",
      },
      {
        label: "With a staining note",
        text: "{groom} की हल्दी, {date}, {time}, {venue}।\nपुराने या आसानी से धुलने वाले कपड़े पहनकर आएँ, हल्दी से कोई नहीं बचेगा!",
      },
      {
        label: "With your map link",
        text: "{bride} की हल्दी रस्म\n{date} · {time}\n{venue}\nलोकेशन: (मैप लिंक यहाँ डालें)",
      },
      {
        label: "Personal, to a close relative",
        text: "आपके बिना हल्दी अधूरी लगेगी। {date} को {time} {venue} ज़रूर पहुँचिए 💛",
      },
      {
        label: "With the invitation link",
        text: "शादी की रस्में शुरू! {groom} की हल्दी {date} को {time} है।\nपूरी जानकारी निमंत्रण में: (लिंक)",
      },
      {
        label: "WhatsApp status",
        text: "हल्दी की तैयारी शुरू 💛 {date}",
      },
    ],
    tips: [
      "Send the Hindi WhatsApp invite 7 to 10 days before the Haldi and a short reminder the evening before, as most Haldis start early in the morning.",
      "Paste the Google Maps link on a separate line after the message so it opens directly for elders who aren't comfortable searching the address.",
      "For older relatives, follow the message with a quick call; many still consider a phone call the proper invitation.",
      "Use simple, spoken Hindi (\"ज़रूर आइए\", \"पधारें\") rather than heavy formal words, so the message reads naturally on a phone.",
    ],
    faqs: [
      {
        q: "How do I send a Haldi invitation on WhatsApp in Hindi?",
        a: "Write two or three lines with whose Haldi it is, the date, time and place, then add the map link or your digital invitation link on the next line. Send it individually or as a broadcast so people can reply to you directly.",
      },
      {
        q: "Will Hindi text show correctly on everyone's phone?",
        a: "Yes, WhatsApp displays Devanagari on all modern Android phones and iPhones. Avoid decorative Hindi fonts from image apps; plain text is the most readable.",
      },
      {
        q: "Should I send the Hindi invite in the family group or individually?",
        a: "Posting in the family group is fine for close relatives. For important guests and elders, a personal message or call is more respectful.",
      },
    ],
    designs: ["gulmohar", "bagh"],
  },

  // 7. Hindi, family
  {
    slug: "haldi-invitation-in-hindi-from-parents",
    fn: "haldi",
    lang: "hi",
    tone: "family",
    title: "Haldi invitation in Hindi from parents",
    description:
      "Haldi invitation in Hindi from parents and family: respectful Devanagari wordings for a son's or daughter's haldi rasm, with family name, date, time and venue.",
    intro:
      "These Hindi wordings are written in the parents' or family's voice, the way a Haldi invitation from the hosts usually reads. You'll find versions for \"हमारी सुपुत्री\" and \"हमारे सुपुत्र\", for joint ceremonies and for a warmer, personal note from the family. Type your family's name in the Family box above, e.g. \"शर्मा परिवार\" or \"श्री एवं श्रीमती राजेश शर्मा\".",
    wordings: [
      {
        label: "For a son's Haldi",
        text: "हमारे सुपुत्र {groom} की हल्दी रस्म के शुभ अवसर पर\nआप सपरिवार सादर आमंत्रित हैं।\n{date} · {time}\n{venue}\nविनीत: {family}",
      },
      {
        label: "Daughter, warm and personal",
        text: "हमारी लाडली {bride} अब नए जीवन की ओर कदम रख रही है।\nउसकी हल्दी पर आपका आशीर्वाद चाहिए।\n{date}, {time}\n{venue}\nसस्नेह, {family}",
      },
      {
        label: "Shri & Shrimati style",
        text: "{family}\nअपनी सुपुत्री {bride} की हल्दी रस्म में\nआपकी गरिमामयी उपस्थिति की कामना करते हैं।\nदिनांक: {date}\nसमय: {time}\nस्थान: {venue}",
      },
      {
        label: "With elders' blessings",
        text: "पूज्य बड़ों के आशीर्वाद से\n{groom} की हल्दी रस्म हमारे निवास पर होगी।\nपधारकर शोभा बढ़ाएं।\n{date} · {time} · {venue}\n{family}",
      },
      {
        label: "Short from the family",
        text: "{family} की ओर से {bride} की हल्दी में आपको हार्दिक निमंत्रण।\n{date}, {time}, {venue}",
      },
      {
        label: "Both families hosting",
        text: "{bride} एवं {groom} के परिवार\nसंयुक्त हल्दी रस्म में आपको सादर आमंत्रित करते हैं।\n{date}, {time}\n{venue}",
      },
      {
        label: "With dress code",
        text: "{family} आपको {groom} की हल्दी रस्म में आमंत्रित करता है।\n{date} · {time}\n{venue}\nअनुरोध है कि पीले परिधान में पधारें।",
      },
      {
        label: "From the mother",
        text: "बेटी की हल्दी में माँ की सबसे बड़ी खुशी\nअपनों को पास देखना है।\n{bride} की हल्दी पर ज़रूर आइए।\n{date}, {time}, {venue}",
      },
      {
        label: "Followed by lunch",
        text: "{groom} की हल्दी रस्म\n{date}, {time} से\n{venue}\nरस्म के पश्चात भोजन की व्यवस्था है।\nनिवेदक: {family}",
      },
      {
        label: "With an RSVP request",
        text: "{family} की ओर से {bride} की हल्दी रस्म में आप सादर आमंत्रित हैं।\n{date} · {time} · {venue}\nकृपया अपने आने की सूचना अवश्य दें।",
      },
      {
        label: "Traditional sign-off",
        text: "मंगल कामनाओं सहित\n{groom} की हल्दी रस्म पर\nआपकी उपस्थिति प्रार्थनीय है।\n{date} को {time}, {venue}\nदर्शनाभिलाषी: {family}",
      },
      {
        label: "Homely and simple",
        text: "घर में हल्दी की रौनक है और आपकी कमी खलेगी।\n{bride} की हल्दी, {date}, {time}, {venue}।\nआपका अपना, {family}",
      },
    ],
    tips: [
      "Choose a sign-off that fits the tone: \"विनीत\" or \"निवेदक\" for formal cards, \"सस्नेह\" or \"आपका अपना\" for warmer messages.",
      "Use \"सपरिवार\" only if you want the guest's whole family to come; at a home Haldi with limited space, leave it out.",
      "If grandparents are alive, families often add \"पूज्य बड़ों के आशीर्वाद से\" or name them above the parents as a mark of respect.",
      "Mention lunch or nashta after the rasm if you're serving it, so relatives travelling in know they don't need to plan a meal.",
    ],
    faqs: [
      {
        q: "What does \"विनीत\" or \"दर्शनाभिलाषी\" mean at the end of a Hindi invitation?",
        a: "Both are respectful sign-offs before the hosts' names. \"विनीत\" means \"humbly\", and \"दर्शनाभिलाषी\" means \"eager to see you\", and they are common on traditional cards.",
      },
      {
        q: "Should I write \"सुपुत्री\" or \"बेटी\" in a Haldi invitation?",
        a: "\"सुपुत्री\" and \"सुपुत्र\" are the formal words used on printed cards. \"बेटी\" and \"बेटा\" sound warmer and suit WhatsApp messages and personal notes.",
      },
      {
        q: "How do I write the parents' names in a Hindi invitation?",
        a: "The usual formal style is \"श्री एवं श्रीमती\" followed by the father's full name, e.g. \"श्री एवं श्रीमती राजेश शर्मा\". For a simpler message, \"शर्मा परिवार\" works well.",
      },
    ],
    designs: ["khat", "chameli"],
  },

  // 8. Hindi, fun
  {
    slug: "funny-haldi-invitation-message-in-hindi",
    fn: "haldi",
    lang: "hi",
    tone: "fun",
    title: "Funny Haldi invitation messages in Hindi",
    description:
      "Funny Haldi invitation messages in Hindi for friends and cousins: playful Devanagari lines about haldi, yellow outfits and the couple, perfect for WhatsApp.",
    intro:
      "These are light, mazedaar Hindi messages for inviting friends and cousins to a Haldi. They play on haldi, yellow clothes and the couple's last days before the wedding, while staying clean enough to forward anywhere. Use them in friends' groups and keep a traditional wording for elders.",
    wordings: [
      {
        label: "Fair warning",
        text: "सावधान! {bride} पीली होने वाली है 💛\n{date}, {time}, {venue}\nऐसे कपड़े पहनकर आना जिनसे मोह न हो।",
      },
      {
        label: "Last days of freedom",
        text: "{groom} की आज़ादी के आख़िरी दिन चल रहे हैं।\nकम से कम उसे पीला तो कर दें 😄\n{date} · {time} · {venue}",
      },
      {
        label: "No parlour needed",
        text: "न पार्लर, न मेकअप,\n{bride} की चमक तो बस हल्दी और आप सबके प्यार से आएगी ✨\n{date}, {time}, {venue}",
      },
      {
        label: "Dress code joke",
        text: "ड्रेस कोड: पीला।\nहल्दी के बाद भी: पीला।\n{groom} की हल्दी, {date}, {time}, {venue} 🌼",
      },
      {
        label: "Mission briefing",
        text: "मिशन: {groom} को हल्दी से रंगना।\nटीम: आप।\nकब: {date}, {time}\nकहाँ: {venue}\nगैरहाज़िरी माफ़ नहीं होगी!",
      },
      {
        label: "Short and cheeky",
        text: "हल्दी लगाने आओ, हल्दी लगवाकर जाओ! {bride} की हल्दी, {date}, {venue} 💛",
      },
      {
        label: "Joint Haldi",
        text: "{bride} और {groom} दोपहर तक पीले हो जाएंगे,\nऔर शायद आप भी 😄\n{date} · {time} · {venue}",
      },
      {
        label: "No escape",
        text: "{groom} पूरे हफ़्ते से सफ़ेद कुर्ता बचा रहा है।\n{date} को वो सपना टूटेगा।\nहल्दी {time}, {venue} 🎯",
      },
      {
        label: "Group chat style",
        text: "दोस्तों, हल्दी का प्लान 👇\nकब: {date}, {time}\nकहाँ: {venue}\nक्या लाना है: एनर्जी, और सफ़ेद कपड़े बिल्कुल नहीं",
      },
      {
        label: "Mummy's orders",
        text: "मम्मी का आदेश है: {bride} की हल्दी में सबको आना है।\nऔर मम्मी की बात कोई नहीं टालता 😄\n{date}, {time}, {venue}",
      },
      {
        label: "Countdown",
        text: "{groom} के नॉर्मल दिखने के गिने-चुने दिन बचे हैं।\nहल्दी: {date}, {time}, {venue}। मिस मत करना 💛",
      },
      {
        label: "Rhyming",
        text: "पीले कपड़े, ढोल की थाप,\nहल्दी में मिलेंगे हम और आप!\n{bride} की हल्दी, {date}, {time}\n{venue}",
      },
    ],
    tips: [
      "Send the funny Hindi version to friends and cousins only; for bade-buzurg, use a traditional or family wording.",
      "Keep the jokes on haldi, clothes and the couple; skip lines about in-laws or marriage being a punishment, which can land badly when forwarded.",
      "Keep the date, time and venue on their own lines even in a joke message, so nobody has to scroll up and ask \"kab hai?\".",
      "Remind friends to bring a spare set of clothes if they're going to college, work or another function after the Haldi.",
    ],
    faqs: [
      {
        q: "What's a funny Hindi line for a Haldi dress code?",
        a: "Try \"ऐसे कपड़े पहनकर आना जिनसे मोह न हो\" (wear clothes you're not attached to). It's a joke and a genuinely useful warning, since haldi stains are hard to remove.",
      },
      {
        q: "Can I send a funny Haldi message in Hinglish instead?",
        a: "Yes. Many friends' groups write in Hinglish (Hindi in Roman letters). You can type any of these lines in Roman script; the jokes work the same way.",
      },
      {
        q: "Is a funny Haldi invitation okay for the family WhatsApp group?",
        a: "Gentle ones like the rhyming or \"mummy's orders\" lines usually go down well with family too. Save the cheekier ones about the groom's freedom for friends.",
      },
    ],
    designs: ["bagh", "gulmohar", "chameli"],
  },
];
