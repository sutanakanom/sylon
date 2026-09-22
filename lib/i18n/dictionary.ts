// ---------------------------------------------------------------------
// SYLON's English/Thai dictionary — the ONE file to edit if you want to
// change any word or phrase on the site, in either language.
//
// HOW TO EDIT A TRANSLATION
//   Find the key (e.g. "nav.addPlan") and change the "th" (or "en")
//   string. Save, rebuild, done — no other file needs to change.
//
// HOW TO ADD A NEW STRING
//   1. Pick a namespace below that matches the page/component it's on
//      (or add a new namespace if nothing fits).
//   2. Add `myKey: { en: "...", th: "..." }`.
//   3. In the component, call `t(locale, "namespace.myKey")`.
//   Missing keys render as the literal path (e.g. "nav.myKey") instead
//   of crashing, so a typo'd key is easy to spot on the page.
//
// COUNTS ("3 votes" / "3 โหวต")
//   Thai doesn't inflect for plural, so counted phrases don't live in
//   this dictionary as plain strings — use the `tn()` helper below
//   instead, e.g. tn(locale, count, { one: "vote", other: "votes" }, "โหวต").
//
// WHAT'S NOT TRANSLATED YET (see docs/I18N.md for the full list + why)
//   - /admin (internal tool, English only by design)
//   - Text baked into the generated IG-Story PNG images (lib/story-canvas.ts)
// ---------------------------------------------------------------------

export type Locale = "en" | "th";

export const DEFAULT_LOCALE: Locale = "en";

type Phrase = { en: string; th: string };

function dict<T extends Record<string, Phrase | Record<string, Phrase>>>(value: T): T {
  return value;
}

