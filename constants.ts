
import { ContactType, UserSettings, Contact, Helpline } from './types';

export const HELPLINE_DIRECTORY: Helpline[] = [
  { name: "National Emergency", number: "112", category: "General", description_en: "Police, Fire, and Medical (Unified)", description_or: "ପୋଲିସ୍, ଅଗ୍ନିଶମ ଏବଂ ଆମ୍ବୁଲାନ୍ସ (ଏକୀକୃତ)" },
  { name: "Women's Helpline", number: "1091", category: "Women", description_en: "Safety and domestic help", description_or: "ମହିଳା ସହାୟତା" },
  { name: "Women (Odisha)", number: "181", category: "Women", description_en: "Odisha State Women helpline", description_or: "ରାଜ୍ୟ ମହିଳା ହେଲ୍ପଲାଇନ" },
  { name: "Childline", number: "1098", category: "Child", description_en: "For children in distress", description_or: "ଶିଶୁ ସହାୟତା" },
  { name: "Ambulance", number: "108", category: "Medical", description_en: "Emergency medical transport", description_or: "ଆମ୍ବୁଲାନ୍ସ" },
  { name: "Fire Department", number: "101", category: "General", description_en: "Fire and rescue", description_or: "ଅଗ୍ନିଶମ ସେବା" },
  { name: "Senior Citizen", number: "14567", category: "General", description_en: "Help for elders", description_or: "ବରିଷ୍ଠ ନାଗରିକ ସହାୟତା" },
  { name: "Cyber Crime", number: "1930", category: "Cyber", description_en: "Report online fraud", description_or: "ସାଇବର ଅପରାଧ" },
  { name: "SCB Medical (Cuttack)", number: "06712305820", category: "Medical", description_en: "Casualty department", description_or: "ଏସସିବି ମେଡିକାଲ" }
];

export const DEFAULT_EMERGENCY_MESSAGE = `Sir/Madam, I am in immediate danger and need help.
Please contact me at this number.
My live location is shared below.
Kindly instruct the nearest PCR or police unit to reach immediately.`;

