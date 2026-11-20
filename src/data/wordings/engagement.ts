import type { WordingPage } from "./types";

export const engagementPages: WordingPage[] = [
  // 1. English, traditional
  {
    slug: "engagement-invitation-message",
    fn: "engagement",
    lang: "en",
    tone: "traditional",
    title: "Engagement invitation message",
    description:
      "Warm, respectful engagement invitation message ideas for cards and digital invites, with blessings, ring ceremony wording and room for date, time and venue.",
    intro:
      "These engagement invitation messages are written for a printed card or a digital invite that elders will read closely. Each one leaves space for the couple's names, the date, time and venue, so you can copy one as it is or adjust a line to suit your family. Pick a short one if your card already has a lot of detail, or a longer one if the wording is the main feature.",
    wordings: [
      {
        label: "Warm and simple",
        text: "With joy in our hearts, we invite you to the engagement of\n{bride} and {groom}\non {date} at {time}\nat {venue}.\nYour presence will make the day complete.",
      },
      {
        label: "Blessings first",
        text: "Two families, one promise.\nPlease join us for the engagement ceremony of {bride} and {groom} and bless them as they begin a new chapter.\n{date} · {time}\n{venue}",
      },
      {
        label: "Ring ceremony",
        text: "We request the pleasure of your company at the ring ceremony of\n{bride} & {groom}\n{date}, {time}\n{venue}",
      },
      {
        label: "Short and graceful",
        text: "{bride} and {groom} are getting engaged.\nWe would be honoured by your presence on {date} at {venue}.",
      },
      {
        label: "With an invocation",
        text: "Shri Ganeshaya Namah\nBy the grace of the Almighty and with the blessings of our elders,\nwe invite you to the sagai ceremony of\n{bride} and {groom}\non {date} at {time}\nat {venue}.",
      },
      {
        label: "Promise of a lifetime",
        text: "A promise made in the presence of those we love means the most.\nKindly join us as {bride} and {groom} exchange rings on {date}, {time}, at {venue}.",
      },
      {
        label: "Formal card style",
        text: "The pleasure of your company is requested\nat the engagement of\n{bride}\nwith\n{groom}\non {date}\nat {time}\n{venue}",
      },
      {
        label: "Family welcome",
        text: "Our families are coming together, and we would love you to be part of it.\nJoin us for the engagement of {bride} and {groom}.\n{date} | {time}\n{venue}\nLunch to follow.",
      },
      {
        label: "Two lines",
        text: "Please bless {bride} and {groom} at their engagement ceremony.\n{date}, {time} · {venue}",
      },
      {
        label: "The beginning",
        text: "Every beautiful journey begins with a single step.\nFor {bride} and {groom}, that step is their engagement.\nWe warmly invite you to witness it with us on {date} at {time}, at {venue}.",
      },
      {
        label: "Roka and ring ceremony",
        text: "With great happiness we announce the roka and ring ceremony of {bride} and {groom}.\nYour blessings are requested on {date} at {time}.\nVenue: {venue}",
      },
      {
        label: "Evening engagement",
        text: "An evening of rings, blessings and togetherness.\nYou are cordially invited to the engagement of {bride} and {groom}\non {date}, from {time} onwards,\nat {venue}.\nDinner to follow.",
      },
    ],
    tips: [
      "Say which ceremony it is: a sagai with rituals, a simple ring exchange, or a roka. Elders like to know whether to come for the puja or only the ring exchange.",
      "Mention whether a meal follows (lunch or dinner) so guests can plan their day.",
      "If the engagement is a smaller family affair, keep the wording warm but brief, and send it personally rather than as a mass forward.",
      "Get the couple's full names checked by both families before printing; spellings matter to elders.",
    ],
    faqs: [
      {
        q: "What should an engagement invitation message include?",
        a: "The couple's names, the ceremony (engagement, ring ceremony or sagai), the date, time and venue. Add a line about a meal or dress code if relevant, and a contact for directions.",
      },
      {
        q: "How early should engagement invitations be sent?",
        a: "Two to three weeks ahead is usual for an engagement. If guests need to travel, send them four to six weeks ahead or share a save-the-date first.",
      },
      {
        q: "Whose name comes first on an engagement invitation?",
        a: "Traditionally the hosting family's child comes first, so the bride's side often lists the bride first and the groom's side the groom. On a joint invite, either order is fine as long as both families agree.",
      },
    ],
    designs: ["angoothi", "chandni", "mudrika"],
  },

  // 2. English, WhatsApp
  {
    slug: "engagement-invitation-message-for-whatsapp",
    fn: "engagement",
    lang: "en",
    tone: "whatsapp",
    title: "Engagement invitation message for WhatsApp",
    description:
      "Short engagement invitation messages for WhatsApp you can copy and forward to friends and family, with the couple's names, date, time and venue in a few lines.",
    intro:
      "These engagement invitation messages are short enough to read in a WhatsApp preview and easy to forward. Send one along with your invite link or card image, and the message does the inviting while the card carries the details. Most are one to four lines, with an emoji or two at most.",
    wordings: [
      {
        label: "Quick and clear",
        text: "{bride} & {groom} are getting engaged! 💍\n{date}, {time} at {venue}. Please come!",
      },
      {
        label: "Personal note",
        text: "Hi! We'd love to have you at {bride} and {groom}'s engagement on {date}. Details are in the invite above. See you there 🙏",
      },
      {
        label: "Save the date",
        text: "Save the date 💍\nEngagement of {bride} & {groom}\n{date} · {venue}",
      },
      {
        label: "With blessings",
        text: "With the blessings of our elders, {bride} and {groom} will exchange rings on {date} at {time}. Your presence would mean a lot.\n📍 {venue}",
      },
      {
        label: "One line",
        text: "Ring ceremony of {bride} & {groom}, {date}, {time}, {venue}. Do join us!",
      },
      {
        label: "Excited",
        text: "It's official! 🎉 {bride} and {groom} are getting engaged and you have to be there.\n{date} | {time}\n{venue}",
      },
      {
        label: "For family groups",
        text: "Dear all, the sagai of {bride} and {groom} is on {date} at {time}, at {venue}. Please come with family and bless the couple 🙏",
      },
      {
        label: "With invite link",
        text: "Our engagement invite is here 💌\n{bride} & {groom}, {date}\nTap the link for venue, timings and directions.",
      },
      {
        label: "Reminder",
        text: "Just a reminder: {bride} and {groom}'s engagement is this {date}, {time} at {venue}. Can't wait to see you!",
      },
      {
        label: "Roka news",
        text: "Happy news! The roka of {bride} and {groom} is fixed for {date}. We'd love your blessings in person.\n📍 {venue}",
      },
      {
        label: "Status update",
        text: "Two rings, one promise 💍\n{bride} ❤ {groom}\n{date}",
      },
      {
        label: "Polite and short",
        text: "You are warmly invited to the engagement of {bride} and {groom} on {date} at {time}, at {venue}. Kindly confirm if you can make it.",
      },
    ],
    tips: [
      "Send the card image or invite link first, then the message, so the preview shows your design.",
      "For elders, follow the forward with a phone call; many still treat a WhatsApp invite as informal without one.",
      "Share a live location pin for the venue in the same chat, especially for halls that are hard to find.",
      "Send a short reminder a day or two before the engagement, as WhatsApp invites get buried quickly.",
    ],
    faqs: [
      {
        q: "Is it okay to invite people to an engagement on WhatsApp?",
        a: "Yes, most engagement invites are now sent on WhatsApp. For close elders, a personal call alongside the message is still considered good manners.",
      },
      {
        q: "Should I send an engagement invite as an image or a link?",
        a: "A link to a digital invite lets guests open directions, timings and RSVP in one tap, while an image is easier to save. Many families send both.",
      },
      {
        q: "How do I ask guests to RSVP for an engagement on WhatsApp?",
        a: "Add a line such as \"Kindly confirm by Friday\" or use an invite with a built-in RSVP, so you aren't tracking replies across dozens of chats.",
      },
    ],
    designs: ["chandni", "angoothi"],
  },

  // 3. English, family
  {
    slug: "engagement-invitation-wording-from-parents",
    fn: "engagement",
    lang: "en",
    tone: "family",
    title: "Engagement invitation wording from parents",
    description:
      "Engagement invitation wording from parents and family hosts, with formal and warm options for the bride's side, groom's side or both families inviting together.",
    intro:
      "When parents host the engagement, the invitation is written in their voice: they invite guests to bless their son or daughter. These wordings cover the bride's family, the groom's family and both families hosting together. Type the hosts' names in the Family box above, for example \"Mr. & Mrs. Rajesh Sharma\" or \"the Sharma family\".",
    wordings: [
      {
        label: "Bride's parents",
        text: "{family}\nrequest the pleasure of your company\nat the engagement of their daughter\n{bride}\nwith {groom}\non {date} at {time}\nat {venue}.",
      },
      {
        label: "Groom's parents",
        text: "{family} joyfully invite you to the ring ceremony of their son {groom} with {bride}.\n{date}, {time}\n{venue}\nYour blessings are our greatest gift.",
      },
      {
        label: "Both families together",
        text: "With the blessings of our elders,\nthe families of {bride} and {groom}\ninvite you to celebrate their engagement\non {date} at {time}\nat {venue}.",
      },
      {
        label: "Warm and personal",
        text: "Our daughter {bride} is getting engaged to {groom}, and our happiness would not be complete without you.\n{family} invite you to join us on {date} at {time}, at {venue}.",
      },
      {
        label: "Short from family",
        text: "{family} cordially invites you to the sagai of {bride} and {groom}.\n{date} · {venue}",
      },
      {
        label: "Grandparents' blessings",
        text: "With the blessings of our grandparents\nand in the presence of family and friends,\n{family} invite you to the engagement ceremony of\n{bride} & {groom}\n{date} | {time}\n{venue}",
      },
      {
        label: "Roka hosted by family",
        text: "{family} are delighted to share that the roka of {groom} and {bride} will take place on {date} at {time}.\nWe request you to grace the occasion at {venue}.",
      },
      {
        label: "Formal with dinner",
        text: "{family}\nsolicit your gracious presence\nat the engagement of {bride} and {groom}\non {date}, at {time}\nat {venue}\nfollowed by dinner.",
      },
      {
        label: "Two families, one joy",
        text: "Two families are becoming one, and we want you there when it begins.\n{family} invite you to the ring ceremony of {bride} and {groom} on {date}, {time}, at {venue}.",
      },
      {
        label: "Tilak ceremony",
        text: "{family} invite you to the tilak ceremony of their son {groom}, whose marriage has been fixed with {bride}.\n{date} at {time}\n{venue}\nPlease come and bless him.",
      },
      {
        label: "From mother and father",
        text: "As parents, we have waited for this day with love and prayers.\nPlease join {family} as {bride} and {groom} are engaged on {date}, at {venue}.",
      },
      {
        label: "Simple and respectful",
        text: "{family} seek your blessings and presence at the engagement of {bride} and {groom}.\nDate: {date}\nTime: {time}\nVenue: {venue}",
      },
    ],
    tips: [
      "Decide with the other family whose names appear as hosts; for a joint engagement, list both families or use \"the families of\".",
      "Use the parents' names the way they're known in your circle, for example \"Mr. & Mrs. Anil Gupta\" or \"Smt. & Shri Gupta\".",
      "For a tilak or roka hosted by one side only, mention just that family and say whose home or venue it is.",
      "Add an RSVP contact for one parent, since guests usually call the hosts rather than the couple for an engagement.",
    ],
    faqs: [
      {
        q: "How do parents word an engagement invitation?",
        a: "Start with the parents' names as hosts, then \"invite you to the engagement of their daughter/son\", followed by the couple's names, date, time and venue.",
      },
      {
        q: "Who hosts the engagement ceremony in India?",
        a: "Customs vary by community. Often the bride's family hosts the engagement, but many families now share it or the groom's family hosts, so the wording should name whoever is actually hosting.",
      },
      {
        q: "Can both sets of parents be named on one engagement invitation?",
        a: "Yes. List both families, usually the host side first, or write \"together with their families\" if the names make the card too crowded.",
      },
    ],
    designs: ["chamelisagai", "vachan", "roka"],
  },

  // 4. English, fun
  {
    slug: "funny-engagement-invitation-message",
    fn: "engagement",
    lang: "en",
    tone: "fun",
    title: "Funny engagement invitation messages",
    description:
      "Funny engagement invitation messages for friends: playful, light-hearted lines about the ring, the proposal and the party, with room for date, time and venue.",
    intro:
      "These funny engagement invitation messages are for friends' groups and couples who don't want a formal tone. The humour is gentle, about rings, relatives and finally saying yes, so they are safe to forward to cousins and colleagues too. Keep the formal version for elders and send these to everyone else.",
    wordings: [
      {
        label: "Off the market",
        text: "Breaking news: {bride} and {groom} are officially off the market 💍\nCome watch it happen on {date}, {time} at {venue}.",
      },
      {
        label: "Ring alert",
        text: "Ring alert! 💍\n{groom} found someone who laughs at his jokes, and {bride} said yes anyway.\nEngagement on {date} at {venue}. Food is guaranteed, speeches are not.",
      },
      {
        label: "Aunties were right",
        text: "The aunties were right all along.\n{bride} & {groom} are getting engaged!\n{date} | {time} | {venue}",
      },
      {
        label: "Terms and conditions",
        text: "You are invited to the engagement of {bride} and {groom}.\nTerms & conditions:\n1. Dress well, there will be photos.\n2. Eat well, there will be food.\n3. Dance well, there will be no escape.\n{date}, {time} · {venue}",
      },
      {
        label: "Short and cheeky",
        text: "She said yes. He said finally. 😄\n{bride} & {groom}'s engagement, {date}.",
      },
      {
        label: "Project update",
        text: "Project \"{bride} + {groom}\" has moved from dating to engaged. 🎉\nLaunch event: {date}, {time}\nVenue: {venue}\nAttendance is mandatory, gifts are optional.",
      },
      {
        label: "No more questions",
        text: "To everyone who asked \"so when are you two getting married?\":\nwe're one step closer.\nJoin {bride} and {groom} for their ring ceremony on {date} at {venue}.",
      },
      {
        label: "Bring your appetite",
        text: "Two people, one ring, unlimited snacks.\nCelebrate the engagement of {bride} and {groom} on {date} from {time} at {venue}.",
      },
      {
        label: "Group chat edition",
        text: "Group, silence please 📢\n{bride} and {groom} are getting engaged on {date}.\nAttendance will be marked. 📍 {venue}",
      },
      {
        label: "Signed and sealed",
        text: "Signed, sealed and almost delivered.\n{bride} and {groom} are exchanging rings on {date} at {time}.\nCome for the couple, stay for the dinner.\n{venue}",
      },
      {
        label: "Best decision",
        text: "{groom}'s best decision yet: asking {bride}.\n{bride}'s bravest decision yet: saying yes.\nCelebrate both on {date} at {venue}.",
      },
      {
        label: "Practice run",
        text: "Consider this the trailer before the wedding blockbuster 🎬\nEngagement of {bride} & {groom}\n{date} · {time} · {venue}",
      },
    ],
    tips: [
      "Run the joke past the couple first; something funny to friends can embarrass one of them in front of in-laws.",
      "Keep the date, time and venue clear even in a playful message, so the joke doesn't hide the details.",
      "Use funny wording for friends' groups and a traditional version for elders and family groups.",
      "Keep teasing light and mutual: joke about both of them, never only one partner or their family.",
    ],
    faqs: [
      {
        q: "Can an engagement invitation be funny?",
        a: "Yes, especially for a friends-only party or a digital invite sent to your own circle. Many couples send a formal invite to family and a fun one to friends.",
      },
      {
        q: "What makes a good funny engagement message?",
        a: "Keep it short, use a joke everyone gets (rings, relatives, food) and avoid inside jokes that half the guests won't understand.",
      },
      {
        q: "Should a funny invite still say how to RSVP?",
        a: "Yes. A quick line like \"Reply with your dance moves and a headcount\" keeps the tone and still gets you numbers for the caterer.",
      },
    ],
    designs: ["chandni", "angoothi"],
  },

  // 5. Hindi, traditional
  {
    slug: "engagement-invitation-message-in-hindi",
    fn: "engagement",
    lang: "hi",
    tone: "traditional",
    title: "Engagement invitation message in Hindi",
    description:
      "Engagement invitation message in Hindi for sagai cards and digital invites: traditional Devanagari wording with blessings, ring ceremony lines, date and venue.",
    intro:
      "These Hindi engagement invitation messages follow the way families write sagai cards: an invocation or blessing, the couple's names, and a respectful request to come and bless them. The wordings are in Devanagari with blanks for names, date, time and venue that fill in from your details. Use them on a printed card, a digital invite or a message to relatives.",
    wordings: [
      {
        label: "Classic sagai card",
        text: "॥ श्री गणेशाय नमः ॥\nपरमपिता परमेश्वर की असीम कृपा से\n{bride} एवं {groom}\nके शुभ सगाई समारोह में\nआप सपरिवार सादर आमंत्रित हैं।\nदिनांक: {date}\nसमय: {time}\nस्थान: {venue}",
      },
      {
        label: "Simple and warm",
        text: "{bride} और {groom} की सगाई के शुभ अवसर पर आपकी उपस्थिति हमारे लिए सौभाग्य होगी।\n{date}, {time}\n{venue}",
      },
      {
        label: "Ring ceremony",
        text: "रिंग सेरेमनी\n{bride} संग {groom}\n{date} को {time}, {venue} में\nपधारकर नवयुगल को आशीर्वाद दें।",
      },
      {
        label: "Short blessing",
        text: "{bride} और {groom} के नए जीवन की शुरुआत पर आपका आशीर्वाद चाहिए।\nसगाई: {date}, {venue}",
      },
      {
        label: "Mangni",
        text: "हर्ष के साथ सूचित करते हैं कि\n{bride} एवं {groom} की मंगनी\n{date} को {time}\n{venue} में होना निश्चित हुआ है।\nआप सादर आमंत्रित हैं।",
      },
      {
        label: "Two families",
        text: "दो परिवार, एक रिश्ता।\n{bride} और {groom} की सगाई के पावन अवसर पर\nआपकी गरिमामयी उपस्थिति प्रार्थनीय है।\n{date} | {time} | {venue}",
      },
      {
        label: "With a couplet",
        text: "रिश्तों की डोर में बँधने चले हैं दो दिल,\nआपके आशीर्वाद से ही होगी हर खुशी पूरी।\n{bride} एवं {groom} की सगाई\n{date}, {time}, {venue}",
      },
      {
        label: "Formal request",
        text: "सविनय निवेदन है कि {bride} एवं {groom} के शुभ सगाई समारोह में {date} को {time} {venue} पधारकर समारोह की शोभा बढ़ाएँ।",
      },
      {
        label: "Roka",
        text: "प्रभु की कृपा से {bride} और {groom} का रोका\n{date} को {venue} में होगा।\nआप सभी के आशीर्वाद की कामना है।",
      },
      {
        label: "With bhojan",
        text: "{bride} एवं {groom}\nशुभ सगाई समारोह\nदिनांक: {date}\nसमय: {time}\nस्थान: {venue}\nसमारोह के पश्चात प्रीतिभोज।",
      },
      {
        label: "Divine blessing",
        text: "ईश्वर के आशीर्वाद और बड़ों के स्नेह से\n{bride} और {groom} जीवन के नए सफर की ओर पहला कदम रख रहे हैं।\nइस शुभ घड़ी के साक्षी बनने के लिए {date} को {venue} अवश्य पधारें।",
      },
      {
        label: "Two lines",
        text: "{bride} व {groom} की सगाई में आप सादर आमंत्रित हैं।\n{date}, {time} · {venue}",
      },
    ],
    tips: [
      "Open with an invocation like \"॥ श्री गणेशाय नमः ॥\" for a printed sagai card; drop it for a short WhatsApp message.",
      "Use \"सगाई\" for the ceremony in general, \"रिंग सेरेमनी\" if only rings are exchanged, and \"रोका\" or \"मंगनी\" if that's what your family calls it.",
      "Write the date in the format your relatives read easily, for example \"रविवार, 12 जनवरी\"; Hindi wording with English numerals is common and fine.",
      "Proofread the Devanagari carefully, especially matras and names, before printing; a typo stands out more to elders in Hindi.",
    ],
    faqs: [
      {
        q: "How do you write an engagement invitation in Hindi?",
        a: "Begin with a blessing, then name the couple and the ceremony (सगाई or रिंग सेरेमनी), followed by date, time and venue, and end with a request like \"सादर आमंत्रित हैं\" or \"पधारकर आशीर्वाद दें\".",
      },
      {
        q: "What is engagement called in Hindi?",
        a: "Engagement is usually called सगाई. Many families also say मंगनी, and रोका or tilak are separate pre-wedding rituals in some communities that may happen before the engagement.",
      },
      {
        q: "Can I mix Hindi and English on an engagement card?",
        a: "Yes. Many cards use Hindi for the invitation lines and English for the date, time and address, which works well for guests who read either.",
      },
    ],
    designs: ["chamelisagai", "vachan", "mudrika"],
  },

  // 6. Hindi, WhatsApp
  {
    slug: "engagement-invitation-message-in-hindi-for-whatsapp",
    fn: "engagement",
    lang: "hi",
    tone: "whatsapp",
    title: "Engagement invitation message in Hindi for WhatsApp",
    description:
      "Short engagement invitation messages in Hindi for WhatsApp: sagai and ring ceremony lines to forward to relatives and friends, with date, time and venue.",
    intro:
      "These short Hindi engagement messages are made for WhatsApp: a line or two you can send with the invite card or link. They use everyday Hindi that relatives forward easily, with one or two emojis at most. Pick a respectful one for family groups and a lighter one for friends.",
    wordings: [
      {
        label: "Quick invite",
        text: "{bride} और {groom} की सगाई है! 💍\n{date}, {time}, {venue}। ज़रूर आइए।",
      },
      {
        label: "For family groups",
        text: "सभी को सादर प्रणाम 🙏\n{bride} और {groom} की सगाई {date} को {venue} में है। आप सपरिवार पधारें।",
      },
      {
        label: "Save the date",
        text: "तारीख़ याद रखिए 💍\n{bride} ❤ {groom}\nसगाई: {date}",
      },
      {
        label: "With blessings",
        text: "बड़ों के आशीर्वाद से {bride} और {groom} की रिंग सेरेमनी {date} को {time} होगी। आपका आना हमारे लिए खास होगा।\n📍 {venue}",
      },
      {
        label: "One line",
        text: "{bride}-{groom} की सगाई, {date}, {time}, {venue}। आपका इंतज़ार रहेगा।",
      },
      {
        label: "Happy news",
        text: "खुशखबरी! 🎉 {bride} और {groom} का रोका पक्का हो गया है। {date} को {venue} में आकर आशीर्वाद दीजिए।",
      },
      {
        label: "With invite link",
        text: "हमारी सगाई का निमंत्रण 💌\n{bride} और {groom}, {date}\nपूरी जानकारी और लोकेशन के लिए लिंक खोलें।",
      },
      {
        label: "Reminder",
        text: "याद दिला दें, {bride} और {groom} की सगाई इसी {date} को {time} {venue} में है। मिलते हैं!",
      },
      {
        label: "Personal note",
        text: "आप के बिना ये खुशी अधूरी है। {bride} और {groom} की सगाई में {date} को ज़रूर आइए 🙏",
      },
      {
        label: "Status line",
        text: "दो अंगूठियाँ, एक वादा 💍\n{bride} & {groom}\n{date}",
      },
      {
        label: "Respectful and short",
        text: "आदरणीय, {bride} एवं {groom} की मंगनी {date} को {time} {venue} में है। पधारकर आशीर्वाद दें।",
      },
      {
        label: "RSVP request",
        text: "{bride} और {groom} की सगाई {date} को {venue} में है 💍 कृपया बताएँ कि आप आ पाएँगे, ताकि हम तैयारी कर सकें।",
      },
    ],
    tips: [
      "Use \"आप सपरिवार पधारें\" in family groups when the whole household is invited, and leave it out if you're inviting one person.",
      "Type the Hindi on your phone's Hindi keyboard or copy from here; some older phones show broken matras, so preview before sending.",
      "Keep the venue name in English or the way it appears on Google Maps, so guests can search it easily.",
      "For elders, send a respectful message (\"सादर प्रणाम\", \"पधारें\") and follow up with a call; save playful lines for cousins.",
    ],
    faqs: [
      {
        q: "How do I write a short sagai invite in Hindi for WhatsApp?",
        a: "Name the couple, the ceremony and the date in one or two lines, add the venue, and end with \"ज़रूर आइए\" or \"पधारकर आशीर्वाद दें\". Send it with the card or invite link.",
      },
      {
        q: "Should a Hindi WhatsApp invite use आप or तुम?",
        a: "Use आप for relatives, elders and anyone you're unsure about. तुम is fine only in a message to close friends or younger cousins.",
      },
      {
        q: "Can I send the same Hindi message to every group?",
        a: "You can, but it lands better to send a respectful version to family groups and a lighter one to friends, changing just the greeting and closing line.",
      },
    ],
    designs: ["chandni", "roka"],
  },

  // 7. Hindi, family
  {
    slug: "engagement-invitation-in-hindi-from-parents",
    fn: "engagement",
    lang: "hi",
    tone: "family",
    title: "Engagement invitation in Hindi from parents",
    description:
      "Engagement invitation in Hindi from parents: sagai, roka and tilak wording where the bride's or groom's family invites guests to bless their son or daughter.",
    intro:
      "This Hindi engagement invitation wording is written in the parents' voice, the way most sagai cards are sent by the family rather than the couple. There are options for the bride's side, the groom's side and both families together. Type the hosts' names in the Family box above, for example \"श्रीमती एवं श्री राजेश शर्मा\" or \"शर्मा परिवार\".",
    wordings: [
      {
        label: "Bride's parents",
        text: "॥ श्री गणेशाय नमः ॥\n{family}\nअपनी सुपुत्री {bride}\nकी सगाई\nचि. {groom} के साथ\n{date} को {time} {venue} में होना निश्चित हुई है।\nआप सपरिवार सादर आमंत्रित हैं।",
      },
      {
        label: "Groom's parents",
        text: "{family} हर्ष के साथ आपको अपने सुपुत्र चि. {groom} की सौ. का. {bride} के साथ होने वाली सगाई में आमंत्रित करते हैं।\nदिनांक: {date}, समय: {time}\nस्थान: {venue}",
      },
      {
        label: "Both families",
        text: "दोनों परिवारों की ओर से\nसादर निमंत्रण\n{bride} एवं {groom}\nशुभ सगाई समारोह\n{date} | {time}\n{venue}\nपधारकर नवयुगल को आशीर्वाद दें।",
      },
      {
        label: "Warm and personal",
        text: "हमारी बेटी {bride} की सगाई {groom} के साथ तय हुई है। इस खुशी में आप शामिल हों, यही हमारी इच्छा है।\n{family}\n{date}, {venue}",
      },
      {
        label: "Tilak",
        text: "{family} की ओर से सादर आमंत्रण।\nहमारे सुपुत्र {groom} का तिलक समारोह {date} को {time} {venue} में संपन्न होगा, जिनका शुभ विवाह {bride} के साथ तय हुआ है।\nआपकी उपस्थिति प्रार्थनीय है।",
      },
      {
        label: "Roka",
        text: "प्रभु कृपा से {groom} और {bride} का रोका {date} को {venue} में होगा।\nआप पधारकर बच्चों को आशीर्वाद दें।\nनिवेदक: {family}",
      },
      {
        label: "Grandparents' blessings",
        text: "दादा-दादी एवं नाना-नानी के आशीर्वाद से\n{family}\nआपको {bride} एवं {groom} की रिंग सेरेमनी में\n{date} को {time}\n{venue} में सादर आमंत्रित करता है।",
      },
      {
        label: "Short from family",
        text: "{family} की ओर से {bride} एवं {groom} की सगाई में आपको सप्रेम निमंत्रण।\n{date}, {venue}",
      },
      {
        label: "With nivedak",
        text: "शुभ सगाई\n{bride} संग {groom}\nदिनांक: {date}\nसमय: {time}\nस्थान: {venue}\nदर्शनाभिलाषी: {family}",
      },
      {
        label: "Mangni with bhoj",
        text: "{family} सहर्ष सूचित करते हैं कि {bride} एवं {groom} की मंगनी {date} को {time} {venue} में होगी।\nकार्यक्रम के बाद भोजन की व्यवस्था है। कृपया अवश्य पधारें।",
      },
      {
        label: "From mother and father",
        text: "माता-पिता के लिए इससे बड़ी खुशी क्या होगी।\n{bride} और {groom} की सगाई के अवसर पर आपका साथ और आशीर्वाद चाहते हैं।\n{date}, {time}, {venue}\n{family}",
      },
      {
        label: "Simple and formal",
        text: "{family}\nसविनय निवेदन करते हैं कि\n{bride} एवं {groom} के सगाई समारोह में\nपधारकर समारोह की शोभा बढ़ाएँ।\n{date} · {time} · {venue}",
      },
    ],
    tips: [
      "Use honorifics the way your family does: \"चि.\" (चिरंजीव) before the groom's name and \"सौ. का.\" (सौभाग्यकांक्षिणी) before the bride's are common on formal cards.",
      "Write \"निवेदक\" or \"दर्शनाभिलाषी\" followed by the family names at the end, the way many printed Hindi cards close.",
      "If the tilak or roka is hosted by only one side, invite in that family's name and say whose home or venue it is.",
      "Write the hosts' names in Devanagari on Hindi cards, for example \"श्रीमती एवं श्री सुरेश गुप्ता\", instead of mixing in English names.",
    ],
    faqs: [
      {
        q: "What does निवेदक or दर्शनाभिलाषी mean on a Hindi card?",
        a: "निवेदक means \"the one making the request\", and दर्शनाभिलाषी means \"eager to see you\". Both introduce the family members who are inviting, usually listed at the bottom of the card.",
      },
      {
        q: "What do चि. and सौ. का. mean before the couple's names?",
        a: "चि. stands for चिरंजीव, a blessing used before the groom's name, and सौ. का. for सौभाग्यकांक्षिणी, used before an unmarried bride's name. They are traditional and optional.",
      },
      {
        q: "Which family's name goes on a Hindi engagement invitation?",
        a: "The hosting family's name goes on the card. If both families host together, write \"दोनों परिवारों की ओर से\" or list both, usually with the host side first.",
      },
      {
        q: "Is tilak the same as an engagement?",
        a: "Not exactly. In many North Indian families the tilak is a ceremony where the bride's family visits the groom's home to bless him, separate from the sagai or ring ceremony, though some families combine them.",
      },
    ],
    designs: ["chamelisagai", "vachan", "roka"],
  },

  // 8. Hindi, fun
  {
    slug: "funny-engagement-invitation-message-in-hindi",
    fn: "engagement",
    lang: "hi",
    tone: "fun",
    title: "Funny engagement invitation messages in Hindi",
    description:
      "Funny engagement invitation messages in Hindi for friends and cousins: playful sagai lines about rings, relatives and the party, with date, time and venue.",
    intro:
      "These funny Hindi engagement messages are for friends, cousins and anyone who'd enjoy a light-hearted invite. The jokes are about rishtas, relatives and finally getting the ring on, all family-friendly. Send these to your friends' groups and keep a respectful version for elders.",
    wordings: [
      {
        label: "Rishta pakka",
        text: "रिश्ता पक्का! 💍\nअब कोई नहीं पूछेगा \"शादी कब कर रहे हो?\"\n{bride} और {groom} की सगाई, {date}, {venue}।",
      },
      {
        label: "Breaking news",
        text: "ब्रेकिंग न्यूज़ 📢\n{groom} को आखिरकार कोई मिल गई, और {bride} ने हाँ भी कह दी!\nसगाई: {date}, {time}\nस्थान: {venue}",
      },
      {
        label: "Aunties' wish",
        text: "मोहल्ले की सभी आंटियों की दुआ कबूल हुई 😄\n{bride} & {groom} की सगाई है।\n{date} | {time} | {venue}",
      },
      {
        label: "Terms and conditions",
        text: "{bride} और {groom} की सगाई में आपको आना है।\nशर्तें लागू:\n1. अच्छे कपड़े पहनकर आएँ, फ़ोटो खिंचेंगी।\n2. भूखे आएँ, खाना बहुत है।\n3. नाचना पड़ेगा, बहाने नहीं चलेंगे।\n{date}, {venue}",
      },
      {
        label: "Short and cheeky",
        text: "उसने हाँ कहा, इसने राहत की साँस ली 😅\n{bride} ❤ {groom} की सगाई, {date}।",
      },
      {
        label: "Single no more",
        text: "सिंगल लोगों के ग्रुप से दो सदस्य कम हो रहे हैं।\nविदाई पार्टी, यानी {bride} और {groom} की सगाई,\n{date} को {time}, {venue} में।",
      },
      {
        label: "Attendance compulsory",
        text: "सूचना 📢\n{bride} और {groom} की रिंग सेरेमनी में हाज़िरी ज़रूरी है।\nगैरहाज़िर रहने वालों को शादी में डबल नाचना पड़ेगा।\n{date}, {venue}",
      },
      {
        label: "Food first",
        text: "अंगूठी उनकी, खाना आपका 🍽️\n{bride} और {groom} की सगाई में {date} को {venue} ज़रूर आइए।",
      },
      {
        label: "Trailer",
        text: "शादी की पिक्चर अभी बाकी है, ये तो बस ट्रेलर है 🎬\n{bride} & {groom} की सगाई\n{date} · {time} · {venue}",
      },
      {
        label: "Mummy approved",
        text: "मम्मी ने पास कर दिया, पापा ने हाँ कर दी,\nअब बस आपका आना बाकी है।\n{bride} और {groom} की सगाई, {date}, {venue}।",
      },
      {
        label: "Chat group style",
        text: "ग्रुप में सब ध्यान दें 🙌\n{bride} और {groom} की मंगनी {date} को है।\nबहाने बनाने वालों की लिस्ट बन रही है। 📍 {venue}",
      },
      {
        label: "Finally",
        text: "आख़िरकार! 🎉\nसालों के \"बस दोस्त हैं\" के बाद {bride} और {groom} की सगाई हो रही है।\n{date}, {time}, {venue} में मिलिए।",
      },
    ],
    tips: [
      "Check that the joke suits both families; a line about \"finally finding someone\" works only if the couple is happy with it.",
      "Avoid jokes about dowry, looks, weight or either family; they read very differently once forwarded to relatives.",
      "Send the funny Hindi version in friends' and cousins' groups, and the traditional sagai wording to elders.",
      "Keep at least the date and venue in every message, so the invite still works if someone forwards only the text.",
    ],
    faqs: [
      {
        q: "Is it okay to send a funny sagai invitation to relatives?",
        a: "To cousins and close relatives who enjoy a joke, yes. For elders and the other family's relatives, a traditional Hindi message is safer.",
      },
      {
        q: "What kind of humour works for a Hindi engagement invite?",
        a: "Gentle, shared jokes work best: \"शादी कब?\" questions, aunties, food and dancing. Avoid anything that teases one partner or family more than the other.",
      },
      {
        q: "Can I use Hinglish instead of pure Hindi?",
        a: "Yes. Words like सगाई, रिंग सेरेमनी, पार्टी and ब्रेकिंग न्यूज़ mix naturally, and most friends' groups write that way anyway.",
      },
    ],
    designs: ["chandni", "angoothi", "roka"],
  },
];