export const dictionary = {
  common: dict({
    signIn: { en: "Sign in", th: "เข้าสู่ระบบ" },
    signOut: { en: "Sign out", th: "ออกจากระบบ" },
    cancel: { en: "Cancel", th: "ยกเลิก" },
    remove: { en: "Remove", th: "ลบ" },
    add: { en: "Add", th: "เพิ่ม" },
    save: { en: "Save", th: "บันทึก" },
    saving: { en: "Saving…", th: "กำลังบันทึก…" },
    saved: { en: "Saved.", th: "บันทึกแล้ว" },
    post: { en: "Post", th: "โพสต์" },
    public: { en: "Public", th: "สาธารณะ" },
    inviteOnly: { en: "Invite-only", th: "เฉพาะผู้ได้รับเชิญ" },
    optional: { en: "optional", th: "ไม่บังคับ" },
    commaSeparated: { en: "Comma-separated.", th: "คั่นด้วยจุลภาค (,)" },
    signInToContinue: { en: "Sign in", th: "เข้าสู่ระบบ" },
    trip: { en: "Trip", th: "ทริป" },
    manifest: { en: "Manifest", th: "แมนิเฟสต์" },
    follow: { en: "Follow", th: "ติดตาม" },
    following: { en: "Following", th: "ติดตามอยู่" },
    signInToFollow: { en: "Sign in to follow", th: "เข้าสู่ระบบเพื่อติดตาม" },
  }),

  nav: dict({
    addPlan: { en: "+ Add a plan", th: "+ เพิ่มแผน" },
    admin: { en: "Admin", th: "ผู้ดูแลระบบ" },
    signOut: { en: "Sign out", th: "ออกจากระบบ" },
    signInCta: { en: "What is our password?", th: "รหัสผ่านของเราคืออะไร?" },
    defaultCenter: { en: "See you later — or not.", th: "แล้วเจอกัน — หรือไม่เจอ" },
    langEn: { en: "EN", th: "EN" },
    langTh: { en: "TH", th: "ไทย" },
  }),

  footer: dict({
    defaultMeta: { en: "See you later (or not)", th: "แล้วเจอกัน (หรือไม่เจอ)" },
  }),

  status: {
    trip: dict({
      planning: { en: "Maybe See You", th: "อาจได้เจอกัน" },
      confirmed: { en: "See You", th: "เจอกันแน่" },
      completed: { en: "Saw You", th: "เจอกันแล้ว" },
      cancelled: { en: "Cancelled", th: "ยกเลิกแล้ว" },
    }),
    manifest: dict({
      open: { en: "Manifesting", th: "กำลังสร้างฝัน" },
      converted: { en: "Became a Trip", th: "กลายเป็นทริปแล้ว" },
      dropped: { en: "Not Manifesting", th: "เลิกสร้างฝัน" },
    }),
  },

  landing: dict({
    kicker: { en: "See you later — or not", th: "แล้วเจอกัน — หรือไม่เจอ" },
    titleLine1: { en: "See you", th: "แล้วเจอกัน" },
    titleLine2: { en: "somewhere.", th: "ที่ไหนสักแห่ง" },
    intro: {
      en: "A place for sharing the trips you're actually planning — and the ones that are still just a maybe.",
      th: "พื้นที่สำหรับแชร์ทริปที่กำลังวางแผนจริงจัง — และทริปที่ยังเป็นแค่ \"อาจจะ\"",
    },
    seeKanomsPlans: { en: "See Kanom's plans ↗", th: "ดูแผนของ Kanom ↗" },
    signUp: { en: "Sign up", th: "สมัครสมาชิก" },
    firstStop: { en: "First stop", th: "จุดแรก" },
    passportCopy: {
      en: "Kanom's the only host here so far — more may join later.",
      th: "ตอนนี้มี Kanom เป็นเจ้าของหน้าคนเดียว — อาจมีคนอื่นเข้าร่วมทีหลัง",
    },
    bangkokBased: { en: "Bangkok based", th: "อยู่ที่กรุงเทพฯ" },
    since2026: { en: "Since 2026", th: "ตั้งแต่ปี 2026" },
    manifestoLabel: { en: "A note from\nfuture us", th: "ข้อความจาก\nตัวเราในอนาคต" },
    manifestoBody: {
      en: "Not every plan is a promise. Some are just a place we haven't been yet — and an open invitation.",
      th: "ไม่ใช่ทุกแผนจะเป็นคำสัญญา บางแผนก็แค่เป็นที่ที่เรายังไม่เคยไป — และคำเชิญที่เปิดกว้าง",
    },
  }),

  personalPage: dict({
    upcomingTrips: { en: "{name}'s upcoming trips", th: "ทริปที่กำลังจะมาของ {name}" },
    titleLine1: { en: "Where I'm", th: "ที่ที่ฉันกำลัง" },
    titleLine2: { en: "going next.", th: "จะไปต่อไป" },
    introBody: {
      en: "Booked trips, possible detours, and the plans {name} is still trying to manifest.",
      th: "ทริปที่จองแล้ว ทางเลี่ยงที่เป็นไปได้ และแผนที่ {name} ยังพยายามสร้างฝันให้เป็นจริง",
    },
    captureShare: { en: "Capture or share this on story ↗", th: "บันทึกหรือแชร์ลงสตอรี่ ↗" },
    captureHintDesktop: { en: "Capture this card or send the link to a friend.", th: "บันทึกการ์ดนี้ หรือส่งลิงก์ให้เพื่อน" },
    captureHintMobile: { en: "Swipe above to choose what your friend will see.", th: "ปัดด้านบนเพื่อเลือกสิ่งที่เพื่อนจะเห็น" },
    futureAtlas: { en: "{name}'s future atlas", th: "แผนที่อนาคตของ {name}" },
    tripsAreOne: { en: "trip is", th: "ทริป" },
    tripsAreMany: { en: "trips are", th: "ทริป" },
    waiting: { en: "waiting.", th: "กำลังรออยู่" },
    swipeHint: { en: "Swipe to choose a card", th: "ปัดเพื่อเลือกการ์ด" },
    summaryCard: { en: "Summary card", th: "การ์ดสรุป" },
    theWholePlan: { en: "The whole plan.", th: "แผนทั้งหมด" },
    boardSubtitle: {
      en: "One screen, every maybe. Made to save, send, or drop into an IG Story.",
      th: "หน้าจอเดียว รวมทุก \"อาจจะ\" บันทึก ส่งต่อ หรือใส่ลง IG Story ได้เลย",
    },
    nothingPublicYet: { en: "Nothing public yet — check back soon.", th: "ยังไม่มีแผนสาธารณะ — กลับมาดูใหม่เร็ว ๆ นี้" },
    actuallyHappening: { en: "Actually happening", th: "กำลังเกิดขึ้นจริง" },
    notDecidedYet: { en: "Not decided yet, loudly hoped for", th: "ยังไม่ตัดสินใจ แต่หวังไว้ดัง ๆ" },
    noTripsYet: { en: "No trips confirmed yet.", th: "ยังไม่มีทริปที่ยืนยันแล้ว" },
    noManifestsYet: { en: "No manifests yet.", th: "ยังไม่มีแมนิเฟสต์" },
    departures: { en: "{name}'s departures", th: "เที่ยวบินของ {name}" },
    bangkokWherever: { en: "Bangkok → wherever", th: "กรุงเทพฯ → ที่ไหนก็ได้" },
    addPlan: { en: "+ Add a plan", th: "+ เพิ่มแผน" },
    addPlanQuestion: { en: "Something else on your mind?", th: "มีแผนอื่นในใจอีกไหม?" },
    addPlanCta: { en: "Trip or manifest ↗", th: "ทริปหรือแมนิเฟสต์ ↗" },
    requestInvite: { en: "+ Request an invite", th: "+ ขอคำเชิญ" },
    requestInviteQuestion: { en: "Curious about the quiet plans?", th: "อยากรู้เกี่ยวกับแผนลับไหม?" },
    requestInviteCta: { en: "Ask {name} ↗", th: "ถาม {name} ↗" },
    boardSignoffTagline: { en: "SYLON — See you later (or not)", th: "SYLON — แล้วเจอกัน (หรือไม่เจอ)" },
    storyNote: { en: "The whole plan · 1080 × 1920", th: "แผนทั้งหมด · 1080 × 1920" },
    inviteDialogTitle: { en: "Invitation request", th: "คำขอคำเชิญ" },
    close: { en: "Close", th: "ปิด" },
    inviteHeading: { en: "Maybe together?", th: "ไปด้วยกันไหม?" },
    yourName: { en: "Your name", th: "ชื่อของคุณ" },
    yourNamePlaceholder: { en: "The person {name} knows", th: "ชื่อที่ {name} รู้จัก" },
    yourEmail: { en: "Your email", th: "อีเมลของคุณ" },
    whichPlan: { en: "Which plan brought you here?", th: "แผนไหนที่พาคุณมาที่นี่?" },
    reasonCurious: { en: "Just curious", th: "แค่อยากรู้" },
    reasonJoin: { en: "I want to join a trip", th: "อยากเข้าร่วมทริป" },
    reasonIdea: { en: "I have a better idea", th: "ฉันมีไอเดียที่ดีกว่า" },
    sending: { en: "Sending…", th: "กำลังส่ง…" },
    sendSignal: { en: "Send the signal", th: "ส่งสัญญาณ" },
    signalSentToast: { en: "Signal sent — maybe see you there", th: "ส่งสัญญาณแล้ว — เดี๋ยวเจอกันนะ" },
    generateStory: { en: "Generate IG Story", th: "สร้างภาพ IG Story" },
    creatingStory: { en: "Creating your story…", th: "กำลังสร้างสตอรี่…" },
    manifestoNoFrom: { en: "A note from future {name}", th: "ข้อความจาก {name} ในอนาคต" },
    manifestoNo01: { en: "No. 01", th: "ฉบับที่ 01" },
    manifestoBody: {
      en: "Not every plan is a promise. Some are just a place we haven't been yet — and an open invitation.",
      th: "ไม่ใช่ทุกแผนจะเป็นคำสัญญา บางแผนก็แค่เป็นที่ที่เรายังไม่เคยไป — และคำเชิญที่เปิดกว้าง",
    },
  }),

  share: dict({
    makingCard: { en: "Making card…", th: "กำลังสร้างการ์ด…" },
    storyDownloaded: { en: "Story image downloaded", th: "บันทึกภาพสตอรี่แล้ว" },
    couldNotCreate: { en: "Could not create the image — please try again", th: "สร้างภาพไม่สำเร็จ — ลองใหม่อีกครั้ง" },
    shareToStory: { en: "Share to IG Story ↗", th: "แชร์ลง IG Story ↗" },
    savedOpenInstagram: {
      en: "Saved — open Instagram and add it to your Story.",
      th: "บันทึกแล้ว — เปิด Instagram แล้วเพิ่มลงสตอรี่ของคุณ",
    },
    couldNotCreateTryAgain: { en: "Couldn't create the image — try again.", th: "สร้างภาพไม่สำเร็จ — ลองใหม่อีกครั้ง" },
  }),

  signIn: dict({
    title: { en: "Sign in", th: "เข้าสู่ระบบ" },
    subtitle: { en: "No password. We'll email you a one-time code.", th: "ไม่ต้องใช้รหัสผ่าน เราจะส่งรหัสครั้งเดียวไปทางอีเมล" },
    yourEmail: { en: "Your email", th: "อีเมลของคุณ" },
    sendCode: { en: "Send me a code", th: "ส่งรหัสให้ฉัน" },
    sending: { en: "Sending…", th: "กำลังส่ง…" },
    newHereHint: {
      en: "New here? The same code creates your account. Returning? It just signs you in.",
      th: "มาครั้งแรกใช่ไหม? รหัสเดียวกันนี้จะสร้างบัญชีให้คุณ กลับมาอีกครั้ง? มันจะพาคุณเข้าสู่ระบบเลย",
    },
    weSentCodeTo: { en: "We sent a code to", th: "เราส่งรหัสไปที่" },
    codeLabel: { en: "6-character code", th: "รหัส 6 ตัวอักษร" },
    checking: { en: "Checking…", th: "กำลังตรวจสอบ…" },
    seeYou: { en: "See you →", th: "แล้วเจอกัน →" },
    useDifferentEmail: { en: "Use a different email", th: "ใช้อีเมลอื่น" },
  }),

  signUp: dict({
    title: { en: "Sign up", th: "สมัครสมาชิก" },
    subtitle: {
      en: "Leave your email — Kanom reviews every request personally before an account is created.",
      th: "ฝากอีเมลไว้ — Kanom จะตรวจสอบทุกคำขอด้วยตัวเองก่อนสร้างบัญชีให้คุณ",
    },
    yourEmail: { en: "Your email", th: "อีเมลของคุณ" },
    submit: { en: "Request access", th: "ขอสิทธิ์เข้าใช้งาน" },
    sending: { en: "Sending…", th: "กำลังส่ง…" },
    successTitle: { en: "Signal sent.", th: "ส่งสัญญาณแล้ว" },
    successBody: {
      en: "Kanom will review your request and follow up by email if it's a match.",
      th: "Kanom จะตรวจสอบคำขอของคุณ และจะติดต่อกลับทางอีเมลหากเหมาะสม",
    },
    alreadyHaveCode: { en: "Already have a code?", th: "มีรหัสอยู่แล้วใช่ไหม?" },
    signInLink: { en: "Sign in →", th: "เข้าสู่ระบบ →" },
  }),

  profile: dict({
    centerLabel: { en: "Your profile", th: "โปรไฟล์ของคุณ" },
    title: { en: "Profile", th: "โปรไฟล์" },
    subtitle: { en: "Shown on your page and next to your comments — never your email.", th: "แสดงบนหน้าของคุณและข้างคอมเมนต์ — ไม่แสดงอีเมลของคุณ" },
    avatarPhoto: { en: "Avatar photo (max 2MB)", th: "รูปโปรไฟล์ (สูงสุด 2MB)" },
    displayName: { en: "Display name", th: "ชื่อที่แสดง" },
    instagramHandle: { en: "Instagram handle", th: "ยูสเซอร์เนม Instagram" },
    saveProfile: { en: "Save profile", th: "บันทึกโปรไฟล์" },
    saving: { en: "Saving…", th: "กำลังบันทึก…" },
    saved: { en: "Saved.", th: "บันทึกแล้ว" },
  }),

  newItem: dict({
    centerLabel: { en: "New plan", th: "แผนใหม่" },
    title: { en: "Add a plan", th: "เพิ่มแผน" },
    subtitle: {
      en: "A Trip is a real, dated plan. A Manifest is still just an idea people can vote on.",
      th: "ทริปคือแผนจริงที่มีวันที่แน่นอน ส่วนแมนิเฟสต์ยังเป็นแค่ไอเดียที่ให้คนโหวตได้",
    },
    kindTrip: { en: "Trip", th: "ทริป" },
    kindManifest: { en: "Manifest", th: "แมนิเฟสต์" },
    titleField: { en: "Title", th: "ชื่อเรื่อง" },
    titlePlaceholderTrip: { en: "Osaka in the fall", th: "โอซาก้าหน้าใบไม้ร่วง" },
    titlePlaceholderManifest: { en: "Somewhere warm in Feb?", th: "ที่ไหนอุ่น ๆ ในเดือนกุมภาฯ?" },
    roughDate: { en: "Rough date", th: "ช่วงเวลาคร่าว ๆ" },
    roughDatePlaceholder: { en: "Late Nov – early Dec", th: "ปลายเดือนพ.ย. – ต้นเดือนธ.ค." },
    countriesTrip: { en: "Countries", th: "ประเทศ" },
    countriesManifest: { en: "Country options people can vote on", th: "ตัวเลือกประเทศให้คนโหวต" },
    countriesPlaceholder: { en: "Japan, South Korea", th: "ญี่ปุ่น, เกาหลีใต้" },
    summary: { en: "Summary", th: "รายละเอียดโดยสรุป" },
    summaryPlaceholder: { en: "What's the idea?", th: "ไอเดียคืออะไร?" },
    calendar: { en: "Calendar", th: "ปฏิทิน" },
    place: { en: "Place", th: "สถานที่" },
    addLeg: { en: "+ Add a leg", th: "+ เพิ่มช่วงการเดินทาง" },
    goingWith: { en: "Going with", th: "ไปกับใคร" },
    goingWithPlaceholder: { en: "Mum (optional)", th: "แม่ (ไม่บังคับ)" },
    mainEvent: { en: "Main event", th: "กิจกรรมหลัก" },
    mainEventPlaceholder: { en: "Disneyland 10K (optional)", th: "วิ่ง Disneyland 10K (ไม่บังคับ)" },
    readyMeter: { en: "Ready meter (0–100, optional)", th: "มิเตอร์ความพร้อม (0–100, ไม่บังคับ)" },
    checklist: { en: "Before-we-go checklist (optional)", th: "เช็กลิสต์ก่อนไป (ไม่บังคับ)" },
    checklistPlaceholder: { en: "Hotel near MTR", th: "โรงแรมใกล้ MTR" },
    purpose: { en: "Purpose (optional)", th: "จุดประสงค์ (ไม่บังคับ)" },
    purposePlaceholder: { en: "Radiohead concert", th: "คอนเสิร์ต Radiohead" },
    purposeHint: {
      en: "The one thing that's already certain — shown as \"Known\" on the page.",
      th: "สิ่งเดียวที่แน่นอนอยู่แล้ว — จะแสดงเป็น \"รู้แล้ว\" บนหน้าเพจ",
    },
    realityFund: { en: "Reality fund (0–100, optional)", th: "กองทุนความจริง (0–100, ไม่บังคับ)" },
    signsOfLife: { en: "Signs of life (optional)", th: "สัญญาณความเป็นไปได้ (ไม่บังคับ)" },
    signalTitlePlaceholder: { en: "The tour exists", th: "ทัวร์มีจริง" },
    signalBodyPlaceholder: {
      en: "Any 2027 announcement moves this from delusional to possible.",
      th: "ถ้ามีประกาศปี 2027 เรื่องนี้จะเปลี่ยนจากเพ้อฝันเป็นเป็นไปได้",
    },
    addSignal: { en: "+ Add a signal", th: "+ เพิ่มสัญญาณ" },
    noteTrip: { en: "Trip note (optional)", th: "โน้ตทริป (ไม่บังคับ)" },
    noteManifest: { en: "Manifest note (optional)", th: "โน้ตแมนิเฟสต์ (ไม่บังคับ)" },
    notePlaceholder: { en: "A little quote for the side card", th: "คำคมเล็ก ๆ สำหรับการ์ดข้าง" },
    attributedTo: { en: "— attributed to", th: "— โดย" },
    attributedToPlaceholder: { en: "Future you", th: "ตัวคุณในอนาคต" },
    visibility: { en: "Visibility", th: "การมองเห็น" },
    status: { en: "Status", th: "สถานะ" },
    statusPlanning: { en: "Planning", th: "กำลังวางแผน" },
    statusConfirmed: { en: "Confirmed", th: "ยืนยันแล้ว" },
    publishing: { en: "Publishing…", th: "กำลังเผยแพร่…" },
    publishTrip: { en: "Publish trip", th: "เผยแพร่ทริป" },
    publishManifest: { en: "Publish manifest", th: "เผยแพร่แมนิเฟสต์" },
  }),

  tripDetail: dict({
    invitedOnly: { en: "Invite-only", th: "เฉพาะผู้ได้รับเชิญ" },
    privateTitle: { en: "This one's private", th: "อันนี้เป็นส่วนตัว" },
    privateBody: {
      en: "Ask whoever shared this link with you for an invite, then sign in.",
      th: "ลองขอคำเชิญจากคนที่ส่งลิงก์นี้ให้คุณ แล้วเข้าสู่ระบบ",
    },
    plansOf: { en: "{name}'s plans", th: "แผนของ {name}" },
    tripSuffix: { en: "trip", th: "ทริป" },
    date: { en: "Date", th: "วันที่" },
    location: { en: "Location", th: "สถานที่" },
    somewhere: { en: "Somewhere", th: "ที่ไหนสักแห่ง" },
    mainEvent: { en: "Main event", th: "กิจกรรมหลัก" },
    goingWith: { en: "Going with", th: "ไปกับใคร" },
    beTheFirst: { en: "Be the first", th: "เป็นคนแรกเลย" },
    becameARealTrip: { en: "This became a real trip —", th: "เรื่องนี้กลายเป็นทริปจริงแล้ว —" },
    seeItHere: { en: "see it here", th: "ดูที่นี่" },
    theRoute: { en: "The route", th: "เส้นทาง" },
    thePlan: { en: "The plan.", th: "แผนการ" },
    noDatesYet: { en: "No dates locked in yet.", th: "ยังไม่มีวันที่แน่นอน" },
    readyMeter: { en: "Ready meter", th: "มิเตอร์ความพร้อม" },
    mostlySorted: { en: "Mostly sorted.", th: "จัดการเรียบร้อยแล้วเป็นส่วนใหญ่" },
    mostlyRealSlightlyChaotic: { en: "Mostly real. Slightly chaotic.", th: "เป็นจริงเป็นส่วนใหญ่ ยุ่งเหยิงนิดหน่อย" },
    stillADream: { en: "Still very much a dream.", th: "ยังคงเป็นความฝันอยู่มาก" },
    sortedFutureProblem: {
      en: "{sorted}% sorted · {left}% future {name}'s problem",
      th: "จัดการแล้ว {sorted}% · เหลืออีก {left}% เป็นปัญหาของ {name} ในอนาคต",
    },
    beforeWeGo: { en: "Before we go", th: "ก่อนไป" },
    usefulList: { en: "The useful list.", th: "ลิสต์ที่มีประโยชน์" },
    tripNote: { en: "Trip note", th: "โน้ตทริป" },
    members: { en: "Members", th: "สมาชิก" },
    nobodyJoinedYet: { en: "Nobody's joined yet — be the first.", th: "ยังไม่มีใครเข้าร่วม — เป็นคนแรกเลยสิ" },
    joinThisTrip: { en: "Join this trip", th: "เข้าร่วมทริปนี้" },
    youreIn: { en: "You're in", th: "เข้าร่วมแล้ว" },
    signInToJoin: { en: "Sign in to join", th: "เข้าสู่ระบบเพื่อเข้าร่วม" },
    joining: { en: "Joining…", th: "กำลังเข้าร่วม…" },
    aCoupleQuestions: { en: "A couple of questions", th: "คำถามสั้น ๆ สักสองข้อ" },
    comments: { en: "Comments", th: "คอมเมนต์" },
  }),

  survey: dict({
    areYouIn: { en: "Are you in?", th: "คุณไปด้วยไหม?" },
    optionIn: { en: "in", th: "ไป" },
    optionMaybe: { en: "maybe", th: "อาจจะ" },
    optionOut: { en: "out", th: "ไม่ไป" },
    dateConflicts: { en: "Any date conflicts we should know about?", th: "มีวันที่ติดธุระที่ควรรู้ไว้ไหม?" },
    needsFromGroup: {
      en: "Anything you need from the group? (budget, visa, etc.)",
      th: "มีอะไรที่ต้องการจากกลุ่มไหม? (งบประมาณ, วีซ่า ฯลฯ)",
    },
    saveAnswers: { en: "Save answers", th: "บันทึกคำตอบ" },
    saving: { en: "Saving…", th: "กำลังบันทึก…" },
    saved: { en: "Saved.", th: "บันทึกแล้ว" },
  }),

  comments: dict({
    signInToJoin: { en: "Sign in", th: "เข้าสู่ระบบ" },
    signInToSeeAndJoin: { en: "to see and join the conversation.", th: "เพื่อดูและร่วมพูดคุย" },
    noneYet: { en: "No comments yet — say something.", th: "ยังไม่มีคอมเมนต์ — พูดอะไรสักอย่างสิ" },
    placeholder: { en: "Add a comment…", th: "เพิ่มคอมเมนต์…" },
    post: { en: "Post", th: "โพสต์" },
  }),

  manifestDetail: dict({
    edit: { en: "Edit", th: "แก้ไข" },
    manifestingGatheringIdeas: { en: "Gathering ideas", th: "กำลังรวบรวมไอเดีย" },
    manifestingJustPosted: { en: "Just posted", th: "เพิ่งโพสต์" },
    manifesting: { en: "Manifesting", th: "กำลังสร้างฝัน" },
    manifestWithMe: { en: "Manifest with me +", th: "ร่วมสร้างฝันกับฉัน +" },
    youreManifestingThis: { en: "You're manifesting this", th: "คุณกำลังร่วมสร้างฝันนี้" },
    followThisIdea: { en: "Follow this idea", th: "ติดตามไอเดียนี้" },
    followingThisIdea: { en: "Following this idea", th: "ติดตามอยู่" },
    interested: { en: "interested", th: "คนสนใจ" },
    following: { en: "following", th: "คนติดตาม" },
    whatWeKnow: { en: "What we know", th: "สิ่งที่เรารู้แล้ว" },
    anchorsSuffix: { en: "anchors", th: "หมุด" },
    purpose: { en: "Purpose", th: "จุดประสงค์" },
    notSetYet: { en: "Not set yet", th: "ยังไม่ได้กำหนด" },
    roughTiming: { en: "Rough timing", th: "ช่วงเวลาคร่าว ๆ" },
    location: { en: "Location", th: "สถานที่" },
    leading: { en: "leading", th: "นำอยู่" },
    open: { en: "Open", th: "ยังไม่กำหนด" },
    exactDates: { en: "Exact dates", th: "วันที่แน่นอน" },
    waitingToBeDecided: { en: "Waiting to be decided", th: "รอการตัดสินใจ" },
    tagKnown: { en: "Known", th: "รู้แล้ว" },
    tagRough: { en: "Rough", th: "คร่าว ๆ" },
    tagOpen: { en: "Open", th: "ยังไม่กำหนด" },
    becameARealTrip: { en: "This became a real trip —", th: "เรื่องนี้กลายเป็นทริปจริงแล้ว —" },
    seeItHere: { en: "see it here", th: "ดูที่นี่" },
    shapeThePossibility: { en: "Shape the possibility", th: "ช่วยกำหนดความเป็นไปได้" },
    whatShouldWeDecideLine1: { en: "What should", th: "เราควรตัดสินใจ" },
    whatShouldWeDecideLine2: { en: "we decide?", th: "เรื่องอะไรกันดี?" },
    signalsNotCommitments: {
      en: "Your answers are signals, not commitments. {name} will summarize the strongest direction before anything becomes final.",
      th: "คำตอบของคุณเป็นแค่สัญญาณ ไม่ใช่คำมั่นสัญญา {name} จะสรุปทิศทางที่ชัดเจนที่สุดก่อนที่ทุกอย่างจะถูกตัดสิน",
    },
    openQuestionVote: { en: "Open question · Vote", th: "คำถามเปิด · โหวต" },
    whereShouldItHappen: { en: "Where should it happen?", th: "ควรจัดที่ไหนดี?" },
    noLocationOptions: { en: "No location options yet.", th: "ยังไม่มีตัวเลือกสถานที่" },
    openQuestionAvailability: { en: "Open question · Availability", th: "คำถามเปิด · ช่วงเวลาว่าง" },
    whenCouldYouGo: { en: "When could you go?", th: "คุณว่างช่วงไหน?" },
    noWindowsYet: { en: "No windows set yet — ask the host to add some.", th: "ยังไม่มีการกำหนดช่วงเวลา — ลองขอให้เจ้าของเพิ่มดู" },
    signInToAnswer: { en: "Sign in to answer", th: "เข้าสู่ระบบเพื่อตอบ" },
    saveAvailability: { en: "Save availability", th: "บันทึกช่วงเวลาว่าง" },
    brainstorm: { en: "Brainstorm", th: "ระดมไอเดีย" },
    whatWouldMakeThisWorthIt: { en: "What would make this worth the trip?", th: "อะไรจะทำให้ทริปนี้คุ้มค่า?" },
    noIdeasYet: { en: "No ideas yet — drop the first one.", th: "ยังไม่มีไอเดีย — เริ่มไอเดียแรกเลยสิ" },
    placeIdea: { en: "Place idea", th: "ไอเดียสถานที่" },
    dateIdea: { en: "Date idea", th: "ไอเดียวันที่" },
    dropAnIdea: { en: "Drop an idea…", th: "แชร์ไอเดีย…" },
    signInToAddIdea: { en: "Sign in to add an idea", th: "เข้าสู่ระบบเพื่อเพิ่มไอเดีย" },
    latestSummaryBy: { en: "Latest summary · By {name}", th: "สรุปล่าสุด · โดย {name}" },
    updated: { en: "Updated", th: "อัปเดตแล้ว" },
    noTakeYet: { en: "No take yet — check back soon.", th: "ยังไม่มีข้อสรุป — กลับมาดูใหม่เร็ว ๆ นี้" },
    writeTheSummary: { en: "Write the summary", th: "เขียนบทสรุป" },
    manifestProgress: { en: "Manifest progress", th: "ความคืบหน้าของแมนิเฟสต์" },
    itsATripNow: { en: "It's a trip now.", th: "ตอนนี้เป็นทริปแล้ว" },
    readyLine1: { en: "Ready", th: "พร้อม" },
    readyLine2: { en: "when you are.", th: "เมื่อคุณพร้อม" },
    notATripLine1: { en: "Not a trip.", th: "ยังไม่ใช่ทริป" },
    notATripLine2: { en: "Not yet.", th: "ยังไม่ใช่ตอนนี้" },
    convertedBody: {
      en: "This idea became a real trip — everything gathered here carried over.",
      th: "ไอเดียนี้กลายเป็นทริปจริงแล้ว — ทุกอย่างที่รวบรวมไว้ที่นี่ถูกนำไปด้วย",
    },
    readyBody: {
      en: "A location and dates are set. Any manifestor can convert this into a trip when ready.",
      th: "กำหนดสถานที่และวันที่แล้ว ผู้ร่วมสร้างฝันคนไหนก็แปลงเป็นทริปได้เมื่อพร้อม",
    },
    notReadyBody: {
      en: "The purpose is clear, but the date and location still need a decision. Keep gathering signals until the idea is solid enough to act on.",
      th: "จุดประสงค์ชัดเจนแล้ว แต่วันที่และสถานที่ยังต้องตัดสินใจ รวบรวมสัญญาณต่อไปจนกว่าไอเดียนี้จะแน่นพอให้ลงมือทำ",
    },
    stageManifesting: { en: "Manifesting", th: "กำลังสร้างฝัน" },
    stageGatheringIdeas: { en: "Gathering ideas", th: "กำลังรวบรวมไอเดีย" },
    stageTakingShape: { en: "Taking shape", th: "เริ่มเป็นรูปเป็นร่าง" },
    stageTrip: { en: "Trip", th: "ทริป" },
    convertToTrip: { en: "Convert to trip", th: "แปลงเป็นทริป" },
    finalizing: { en: "Finalizing…", th: "กำลังยืนยัน…" },
    onlyManifestorsCanConvert: { en: "Only manifestors can convert this.", th: "เฉพาะผู้ร่วมสร้างฝันเท่านั้นที่แปลงเป็นทริปได้" },
    finalizeFirst: { en: "Finalize a location and date first", th: "กำหนดสถานที่และวันที่ก่อน" },
    everythingSaidSoFar: { en: "Everything said so far", th: "ทุกอย่างที่พูดคุยกันมา" },
  }),

  manifestors: dict({
    nobodyClaimed: { en: "Nobody's claimed this one yet.", th: "ยังไม่มีใครรับผิดชอบเรื่องนี้เลย" },
    illManifestThis: { en: "I'll manifest this", th: "ฉันจะสร้างฝันนี้เอง" },
    equalPower: { en: "Manifestors — equal power", th: "ผู้ร่วมสร้างฝัน — สิทธิ์เท่าเทียมกัน" },
    remove: { en: "remove", th: "ลบ" },
    nominateByEmail: { en: "Nominate by email", th: "เสนอชื่อด้วยอีเมล" },
    add: { en: "Add", th: "เพิ่ม" },
    manifestorsLabel: { en: "Manifestors", th: "ผู้ร่วมสร้างฝัน" },
  }),

  vote: dict({
    signInToVote: { en: "Sign in to vote →", th: "เข้าสู่ระบบเพื่อโหวต →" },
  }),

  chatFeed: dict({
    signInToSeeAndJoin: { en: "to see and join the brainstorm.", th: "เพื่อดูและร่วมระดมไอเดีย" },
    noIdeasYet: { en: "No ideas yet — drop the first one.", th: "ยังไม่มีไอเดีย — เริ่มไอเดียแรกเลยสิ" },
    dropAnIdea: { en: "Drop an idea…", th: "แชร์ไอเดีย…" },
    tagDateIdea: { en: "Date idea", th: "ไอเดียวันที่" },
    tagPlaceIdea: { en: "Place idea", th: "ไอเดียสถานที่" },
    tagImIn: { en: "I'm in", th: "ฉันไปด้วย" },
    tagNote: { en: "Note", th: "โน้ต" },
  }),

  itemDisplay: dict({
    leading: { en: "leading", th: "นำอยู่" },
    soFar: { en: "so far", th: "จนถึงตอนนี้" },
    beTheFirst: { en: "Be the first", th: "เป็นคนแรกเลย" },
    noVotesYet: { en: "No votes yet", th: "ยังไม่มีคนโหวต" },
  }),

  manifestEdit: dict({
    centerLabel: { en: "Editing {title}", th: "กำลังแก้ไข {title}" },
    title: { en: "Edit manifest", th: "แก้ไขแมนิเฟสต์" },
    subtitle: {
      en: "Change what's public, decide the location, set target dates, or write the latest take.",
      th: "เปลี่ยนสิ่งที่เผยแพร่ กำหนดสถานที่ ตั้งวันที่เป้าหมาย หรือเขียนข้อสรุปล่าสุด",
    },
    titleField: { en: "Title", th: "ชื่อเรื่อง" },
    purpose: { en: "Purpose", th: "จุดประสงค์" },
    purposePlaceholder: { en: "Radiohead concert", th: "คอนเสิร์ต Radiohead" },
    purposeHint: {
      en: "The one thing that's already certain — shown as \"Known\" on the page.",
      th: "สิ่งเดียวที่แน่นอนอยู่แล้ว — จะแสดงเป็น \"รู้แล้ว\" บนหน้าเพจ",
    },
    roughTiming: { en: "Rough timing", th: "ช่วงเวลาคร่าว ๆ" },
    countries: { en: "Country options people can vote on", th: "ตัวเลือกประเทศให้คนโหวต" },
    countriesHint: {
      en: "Comma-separated. Removing one drops its votes from the tally.",
      th: "คั่นด้วยจุลภาค (,) การลบตัวเลือกจะลบคะแนนโหวตของตัวเลือกนั้นด้วย",
    },
    summary: { en: "Summary", th: "รายละเอียดโดยสรุป" },
    visibility: { en: "Visibility", th: "การมองเห็น" },
    whatWeKnow: { en: "What we know", th: "สิ่งที่เรารู้แล้ว" },
    whatWeKnowHint: {
      en: "Decide the location and set target dates once they're real — that's what unlocks \"Convert to trip.\"",
      th: "กำหนดสถานที่และตั้งวันที่เป้าหมายเมื่อมันเป็นจริงแล้ว — นั่นคือสิ่งที่ปลดล็อก \"แปลงเป็นทริป\"",
    },
    decidedLocation: { en: "Decided location", th: "สถานที่ที่ตัดสินใจแล้ว" },
    notDecidedYet: { en: "Not decided yet", th: "ยังไม่ได้ตัดสินใจ" },
    targetStartDate: { en: "Target start date", th: "วันที่เริ่มต้นเป้าหมาย" },
    targetEndDate: { en: "Target end date", th: "วันที่สิ้นสุดเป้าหมาย" },
    availabilityWindows: { en: "Availability windows people can flag", th: "ช่วงเวลาว่างให้คนเลือก" },
    availabilityPlaceholder: { en: "May – Aug 2027", th: "พ.ค. – ส.ค. 2027" },
    latestSummary: { en: "Latest summary", th: "สรุปล่าสุด" },
    headline: { en: "Headline", th: "หัวข้อหลัก" },
    headlinePlaceholder: { en: "The idea is leaning toward Japan.", th: "ไอเดียกำลังเอียงไปทางญี่ปุ่น" },
    body: { en: "Body", th: "เนื้อหา" },
    tags: { en: "Tags", th: "แท็ก" },
    tagsPlaceholder: { en: "Japan leading, Mid-2027, 5 interested", th: "ญี่ปุ่นนำอยู่, กลางปี 2027, สนใจ 5 คน" },
    signsOfLife: { en: "Signs of life", th: "สัญญาณความเป็นไปได้" },
    signalTitlePlaceholder: { en: "The tour exists", th: "ทัวร์มีจริง" },
    signalBodyPlaceholder: {
      en: "Any 2027 announcement moves this from delusional to possible.",
      th: "ถ้ามีประกาศปี 2027 เรื่องนี้จะเปลี่ยนจากเพ้อฝันเป็นเป็นไปได้",
    },
    addSignal: { en: "+ Add a signal", th: "+ เพิ่มสัญญาณ" },
    realityFundAndNote: { en: "Reality fund & note", th: "กองทุนความจริง & โน้ต" },
    realityFund: { en: "Reality fund (0–100)", th: "กองทุนความจริง (0–100)" },
    note: { en: "Note", th: "โน้ต" },
    attributedTo: { en: "— attributed to", th: "— โดย" },
    saveChanges: { en: "Save changes", th: "บันทึกการเปลี่ยนแปลง" },
    saving: { en: "Saving…", th: "กำลังบันทึก…" },
    cancel: { en: "Cancel", th: "ยกเลิก" },
  }),
} as const;

// --- Lookup helper -------------------------------------------------------

export type Vars = Record<string, string | number>;

function resolve(path: string): Phrase | undefined {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = dictionary;
  for (const part of parts) {
    node = node?.[part];
  }
  if (!node || typeof node.en !== "string") return undefined;
  return node as Phrase;
}

export function t(locale: Locale, path: string, vars?: Vars): string {
  const entry = resolve(path);
  if (!entry) return path; // visibly-wrong fallback — easy to spot & fix
  let str = entry[locale] || entry.en;
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      str = str.split(`{${key}}`).join(String(value));
    }
  }
  return str;
}

// Count helper — Thai doesn't inflect for plural, so this is the one
// place pluralization logic lives (instead of baking "vote/votes" pairs
// into every dictionary entry). Usage:
//   tn(locale, count, { one: "vote", other: "votes" }, "โหวต")
export function tn(
  locale: Locale,
  count: number,
  en: { one: string; other: string },
  th: string
): string {
  if (locale === "th") return `${count} ${th}`;
  return `${count} ${count === 1 ? en.one : en.other}`;
}