export const TRANSLATIONS = {
  en: {
    title: "SafeGuard Cuttack",
    sos: "Help",
    directory: "Helplines",
    nearby: "Nearby Safe Places",
    strobe: "Strobe",
    siren: "Siren",
    safe: "I'm Safe",
    emergency: "Police / Emergency",
    police: "Police",
    hospital: "Hospital",
    cancel: "CANCEL",
    locating: "Locating...",
    locLocked: "Location Locked",
    msgLabel: "Emergency Message",
    msgDesc: "This text is sent to contacts along with your location.",
    resetMsg: "Reset to Default",
    shareMsg: "Check out SafeGuard Cuttack - A safety app. Stay safe and install it now!",
    howToTitle: "Safety Strategy",
    step1: "Use LOUD mode in crowds to attract public help.",
    step2: "Use SILENT mode if you are being followed or in isolated areas to avoid alerting the attacker.",
    step3: "Always keep your Trusted Contacts updated.",
    step4: "112 is the fastest way to get a PCR van to your location.",
    silentMode: "Silent Mode",
    silentDesc: "No siren or strobe. Discreet UI.",
    loudMode: "Loud Mode",
    loudDesc: "Plays high-pitched siren and flashes light.",
    rightsTitle: "Know Your Rights",
    right1Title: "Zero FIR",
    right1Desc: "You can file an FIR at ANY police station, regardless of where the crime happened.",
    right2Title: "Women's Arrest",
    right2Desc: "A woman cannot be arrested after sunset or before sunrise without a woman police officer and magistrate's order.",
    right3Title: "Free Legal Aid",
    right3Desc: "If you cannot afford a lawyer, the government must provide you with one for free.",
    right4Title: "Medical Help First",
    right4Desc: "Hospitals must treat accident victims immediately without waiting for police paperwork.",
    right5Title: "Hotel Washrooms & Water",
    right5Desc: "Under the Indian Sarais Act, you can enter any hotel (even 5-star) to drink water or use the washroom for free in an emergency.",
    right6Title: "Traffic Key Snatching",
    right6Desc: "A traffic police officer cannot snatch the keys of your vehicle or force you out of the car without a valid reason and proper uniform.",
    right7Title: "Public Nursing",
    right7Desc: "Public spaces and malls are legally encouraged to provide safe, private spaces for mothers to nurse their children.",
    recordLabel: "Auto-Record Evidence",
    recordDesc: "Captures audio/video during alert (Offline).",
    vaultTitle: "Evidence Vault",
    vaultEmpty: "No recordings found.",
    vaultDesc: "Secure local recordings for legal use.",
    hardwareTrigger: "Discreet Trigger",
    hardwareDesc: "Double-tap the Help button for instant trigger bypassing countdown."
  },
  or: {
    title: "ସେଫ୍‌ଗାର୍ଡ କଟକ",
    sos: "ସହାୟତା",
    directory: "ହେଲ୍ପଲାଇନ",
    nearby: "ନିକଟସ୍ଥ ସୁରକ୍ଷିତ ସ୍ଥାନ",
    strobe: "ଷ୍ଟ୍ରୋବ୍",
    siren: "ସାଇରେନ୍",
    safe: "ମୁଁ ସୁରକ୍ଷିତ",
    emergency: "ପୋଲିସ୍ / ଜରୁରୀକାଳୀନ",
    police: "ଥାନା",
    hospital: "ଡାକ୍ତରଖାନା",
    cancel: "ବାତିଲ୍",
    locating: "ଖୋଜୁଛି...",
    locLocked: "ଅବସ୍ଥାନ ମିଳିଲା",
    msgLabel: "ଜରୁରୀକାଳୀନ ବାର୍ତ୍ତା",
    msgDesc: "ଏହି ବାର୍ତ୍ତା ଆପଣଙ୍କ ଅବସ୍ଥାନ ସହିତ ପଠାଯିବ |",
    resetMsg: "ପୂର୍ବବତ୍ କରନ୍ତୁ",
    shareMsg: "ସେଫ୍‌ଗାର୍ଡ କଟକ ଆପ୍ ବ୍ୟବହାର କରନ୍ତୁ - ନିଜ ସୁରକ୍ଷା ପାଇଁ ଏହାକୁ ଏବେ ହିଁ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ!",
    howToTitle: "ସୁରକ୍ଷା ରଣନୀତି",
    step1: "ଜନଗହଳି ପୂର୍ଣ୍ଣ ସ୍ଥାନରେ LOUD ମୋଡ୍ ବ୍ୟବହାର କରନ୍ତୁ |",
    step2: "ଯଦି ଆପଣଙ୍କୁ କେହି ଗୋଡାଉଛନ୍ତି, ତେବେ SILENT ମୋଡ୍ ବ୍ୟବହାର କରନ୍ତୁ |",
    step3: "ନିଜର ବିଶ୍ୱସ୍ତ ସମ୍ପର୍କୀୟଙ୍କୁ ସୂଚନା ଦିଅନ୍ତୁ |",
    step4: "୧୧୨ ହେଉଛି ପୋଲିସ୍ ସହାୟତା ପାଇଁ ସବୁଠାରୁ ଦ୍ରୁତ ମାଧ୍ୟମ |",
    silentMode: "ସାଇଲେଣ୍ଟ ମୋଡ୍",
    silentDesc: "ସାଇରେନ୍ ବାଜିବ ନାହିଁ।",
    loudMode: "ଲାଉଡ୍ ମୋଡ୍",
    loudDesc: "ସାଇରେନ୍ ବାଜିବ ଏବଂ ଲାଇଟ୍ ଜଳିବ।",
    rightsTitle: "ଆପଣଙ୍କ ଅଧିକାର",
    right1Title: "ଜିରୋ ଏଫ୍.ଆଇ.ଆର୍. (Zero FIR)",
    right1Desc: "ଅପରାଧ ଯେଉଁଠି ବି ହୋଇଥାଉ, ଆପଣ ଯେକୌଣସି ଥାନାରେ ଏଫ୍.ଆଇ.ଆର୍. ଦେଇପାରିବେ |",
    right2Title: "ମହିଳାଙ୍କ ଗିରଫଦାରୀ",
    right2Desc: "ସୂର୍ଯ୍ୟାସ୍ତ ପରେ କିମ୍ବା ସୂର୍ଯ୍ୟୋଦୟ ପୂର୍ବରୁ ଜଣେ ମହିଳାଙ୍କୁ ବିନା ମହିଳା ପୋଲିସ୍ ଏବଂ ମାଜିଷ୍ଟ୍ରେଟ୍‌ଙ୍କ ଆଦେଶରେ ଗିରଫ କରାଯାଇପାରିବ ନାହିଁ |",
    right3Title: "ମାଗଣା ଆଇନଗତ ସହାୟତା",
    right3Desc: "ଯଦି ଆପଣ ଓକିଲ ରଖିବାକୁ ଅସମର୍ଥ, ତେବେ ସରକାର ଆପଣଙ୍କୁ ମାଗଣା ଓକିଲ ଯୋଗାଇଦେବେ |",
    right4Title: "ପ୍ରଥମେ ଡାକ୍ତରୀ ସହାୟତା",
    right4Desc: "ଦୁର୍ଘଟଣା ସମୟରେ ଡାକ୍ତରଖାନା ପୋଲିସ୍ କାଗଜପତ୍ରକୁ ଅପେକ୍ଷା ନକରି ତୁରନ୍ତ ଚିକିତ୍ସା କରିବା ଜରୁରୀ |",
    right5Title: "ହୋଟେଲ ଶୌଚାଳୟ ଏବଂ ପାଣି",
    right5Desc: "ଇଣ୍ଡିଆନ୍ ସାରାଇସ୍ ଆକ୍ଟ ଅନୁଯାୟୀ, ଜରୁରୀକାଳୀନ ପରିସ୍ଥିତିରେ ଆପଣ ଯେକୌଣସି ହୋଟେଲରେ ମାଗଣାରେ ପାଣି ପିଇପାରିବେ ଏବଂ ଶୌଚାଳୟ ବ୍ୟବହାର କରିପାରିବେ |",
    right6Title: "ଗାଡି ଚାବି ଛଡାଇବା",
    right6Desc: "ଟ୍ରାଫିକ୍ ପୋଲିସ୍ ଅଧିକାରୀ ଆପଣଙ୍କ ବିନା ଅନୁମତିରେ କିମ୍ବା ବୈଧ କାରଣ ବିନା ଆପଣଙ୍କ ଗାଡି ଚାବି ଛଡାଇ ନେଇପାରିବେ ନାହିଁ |",
    right7Title: "ସର୍ବସାଧାରଣ ସ୍ଥାନରେ ଶିଶୁ ଯତ୍ନ",
    right7Desc: "ମା' ମାନଙ୍କୁ ସେମାନଙ୍କ ଶିଶୁଙ୍କୁ କ୍ଷୀର ଖୁଆଇବା ପାଇଁ ସର୍ବସାଧାରଣ ସ୍ଥାନରେ ସୁରକ୍ଷିତ ଏବଂ ବ୍ୟକ୍ତିଗତ ସ୍ଥାନ ଯୋଗାଇ ଦେବା ଆଇନଗତ ଭାବେ ଉତ୍ସାହିତ କରାଯାଏ |",
    recordLabel: "ପ୍ରମାଣ ରେକର୍ଡିଂ",
    recordDesc: "ସହାୟତା ସମୟରେ ଅଡିଓ/ଭିଡିଓ ରେକର୍ଡ କରେ |",
    vaultTitle: "ପ୍ରମାଣ ଭଲ୍ଟ",
    vaultEmpty: "କୌଣସି ରେକର୍ଡିଂ ମିଳିଲା ନାହିଁ |",
    vaultDesc: "ଆଇନଗତ ବ୍ୟବହାର ପାଇଁ ସୁରକ୍ଷିତ ରେକର୍ଡିଂ |",
    hardwareTrigger: "ସିଧାସଳଖ ସହାୟତା",
    hardwareDesc: "କାଉଣ୍ଟଡାଉନ୍ ବାଇପାସ୍ କରିବା ପାଇଁ ସହାୟତା ବଟନ୍‌କୁ ଦୁଇଥର ଟ୍ୟାପ୍ କରନ୍ତୁ |"
  }
};

export const INITIAL_SETTINGS: UserSettings = {
  userName: '',
  emergencyMessage: DEFAULT_EMERGENCY_MESSAGE,
  countdownSeconds: 3,
  language: 'en',
  bloodGroup: 'Not Set',
  silentMode: false,
  autoRecord: true
};

export const INITIAL_CONTACTS: Contact[] = [
  { id: '112-national', name: 'National Emergency', phone: '112', type: ContactType.OFFICIAL, isWhatsApp: false },
  { id: '100-police', name: 'PCR Cuttack', phone: '100', type: ContactType.OFFICIAL, isWhatsApp: false }
];
