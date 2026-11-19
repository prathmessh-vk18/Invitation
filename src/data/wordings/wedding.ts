import type { WordingPage } from "./types";

export const weddingPages: WordingPage[] = [
  // 1. English, traditional
  {
    slug: "wedding-invitation-message",
    fn: "wedding",
    lang: "en",
    tone: "traditional",
    title: "Wedding invitation message",
    description:
      "12 traditional wedding invitation message ideas for Indian weddings, from Ganesh invocations to short card lines. Copy one and add your names, date and venue.",
    intro:
      "These are card-style wedding invitation messages for a Hindu wedding, written in warm, respectful Indian English. Some open with an invocation, some are short enough for the back of a card, and a few are written for elders. Pick one, swap in your names, muhurat and venue, and use it on a printed card or a digital invite.",
    wordings: [
      {
        label: "With Ganesha's blessings",
        text: "॥ Shri Ganeshaya Namah ॥\nWith the blessings of Lord Ganesha and our elders,\nwe invite you to the wedding of\n{bride} and {groom}\non {date} at {time}\nat {venue}.\nYour presence will make the day complete.",
      },
      {
        label: "Short and graceful",
        text: "{bride} and {groom} are getting married.\nWe would be honoured to have you with us on {date} at {time}, {venue}.",
      },
      {
        label: "Seven pheras",
        text: "As {bride} and {groom} take the seven pheras\nand begin their life together,\nwe request the pleasure of your company and your blessings.\n{date} | {time}\n{venue}",
      },
      {
        label: "The muhurat is fixed",
        text: "The muhurat has been fixed and the mandap is being readied.\nKindly join us for the sacred wedding of {bride} and {groom}\non {date}, muhurat at {time},\nat {venue}.\nWith warm regards,\n{family}",
      },
      {
        label: "Two families, one celebration",
        text: "Two families, one celebration.\nWe seek your blessings for {bride} and {groom}\nas they are united in marriage on {date} at {venue}.",
      },
      {
        label: "Formal card layout",
        text: "We solicit your gracious presence\nat the auspicious wedding ceremony of\n{groom}\nwith\n{bride}\non {date} at {time}\nVenue: {venue}",
      },
      {
        label: "Before the sacred fire",
        text: "Before the sacred fire, and in the presence of family and friends,\n{bride} and {groom} will be joined in holy matrimony.\nWe warmly invite you on {date} at {time}, at {venue}.",
      },
      {
        label: "For respected elders",
        text: "With folded hands and great respect,\nwe invite you and your family to bless {bride} and {groom} on their wedding day.\n{date}, {time}\n{venue}\nYour blessings mean more to us than any gift.",
      },
      {
        label: "Poetic",
        text: "As a river finds the sea, two lives become one.\n{bride} and {groom}\ninvite you to witness their union\non {date} at {time}\nat {venue}.",
      },
      {
        label: "Temple wedding",
        text: "In the divine presence of the deity at {venue},\n{bride} and {groom} will tie the knot on {date} at {time}.\nWe would be grateful if you could attend and bless them.",
      },
      {
        label: "Simple with family sign-off",
        text: "Please join us in celebrating the marriage of {bride} and {groom}.\n{date}, {time}, {venue}\nWith love and respect,\n{family}",
      },
      {
        label: "Doors and hearts open",
        text: "॥ Shubh Vivah ॥\nThe doors of our home and our hearts are open for you.\nCome, be a part of the wedding of {bride} and {groom}\non {date} at {time}\nat {venue}.\nAwaiting your gracious presence.",
      },
    ],
    tips: [
      "Write the muhurat exactly and add 'morning' or 'night' for early or late pheras, for example 'pheras at 11:30 pm, Saturday night'.",
      "Match the invocation to your family's tradition. If the two families follow different customs, a neutral line like 'Shubh Vivah' works for both.",
      "Keep the wording itself short and let the date, time and venue stand on their own lines so guests can find them at a glance.",
      "Send printed cards or the digital invite four to six weeks ahead, and keep the same wording on both so nothing contradicts.",
    ],
    faqs: [
      {
        q: "What should a wedding invitation message include?",
        a: "The couple's names, the hosts, the date with the day of the week, the muhurat or start time and the venue. An invocation, a line asking for blessings and an RSVP contact are optional but common.",
      },
      {
        q: "How early should wedding invitations be sent in India?",
        a: "Four to six weeks before the wedding is usual, and eight weeks or more for guests who need to travel or book leave. Close family is often invited in person even earlier.",
      },
      {
        q: "Can I use the same message on the printed card and the e-invite?",
        a: "Yes, and it is better to. Using one wording everywhere avoids mismatched timings or venue details between the card and the link guests receive.",
      },
    ],
    designs: ["mahal", "mandir", "rajwada"],
  },

  // 2. English, WhatsApp
  {
    slug: "wedding-invitation-message-for-whatsapp",
    fn: "wedding",
    lang: "en",
    tone: "whatsapp",
    title: "Wedding invitation message for WhatsApp",
    description:
      "Short wedding invitation messages for WhatsApp: invites, reminders, status lines and RSVP requests. Copy, add your date and venue, and send with your e-card.",
    intro:
      "WhatsApp is where most wedding invites actually reach people, so these messages are short and easy to forward. There are versions to send with your e-invite link, reminders for a week before and the day before, a status line, and a polite note for elders. Add your details and send each one with your card image or link.",
    wordings: [
      {
        label: "Simple announcement",
        text: "We're getting married! 💍\n{bride} & {groom}\n{date}, {time} at {venue}.\nPlease come and bless us.",
      },
      {
        label: "Namaste to relatives",
        text: "Namaste! With great joy we invite you and your family to the wedding of {bride} and {groom} on {date} at {venue}. Do come. 🙏",
      },
      {
        label: "With the e-invite link",
        text: "Our wedding invitation is here 💌\n{bride} weds {groom} · {date}\nTap the link for the full programme, venue map and RSVP.",
      },
      {
        label: "One week to go",
        text: "Just a week to go! 🎉\n{bride} and {groom}'s wedding is on {date}, {time}, at {venue}. See you there.",
      },
      {
        label: "Day-before reminder",
        text: "Tomorrow is the big day for {bride} and {groom}! Pheras at {time}, {venue}. Can't wait to see you. 🙏",
      },
      {
        label: "For the friends' group",
        text: "Clear your calendars, people! {bride} and {groom} are getting married on {date} at {venue}. Attendance is compulsory. 😄",
      },
      {
        label: "For guests far away",
        text: "Wherever you are, we'd love your blessings.\n{bride} and {groom} marry on {date} at {time}. The live stream link is below. 📱",
      },
      {
        label: "Polite note for elders",
        text: "Respected uncle and aunty, {family} cordially invites you to the wedding of {bride} and {groom} on {date} at {time}, {venue}. Kindly grace the occasion.",
      },
      {
        label: "WhatsApp status",
        text: "{bride} 💛 {groom}\n{date}",
      },
      {
        label: "Asking for RSVP",
        text: "{bride} and {groom}'s wedding: {date}, {venue}.\nPlease reply with the number of guests by this weekend so we can plan the arrangements. Thank you! 🙏",
      },
      {
        label: "Wedding morning",
        text: "Good morning! It's wedding day for {bride} and {groom}. 🌸\nWe're at {venue} from {time}. Sharing the location pin below.",
      },
      {
        label: "Personal one-liner",
        text: "It wouldn't feel complete without you. {bride} and {groom}'s wedding, {date} at {venue}. Please come!",
      },
    ],
    tips: [
      "Put the couple's names and date in the first line, since that is all the chat preview shows before someone opens it.",
      "Send the e-card or link first and the text right after it, so the message sits under the card and doesn't get lost in a long chat.",
      "Use a broadcast list rather than a group for wedding invites. Guests see it as a personal message and replies come only to you.",
      "Call or message elders individually instead of forwarding a broadcast; many families still expect a personal invitation for a wedding.",
    ],
    faqs: [
      {
        q: "Is it okay to invite people to a wedding on WhatsApp?",
        a: "Yes, a WhatsApp invite with an e-card is now normal for most Indian weddings. For grandparents and senior relatives, follow it with a phone call or a visit.",
      },
      {
        q: "Should I send a wedding card on WhatsApp as a PDF, image or link?",
        a: "An image or video shows up instantly in the chat, while a link can hold the full programme, map and RSVP. Many couples send a card image with the link in the message below it.",
      },
      {
        q: "When should I send a wedding reminder on WhatsApp?",
        a: "A week before and again the day before work well. On the wedding morning, a short message with the location pin helps guests who are driving in.",
      },
    ],
    designs: ["gulmohar", "bagh", "chameli"],
  },

  // 3. English, family
  {
    slug: "wedding-invitation-wording-from-parents",
    fn: "wedding",
    lang: "en",
    tone: "family",
    title: "Wedding invitation wording from parents",
    description:
      "Wedding invitation wording from parents for the bride's side and groom's side: formal, warm and joint versions. Copy one and add your family's name and details.",
    intro:
      "When parents host the wedding, the card is written in their voice. This page has wording from the bride's parents, from the groom's parents, joint versions from both families, and gentler options such as remembering a late grandparent. Choose the side you are hosting from and replace the family name, date and venue.",
    wordings: [
      {
        label: "Bride's parents, formal",
        text: "With joy in our hearts, we, {family},\nrequest the pleasure of your company\nat the wedding of our daughter\n{bride}\nwith\n{groom}\non {date} at {time}\nat {venue}.",
      },
      {
        label: "Groom's parents, formal",
        text: "{family} cordially invites you\nto the wedding of their son\n{groom}\nwith\n{bride}\non {date} at {time}\nat {venue}.",
      },
      {
        label: "Bride's side, with grandparents' blessings",
        text: "With the blessings of her grandparents,\n{family} has the honour to invite you\nto the marriage of their beloved daughter {bride}\nwith {groom}\non {date}, {time}\n{venue}",
      },
      {
        label: "Groom's side, join the baraat",
        text: "{family} invites you to join the baraat and the wedding of our son {groom} with {bride}.\nDate: {date}\nBaraat departs: {time}\nVenue: {venue}\nCome dancing!",
      },
      {
        label: "Both families jointly",
        text: "Two families, one joy.\nThe families of {bride} and {groom} jointly invite you\nto celebrate their marriage\non {date} at {time}\nat {venue}.",
      },
      {
        label: "Bride's parents, warm",
        text: "Our little girl is getting married.\nWe, {family}, would love for you to be there when {bride} marries {groom} on {date} at {venue}.\nPlease come and bless them.",
      },
      {
        label: "Groom's parents, warm",
        text: "Our son {groom} has found his life partner in {bride}, and our family is about to grow a little bigger.\n{family} warmly invites you to their wedding on {date} at {time}, {venue}.",
      },
      {
        label: "Kanyadaan, bride's side",
        text: "We seek your presence and blessings\nas we perform the kanyadaan of our daughter {bride},\nwho weds {groom}\non {date} at {time}\nat {venue}.\nWith regards,\n{family}",
      },
      {
        label: "Groom's side, short",
        text: "{family} requests your gracious presence at the wedding of their son {groom} with {bride} on {date}.\nMuhurat: {time} | Venue: {venue}",
      },
      {
        label: "Remembering a loved one",
        text: "Remembering with love those who bless us from above,\n{family} invites you to the wedding of {bride} and {groom}\non {date} at {time}\nat {venue}.",
      },
      {
        label: "Whole family sign-off",
        text: "You are cordially invited to the wedding of\n{bride} and {groom}\n{date} · {time}\n{venue}\nAwaiting your presence:\nGrandparents, parents, uncles, aunts, brothers, sisters and all members of {family}",
      },
      {
        label: "Bride's parents to close friends",
        text: "Dear friends, there's a wedding at home!\n{bride} is marrying {groom} on {date}, and we can't imagine the day without you.\nSee you at {venue}.\nWith love, {family}",
      },
    ],
    tips: [
      "Decide first whose card it is. The bride's family usually names the bride first and the groom's family names the groom first.",
      "If both sets of parents are hosting, mention both families equally and print the same card for both sides' guests.",
      "Add the couple's parents' names under each name if your family follows that custom; it helps relatives place who is who.",
      "Use the closing line to list the family members inviting guests. Relatives often look for their names there, so check spellings with an elder.",
    ],
    faqs: [
      {
        q: "How do the bride's parents word a wedding invitation?",
        a: "They usually open with their own names, invite guests to the wedding of 'our daughter' and name the bride before the groom. Adding the groom's parents' names below his name is a respectful touch.",
      },
      {
        q: "What is the difference between bride's side and groom's side invitations?",
        a: "The wording is mostly the same, but each side names its own child first and lists its own relatives in the sign-off. The groom's side card often also mentions the baraat timing.",
      },
      {
        q: "How do you mention a late parent or grandparent on a wedding card?",
        a: "A line such as 'With the blessings of the late Shri …' or 'Remembering with love those who bless us from above' is common. Keep it near the top, before the hosts' names.",
      },
    ],
    designs: ["haveli", "rajwada", "gaurishankar"],
  },

  // 4. English, fun
  {
    slug: "funny-wedding-invitation-message",
    fn: "wedding",
    lang: "en",
    tone: "fun",
    title: "Funny wedding invitation messages",
    description:
      "Funny wedding invitation messages for friends: movie posters, cricket jokes, boarding passes. Playful, never rude, and they still tell guests where to be.",
    intro:
      "These funny wedding invitation messages are for the friends' group, cousins and colleagues, not the formal card. Each one still carries the names, date and venue, so the joke never hides the details. Send one alongside your proper e-invite to get the group chat excited.",
    wordings: [
      {
        label: "Breaking news",
        text: "Breaking news 📰\n{groom} has finally found someone who laughs at his jokes. Her name is {bride}.\nJoin us on {date} at {venue} before she changes her mind.",
      },
      {
        label: "Come for the food",
        text: "Come for the couple, stay for the food. 🍛\n{bride} & {groom}'s wedding\n{date}, {time}\n{venue}",
      },
      {
        label: "Terms and conditions",
        text: "{bride} and {groom} are getting married!\nTerms and conditions apply:\n1. Dancing in the baraat is compulsory.\n2. Your diet starts after the wedding.\n3. Gifts are optional, blessings are not.\n{date} · {time} · {venue}",
      },
      {
        label: "Movie poster",
        text: "Coming soon to {venue} 🎬\n{bride} and {groom} in\n'Happily Ever After'\nOne show only: {date}, {time}\nHouse full expected. Reply to book your seat.",
      },
      {
        label: "From hi to pheras",
        text: "It started with 'Hi' and ended with seven pheras. 💍\n{bride} and {groom} are getting married on {date} at {venue}. You're invited!",
      },
      {
        label: "Clean bowled",
        text: "{groom} is finally out, clean bowled by {bride}. 🏏\nMatch day: {date}, {time}\nStadium: {venue}\nCome cheer for the new partnership.",
      },
      {
        label: "Out of office",
        text: "Out of office: {bride} and {groom} will be unavailable from {date} as they are busy getting married at {venue}.\nFor anything urgent, please come to the wedding. 😄",
      },
      {
        label: "Weather forecast",
        text: "Today's forecast: 100% chance of love, heavy dancing and scattered gulab jamuns. ☀️\n{bride} weds {groom}\n{date}, {venue}",
      },
      {
        label: "Off the market",
        text: "Officially off the market: {bride} & {groom}. Party on {date}. Be there! 🎉",
      },
      {
        label: "The DJ has been warned",
        text: "Dust off your dancing shoes and iron your best kurta.\n{bride} and {groom} are getting married on {date} at {venue}, and the DJ has been warned.",
      },
      {
        label: "Wedding recipe",
        text: "Recipe for a wedding:\nTake one {bride}, add one {groom},\nmix with two loving families,\nsprinkle with haldi, mehndi and a lot of music.\nServe hot on {date} at {time}, {venue}.\nYou're the missing ingredient!",
      },
      {
        label: "Boarding pass",
        text: "✈️ Flight {bride} & {groom} to Forever\nDeparture: {date}, {time}\nGate: {venue}\nCabin crew: both families\nBaggage allowance: unlimited blessings",
      },
    ],
    tips: [
      "Keep the funny message for friends and cousins, and send elders the traditional card. Two versions of the invite is perfectly normal.",
      "Ask the couple before sending a joke about them. What's funny in the group chat may not be funny to the bride's grandmother.",
      "Stay away from jokes about dowry, weight, exes or 'losing freedom'; they age badly and can hurt someone at the wedding.",
      "However silly the message, keep the date, time and venue exact and easy to spot, ideally on their own line.",
    ],
    faqs: [
      {
        q: "Is it okay to send a funny wedding invitation?",
        a: "Yes, for friends and younger cousins it often gets more replies than a formal card. Pair it with the regular invitation so the full details are still there.",
      },
      {
        q: "How do I make a wedding invitation funny without being rude?",
        a: "Joke about the wedding itself (the food, the dancing, the long wait) rather than about a person. Gentle teasing of the couple is fine if they're in on it.",
      },
      {
        q: "Should a funny wedding message go to relatives too?",
        a: "Usually only to the relatives you're close and casual with. For elders and the family WhatsApp group, a warm traditional message is the safer choice.",
      },
    ],
    designs: ["gulmohar", "khat", "bagh"],
  },

  // 5. Hindi, traditional
  {
    slug: "wedding-invitation-message-in-hindi",
    fn: "wedding",
    lang: "hi",
    tone: "traditional",
    title: "Wedding invitation message in Hindi",
    description:
      "Traditional wedding invitation message in Hindi for shaadi cards: Ganesh vandana, paanigrahan wording, short lines and couplets. Copy and add your own details.",
    intro:
      "These Hindi wedding invitation messages are written the way family cards are actually printed, with words like शुभ विवाह, सादर आमंत्रित and पाणिग्रहण संस्कार. Some open with a Ganesh vandana, some are short card lines and some are rhyming couplets. Replace the names, date, time and venue, which stay in English so you can type them easily.",
    wordings: [
      {
        label: "Ganesh vandana opening",
        text: "॥ श्री गणेशाय नमः ॥\nवक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥\nपरमपिता परमेश्वर की असीम कृपा से\n{bride} एवं {groom}\nका शुभ विवाह {date} को {venue} में सम्पन्न होना निश्चित हुआ है।\nशुभ मुहूर्त: {time}\nआप सपरिवार सादर आमंत्रित हैं।",
      },
      {
        label: "Short card line",
        text: "शुभ विवाह\n{bride} संग {groom}\n{date} · {time}\n{venue}\nआपकी गरिमामयी उपस्थिति प्रार्थनीय है।",
      },
      {
        label: "Paanigrahan sanskar",
        text: "ईश्वर की कृपा एवं बड़ों के आशीर्वाद से\nचि. {groom}\nका पाणिग्रहण संस्कार\nसौ. कां. {bride}\nके साथ {date} को सम्पन्न होगा।\nशुभ मुहूर्त: {time}\nस्थान: {venue}\nपधारकर वर-वधू को आशीर्वाद प्रदान करें।",
      },
      {
        label: "Seven pheras, seven vows",
        text: "सात फेरों और सात वचनों के साथ\n{bride} और {groom} जीवन की नई यात्रा आरंभ कर रहे हैं।\nइस पावन अवसर पर आपका आशीर्वाद हमारे लिए अनमोल है।\n{date}, {time}\n{venue}",
      },
      {
        label: "Shehnai couplet",
        text: "शहनाई की मधुर धुन, मंडप की शोभा न्यारी,\nआपके आने से ही सजेगी, यह शुभ घड़ी हमारी।\n{bride} एवं {groom} के शुभ विवाह में\n{date} को {venue} अवश्य पधारें।",
      },
      {
        label: "Humble request",
        text: "सविनय निवेदन है कि\n{groom} एवं {bride} के शुभ विवाह के मंगल अवसर पर\nआप {date} को {time} {venue} में पधारकर\nहमें अनुगृहीत करें।",
      },
      {
        label: "Classic card format",
        text: "शुभ विवाह\nवर: {groom}\nवधू: {bride}\nदिनांक: {date}\nफेरे: {time}\nस्थान: {venue}\nदर्शनाभिलाषी: {family}",
      },
      {
        label: "Blessings are the gift",
        text: "{bride} और {groom} के विवाह की शुभ बेला पर\nआपकी उपस्थिति और आशीर्वाद ही हमारे लिए सबसे बड़ा उपहार होगा।\n{date} · {venue}",
      },
      {
        label: "With Agni as witness",
        text: "॥ शुभ विवाह ॥\nअग्नि को साक्षी मानकर\n{bride} एवं {groom}\nजन्म-जन्मांतर के बंधन में बंधने जा रहे हैं।\nइस मंगल घड़ी के साक्षी बनने हेतु\n{date} को {time} पर {venue} में आपकी प्रतीक्षा रहेगी।",
      },
      {
        label: "Two families meet",
        text: "दो परिवारों का मिलन, दो दिलों का संगम।\n{bride} एवं {groom} के विवाह समारोह में\nआप सादर आमंत्रित हैं।\n{date}, {venue}",
      },
      {
        label: "Swagatam",
        text: "स्वागतम्! हमारे आँगन में खुशियों ने दस्तक दी है।\n{groom} संग {bride} के शुभ विवाह पर\nआप अपने स्नेहीजनों सहित पधारें\nऔर इस उत्सव की शोभा बढ़ाएँ।\n{date} | {time} | {venue}",
      },
      {
        label: "Near or far",
        text: "दूर हों या पास, आपके बिना यह खुशी अधूरी है।\n{bride} और {groom} के विवाह में {date} को {venue} अवश्य पधारें।",
      },
    ],
    tips: [
      "Use चि. (chiranjeev) before the groom's name and सौ. कां. (saubhagyakankshini) before the bride's name if your family follows the traditional card style.",
      "Write the date in the form your guests read most easily. Many families print both the English date and the Hindu tithi, for example 'मार्गशीर्ष शुक्ल पंचमी'.",
      "If you start with a shloka, check every matra carefully or have an elder proofread it; mistakes in a vandana are noticed quickly.",
      "Pick one register and stay with it: formal words like 'प्रार्थनीय' and 'अनुगृहीत' read oddly next to casual lines on the same card.",
    ],
    faqs: [
      {
        q: "How do you write a wedding invitation in Hindi?",
        a: "Start with an invocation such as ॥ श्री गणेशाय नमः ॥, then the couple's names, the date, muhurat and venue, and close with a line like 'आप सपरिवार सादर आमंत्रित हैं'. Many cards end with दर्शनाभिलाषी and the family names.",
      },
      {
        q: "What does पाणिग्रहण संस्कार mean on a wedding card?",
        a: "It literally means 'taking of the hand' and is the formal Sanskrit name for the wedding ritual. It is used on traditional Hindi cards in place of the simpler शुभ विवाह.",
      },
      {
        q: "What do चि. and सौ. कां. mean before names on a Hindi wedding card?",
        a: "चि. stands for चिरंजीव (may he live long) and is used for the groom. सौ. कां. stands for सौभाग्यकांक्षिणी (one who wishes for good fortune) and is used for the bride.",
      },
    ],
    designs: ["mandir", "gaurishankar", "mahal"],
  },

  // 6. Hindi, WhatsApp
  {
    slug: "wedding-invitation-message-in-hindi-for-whatsapp",
    fn: "wedding",
    lang: "hi",
    tone: "whatsapp",
    title: "Wedding invitation message in Hindi for WhatsApp",
    description:
      "Wedding invitation message in Hindi for WhatsApp: short shaadi invites, reminders, status lines and RSVP notes. Add your details and send with your card.",
    intro:
      "Short Hindi wedding messages to forward on WhatsApp, written the way people actually text relatives and friends. You'll find a message to send with the e-card, reminders for the week before and the day before, a respectful note for elders and a status line. Replace the names, date and venue, which stay in English, and send.",
    wordings: [
      {
        label: "Simple invite",
        text: "शादी का न्योता 💍\n{bride} ❤️ {groom}\n{date}, {time}\n{venue}\nज़रूर आइएगा!",
      },
      {
        label: "Namaste, there's a wedding",
        text: "नमस्ते 🙏 हमारे घर शादी है! {bride} और {groom} के विवाह में आप सपरिवार {date} को {venue} पधारें।",
      },
      {
        label: "With the card link",
        text: "शादी का निमंत्रण पत्र भेज रहे हैं 💌\nलिंक खोलकर पूरा कार्यक्रम और लोकेशन देख लीजिए।\n{bride} संग {groom} · {date}",
      },
      {
        label: "One week to go",
        text: "बस एक हफ़्ता बाकी! 🎉 {date} को {bride} और {groom} की शादी में आपका इंतज़ार रहेगा।",
      },
      {
        label: "Day-before reminder",
        text: "कल {bride} और {groom} का शुभ विवाह है 🙏 फेरे {time} पर, {venue} में। समय पर पहुँचिएगा।",
      },
      {
        label: "WhatsApp status",
        text: "{bride} 💛 {groom}\nशुभ विवाह · {date}",
      },
      {
        label: "Respectful note for elders",
        text: "आदरणीय, सादर प्रणाम। {bride} और {groom} के विवाह में आपका आशीर्वाद चाहिए। {date} को {venue} में आप सपरिवार अवश्य पधारें। 🙏",
      },
      {
        label: "For the friends' group",
        text: "भाई लोग, तैयारी कर लो! 🕺 {date} को {groom} और {bride} की शादी है, {venue} में। कोई बहाना नहीं चलेगा।",
      },
      {
        label: "Asking for RSVP",
        text: "{date} को {bride}-{groom} का विवाह है। कृपया बता दें कि आप कितने लोग आएँगे, ताकि व्यवस्था ठीक से हो सके। धन्यवाद 🙏",
      },
      {
        label: "Live stream for far-away family",
        text: "जो दूर हैं, वे भी जुड़ें 📱\n{bride} और {groom} के फेरे {date} को {time} पर लाइव देखें। लिंक नीचे है।",
      },
      {
        label: "Wedding morning",
        text: "आज शुभ दिन है! 🌸 {bride} और {groom} का विवाह {venue} में। लोकेशन भेज रहे हैं।",
      },
      {
        label: "Haldi done, now the pheras",
        text: "हल्दी लगी, मेहंदी रची, अब बारी है फेरों की।\n{bride} और {groom} की शादी में {date} को ज़रूर आइए। 🌼",
      },
    ],
    tips: [
      "Type Hindi messages in Devanagari rather than Hinglish for elders; most older relatives read it more comfortably.",
      "Keep the date and venue in the same script your guests use for maps. An English venue name is easier to search in Google Maps.",
      "Send the card image first and this message right after it, so the text appears as a caption-like note under the card.",
      "For the family group, send one message and let elders reply there; for everyone else, a broadcast list keeps it personal.",
    ],
    faqs: [
      {
        q: "How do I write a short Hindi wedding invite for WhatsApp?",
        a: "Keep it to two or three lines: a greeting like नमस्ते or सादर प्रणाम, the couple's names with the date and venue, and a closing such as ज़रूर आइएगा or सपरिवार पधारें.",
      },
      {
        q: "Is a WhatsApp invite enough for relatives in Hindi-speaking families?",
        a: "For most guests, yes. For very close or senior relatives, families still prefer to call or visit with a card, and the WhatsApp message then works as a reminder.",
      },
      {
        q: "Should I write the date in Hindi or English on WhatsApp?",
        a: "English dates are easiest for everyone to read and to save in the calendar. You can add the Hindu tithi in brackets if your family follows it.",
      },
    ],
    designs: ["chameli", "gulmohar", "mandir"],
  },

  // 7. Hindi, family
  {
    slug: "wedding-invitation-in-hindi-from-parents",
    fn: "wedding",
    lang: "hi",
    tone: "family",
    title: "Wedding invitation in Hindi from parents",
    description:
      "Wedding invitation in Hindi from parents for kanya paksh and var paksh: suputri and suputra wording, baraat lines and bal manuhar. Add your family details.",
    intro:
      "This page is for parents writing the wedding card in Hindi, from the bride's side (कन्या पक्ष) or the groom's side (वर पक्ष). It includes formal सुपुत्र / सुपुत्री wording, a baraat invitation, a kanyadaan line, a remembrance line for elders and a playful बाल मनुहार from the children of the house. Replace the family name, couple's names and details.",
    wordings: [
      {
        label: "Kanya paksh, formal",
        text: "॥ श्री गणेशाय नमः ॥\n{family}\nअपनी सुपुत्री\nसौ. कां. {bride}\nका शुभ विवाह\nचि. {groom}\nके साथ {date} को होना निश्चित किया है।\nइस मंगल अवसर पर आप सपरिवार सादर आमंत्रित हैं।\nसमय: {time} | स्थान: {venue}",
      },
      {
        label: "Var paksh, formal",
        text: "{family}\nके सुपुत्र\nचि. {groom}\nका शुभ विवाह\nसौ. कां. {bride}\nके साथ {date} को {venue} में सम्पन्न होगा।\nशुभ मुहूर्त: {time}\nआपकी गरिमामयी उपस्थिति प्रार्थनीय है।",
      },
      {
        label: "Baraat invitation",
        text: "हमारे सुपुत्र {groom} की बारात {date} को {time} पर प्रस्थान करेगी।\n{bride} के साथ पाणिग्रहण संस्कार {venue} में सम्पन्न होगा।\nबारात में सम्मिलित होकर शोभा बढ़ाएँ।\nविनीत: {family}",
      },
      {
        label: "Kanyadaan, bride's parents",
        text: "हमारी लाडली बिटिया {bride} के कन्यादान का पुण्य अवसर आ गया है।\nचि. {groom} के साथ उसके शुभ विवाह में\n{date} को {time} पर {venue} पधारकर\nवर-वधू को आशीर्वाद प्रदान करें।\n— {family}",
      },
      {
        label: "Both families together",
        text: "दोनों परिवारों की ओर से सादर निमंत्रण।\n{bride} एवं {groom} के शुभ विवाह में\nआप सपरिवार आमंत्रित हैं।\n{date} · {time}\n{venue}",
      },
      {
        label: "A bahu is coming home",
        text: "हमारे घर बहू आ रही है!\nहमारे सुपुत्र {groom} का विवाह {bride} के साथ {date} को होने जा रहा है।\nइस खुशी में शामिल होने {venue} अवश्य पधारें।\nस्नेहाकांक्षी: {family}",
      },
      {
        label: "Our daughter becomes a bride",
        text: "जिस बिटिया को गोद में खिलाया, आज वह दुल्हन बनने जा रही है।\n{bride} और {groom} के विवाह में {date} को {venue} पधारकर\nउसे अपना आशीर्वाद दें।\n{family}",
      },
      {
        label: "With elders' blessings and remembrance",
        text: "पूज्य दादा-दादी के आशीर्वाद एवं स्वर्गीय पूर्वजों की पुण्य स्मृति के साथ\n{family}\nआपको {bride} एवं {groom} के शुभ विवाह में सादर आमंत्रित करता है।\n{date}, {time}\n{venue}",
      },
      {
        label: "Full card with sign-off",
        text: "शुभ विवाह\n{groom} संग {bride}\nदिनांक: {date}\nफेरे: {time}\nस्थान: {venue}\nस्वागतोत्सुक: {family} एवं समस्त परिवारजन",
      },
      {
        label: "Bal manuhar",
        text: "बाल मनुहार:\nमेरी दीदी {bride} और जीजू {groom} की शादी में\n{date} को ज़रूर-ज़रूर आना,\nसाथ में ढेर सारा आशीर्वाद लाना!",
      },
      {
        label: "Var paksh, short",
        text: "{family} आपको अपने सुपुत्र {groom} एवं {bride} के शुभ विवाह में सादर आमंत्रित करता है।\n{date} · {time} · {venue}",
      },
      {
        label: "Wedding and pritibhoj",
        text: "शुभ विवाह एवं प्रीतिभोज\n{family} की सुपुत्री {bride} का विवाह {groom} के साथ\n{date} को {venue} में होगा।\nफेरे: {time}\nप्रीतिभोज: फेरों के उपरांत\nकृपया पधारकर हमें कृतार्थ करें।",
      },
    ],
    tips: [
      "On the bride's side card write सुपुत्री and name the bride first; on the groom's side write सुपुत्र and name the groom first.",
      "End with विनीत, स्वागतोत्सुक or दर्शनाभिलाषी followed by the family names. Relatives often check whether their name is listed, so confirm the list with elders.",
      "A बाल मनुहार line from the children of the family is a much-loved touch on North Indian cards; keep it short and place it at the bottom.",
      "If the groom's family is sending the card, add the baraat departure time separately from the phera muhurat so guests know when to arrive.",
    ],
    faqs: [
      {
        q: "What is the difference between कन्या पक्ष and वर पक्ष invitations?",
        a: "कन्या पक्ष is the bride's family and वर पक्ष is the groom's family. Each prints its own card, naming its own child first and inviting its own guests.",
      },
      {
        q: "What is बाल मनुहार on a Hindi wedding card?",
        a: "It is a short, playful invitation written in the voice of the family's children, asking guests to come to their sister's or brother's wedding. It usually appears at the bottom of the card.",
      },
      {
        q: "Should the card say सुपुत्र / सुपुत्री or पुत्र / पुत्री?",
        a: "सुपुत्र and सुपुत्री are the respectful, customary forms on wedding cards. पुत्र and पुत्री are correct too but read plainer.",
      },
    ],
    designs: ["haveli", "gaurishankar", "rajwada"],
  },

  // 8. Hindi, fun
  {
    slug: "funny-wedding-invitation-message-in-hindi",
    fn: "wedding",
    lang: "hi",
    tone: "fun",
    title: "Funny wedding invitation messages in Hindi",
    description:
      "Funny wedding invitation messages in Hindi for friends and cousins: shaadi ka laddoo, mummy ka aadesh, DJ wale babu and more. Light, playful and easy to share.",
    intro:
      "Funny Hindi wedding messages for the friends' group and the cousins' chat, full of the shaadi jokes everyone knows. Each one keeps the names, date and venue so guests still know where to turn up. Send one alongside your proper invite and watch the replies roll in.",
    wordings: [
      {
        label: "Public notice",
        text: "सर्वसाधारण को सूचित किया जाता है कि दिनांक {date} से {groom} कुँवारे नहीं रहेंगे। 📢\nज़िम्मेदार: {bride}\nगवाह बनने हेतु {time} पर {venue} पहुँचें।",
      },
      {
        label: "Really, it's for the food",
        text: "शादी {bride} और {groom} की है, लेकिन सच बताएँ तो हम आपको पनीर टिक्का और गुलाब जामुन के लिए बुला रहे हैं। 😋\n{date}, {venue}",
      },
      {
        label: "Mere yaar ki shaadi",
        text: "मेरे यार की शादी है! 🎶\n{groom} और {bride} की शादी में {date} को {venue} आइए और जमकर नाचिए।",
      },
      {
        label: "Shaadi ka laddoo",
        text: "शादी का लड्डू जो खाए वो पछताए, जो न खाए वो भी पछताए।\n{groom} ने खाने का फ़ैसला कर लिया है, {bride} के साथ!\n{date} को {venue} में आप भी आइए, लड्डू हम खिलाएँगे। 😄",
      },
      {
        label: "Mummy's strict orders",
        text: "मम्मी का सख़्त आदेश है कि आप ज़रूर आएँ, वरना हमारी ख़ैर नहीं! 🙏\n{bride} और {groom} का विवाह\n{date} · {time} · {venue}",
      },
      {
        label: "Start practising",
        text: "नाचने की प्रैक्टिस शुरू कर दीजिए! 💃\nबारात {time} पर निकलेगी और डीजे वाले बाबू तैयार हैं।\n{groom} संग {bride} · {date} · {venue}",
      },
      {
        label: "No more 'when's the wedding?'",
        text: "अब कोई नहीं पूछेगा 'शादी कब कर रहे हो?' 😌\nक्योंकि {bride} और {groom} की शादी {date} को है!\nस्थान: {venue}। आइए, अपनी आँखों से देख लीजिए।",
      },
      {
        label: "Wedding express",
        text: "🚂 {bride}-{groom} एक्सप्रेस\nप्रस्थान: {date}, {time}\nप्लेटफ़ॉर्म: {venue}\nमंज़िल: ज़िंदगी भर का साथ\nटिकट की ज़रूरत नहीं, बस आशीर्वाद लेकर आइए।",
      },
      {
        label: "Good news for singles",
        text: "सिंगल दोस्तों के लिए ख़ुशख़बरी: शादियों में ही तो रिश्ते तय होते हैं! 😉\n{bride} और {groom} की शादी · {date} · {venue}",
      },
      {
        label: "Get the selfie pose ready",
        text: "नए कपड़े सिलवा लीजिए, सेल्फ़ी का पोज़ सोच लीजिए।\n{bride} और {groom} की शादी में {date} को फ़ोटो खिंचवाने ज़रूर आइए! 📸",
      },
      {
        label: "The shortest one",
        text: "{bride} + {groom} = शादी! 🎉 {date} को मिलते हैं।",
      },
      {
        label: "Rhyme for the group",
        text: "दूल्हे राजा तैयार हैं, दुल्हनिया भी तैयार है,\nबस आपकी कमी है, आपका इंतज़ार है!\n{groom} संग {bride} · {date}, {time}\n{venue}",
      },
    ],
    tips: [
      "Filmy lines and shaadi jokes land best with cousins and friends; for elders and the family group, send the traditional Hindi card instead.",
      "Keep the jokes about the wedding (the food, the dancing, nosy relatives), not about the bride's or groom's looks or family.",
      "Pair the message with a song reference only if the whole group will get it; one well-known line beats a long verse.",
      "Even in a joke message, write the venue name exactly as it appears on Google Maps so guests can search it.",
    ],
    faqs: [
      {
        q: "Can I send a funny Hindi wedding message to the family group?",
        a: "Only if your family group is light-hearted. In most families it's safer to send the formal invite to the group and the funny one to friends and cousins.",
      },
      {
        q: "What are good funny lines for a Hindi wedding invitation?",
        a: "Familiar jokes work best: 'शादी का लड्डू', the mother's strict orders, the end of 'शादी कब करोगे?' questions, and the promise of good food and dancing.",
      },
      {
        q: "Is it okay to use Bollywood song lines in a wedding invite?",
        a: "A short, well-known line like 'मेरे यार की शादी है' is fine for a personal invitation. Avoid copying long lyrics, especially on anything printed or sold.",
      },
    ],
    designs: ["gulmohar", "khat", "chameli"],
  },
];
