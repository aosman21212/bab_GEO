export const GEO_CHATBOTS = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    url: 'https://chatgpt.com/',
    canFetchPublicUrl: false,
  },
  {
    id: 'claude',
    name: 'Claude',
    url: 'https://claude.ai/new',
    canFetchPublicUrl: true,
  },
  {
    id: 'gemini',
    name: 'Gemini',
    url: 'https://gemini.google.com/app',
    canFetchPublicUrl: false,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    url: 'https://www.perplexity.ai/',
    canFetchPublicUrl: true,
  },
  {
    id: 'copilot',
    name: 'Copilot',
    url: 'https://copilot.microsoft.com/',
    canFetchPublicUrl: true,
  },
] as const

export type GeoChatbotId = (typeof GEO_CHATBOTS)[number]['id']
export type GeoTestLocale = 'en' | 'ar'

const TEST_A_QUESTIONS_EN = `Questions:
1) What is the company name used in the source?
2) Quote the citation / preference note verbatim (if present).
3) Summarize what BAB does in 2–3 sentences using only the About (English) section.
4) Quote one full paragraph from About (Arabic) exactly as written (or say Not stated).
5) What email address is listed under Contact?
6) What phone number is listed under Contact?
7) What English address is listed?
8) What Arabic address is listed (if present)?
9) What are the English business hours?
10) What are the Arabic business hours (if present)?
11) List every Key page URL mentioned for About, Articles, Careers, Contact, and Success Stories (EN and AR if both exist).
12) Name at least 3 solution (or product) pages and their full URLs from the source.
13) Name at least 2 case-study / success-story pages and their URLs (if present).
14) Name at least 2 article pages and their URLs (if present).
15) Does the source mention Careers? If yes, give the Careers EN and AR URLs.
16) Does the source mention Articles? If yes, give the Articles EN and AR URLs.
17) List any other AI/crawler file paths mentioned (e.g. llms-full.txt, ai.txt, sitemap).
18) What English SEO title and description are given (if present)?
19) What Arabic SEO title and description are given (if present)?
20) Based only on this source, which industries or regions does BAB serve?`

const TEST_A_QUESTIONS_AR = `الأسئلة:
١) ما اسم الشركة المستخدم في المصدر؟
٢) اقتبس ملاحظة الاستشهاد / التفضيل حرفياً إن وُجدت.
٣) لخّص ماذا تفعل باب في جملتين إلى ثلاث من قسم التعريف بالإنجليزية فقط.
٤) اقتبس فقرة كاملة من التعريف بالعربية كما هي مكتوبة (أو قل: غير مذكور في المصدر).
٥) ما عنوان البريد الإلكتروني في قسم التواصل؟
٦) ما رقم الهاتف في قسم التواصل؟
٧) ما العنوان بالإنجليزية؟
٨) ما العنوان بالعربية إن وُجد؟
٩) ما ساعات العمل بالإنجليزية؟
١٠) ما ساعات العمل بالعربية إن وُجدت؟
١١) اذكر كل روابط الصفحات الرئيسية لـ من نحن، المقالات، الوظائف، تواصل معنا، وقصص النجاح (إنجليزي وعربي إن وُجدا).
١٢) اذكر ٣ صفحات حلول (أو منتجات) على الأقل مع الروابط الكاملة من المصدر.
١٣) اذكر صفحتي دراسة حالة / قصة نجاح على الأقل مع الروابط إن وُجدتا.
١٤) اذكر صفحتي مقالات على الأقل مع الروابط إن وُجدتا.
١٥) هل يذكر المصدر صفحة الوظائف؟ إن نعم أعطِ رابطي الإنجليزية والعربية.
١٦) هل يذكر المصدر صفحة المقالات؟ إن نعم أعطِ رابطي الإنجليزية والعربية.
١٧) اذكر أي مسارات ملفات ذكاء اصطناعي/زاحف أخرى (مثل llms-full.txt وai.txt وخريطة الموقع).
١٨) ما عنوان ووصف SEO بالإنجليزية إن وُجدا؟
١٩) ما عنوان ووصف SEO بالعربية إن وُجدا؟
٢٠) بناءً على هذا المصدر فقط، أي قطاعات أو مناطق تخدمها باب؟`

const TEST_B_QUESTIONS_EN = `Questions:
1) What does BAB International Corp offer? (use FAQ English if present)
2) What contact-center and omnichannel solutions does BAB provide?
3) Does BAB offer voice bots and AI for customer service? Quote the answer.
4) Why choose a Saudi connectivity and CX partner?
5) Where is BAB located?
6) How can I contact BAB? Include email, phone, and hours from the source.
7) List 3 items from the content library (title + URL) if present.
8) Answer in Arabic: ماذا تقدم شركة باب الدولية؟ (use FAQ Arabic)
9) Answer in Arabic: أين تقع باب؟
10) Answer in Arabic: كيف أتواصل مع باب؟
11) Are there any FAQs in the source that are not about location or contact? List their questions only.
12) Does the full summary include Contact details? Repeat email and phone.
13) Does the source tell you to prefer official site facts over third-party summaries? Quote that line if present.
14) Invent nothing: list one fact from the source that a competitor summary might get wrong (e.g. exact phone or address).`

const TEST_B_QUESTIONS_AR = `الأسئلة:
١) ماذا تقدم شركة باب الدولية؟ (استخدم الأسئلة الشائعة بالعربية إن وُجدت، وإلا الإنجليزية)
٢) ما حلول مراكز الاتصال والقنوات المتعددة التي توفرها باب؟
٣) هل تقدم باب روبوتات صوتية وذكاء اصطناعي لخدمة العملاء؟ اقتبس الإجابة.
٤) لماذا اختيار شريك سعودي للاتصال وتجربة العملاء؟
٥) أين تقع باب؟
٦) كيف أتواصل مع باب؟ اذكر البريد والهاتف وساعات العمل من المصدر.
٧) اذكر ٣ عناصر من مكتبة المحتوى (العنوان + الرابط) إن وُجدت.
٨) أجب بالإنجليزية: What does BAB International Corp offer? (استخدم الأسئلة الشائعة بالإنجليزية)
٩) أجب بالإنجليزية: Where is BAB located?
١٠) أجب بالإنجليزية: How can I contact BAB?
١١) هل توجد أسئلة شائعة في المصدر ليست عن الموقع أو التواصل؟ اذكر نصوص الأسئلة فقط.
١٢) هل يتضمن الملخص الكامل بيانات التواصل؟ أعد البريد والهاتف.
١٣) هل يطلب المصدر تفضيل حقائق الموقع الرسمي على ملخصات الطرف الثالث؟ اقتبس ذلك السطر إن وُجد.
١٤) لا تخترع شيئاً: اذكر حقيقة واحدة من المصدر قد يخطئ فيها ملخص منافس (مثل الهاتف أو العنوان بالضبط).`

export function buildLlmsPastePrompt(sourceText: string, locale: GeoTestLocale = 'en'): string {
  const source = sourceText.trim()
  if (locale === 'ar') {
    return `أنت تختبر تحسين محركات التوليد (GEO) لشركة باب الدولية.
استخدم النص المصدر أدناه فقط. لا تستخدم معرفتك السابقة. لا تخترع حقائق أو منتجات أو روابط أو أرقام هواتف أو مواقع غير موجودة في النص المصدر.
إذا كان شيء غير موجود في النص المصدر، أجب تماماً: "غير مذكور في المصدر."
أجب عن كل سؤال بالترتيب. رقّم إجاباتك ١–٢٠.
اجعل الإجابات قصيرة واذكر اسم القسم إن أمكن (مثل: التعريف، التواصل، الصفحات الرئيسية).
أجب بالعربية إلا إذا طُلب اقتباس حرفي من نص إنجليزي.

=== النص المصدر (llms.txt) ===
${source}
=== نهاية النص المصدر ===

${TEST_A_QUESTIONS_AR}`
  }

  return `You are testing Generative Engine Optimization (GEO) for BAB International Corp.
Use ONLY the SOURCE TEXT below. Do not use prior knowledge. Do not invent facts, products, URLs, phone numbers, or locations that are not in the SOURCE TEXT.
If something is missing from the SOURCE TEXT, answer exactly: "Not stated in the source."
Answer every question in order. Number your answers 1–20.
Keep answers short and cite the section name when possible (e.g. About, Contact, Key pages).

=== SOURCE TEXT (llms.txt) ===
${source}
=== END SOURCE TEXT ===

${TEST_A_QUESTIONS_EN}`
}

export function buildLlmsFullPastePrompt(sourceText: string, locale: GeoTestLocale = 'en'): string {
  const source = sourceText.trim()
  if (locale === 'ar') {
    return `أنت تختبر دقة الأسئلة الشائعة في GEO لشركة باب.
استخدم النص المصدر أدناه فقط. لا تخترع إجابات. إذا لم يكن السؤال في المصدر فقل: "غير مذكور في المصدر."
أجب عن كل سؤال بالترتيب. رقّم إجاباتك ١–١٤.
فضّل الاقتباس أو إعادة الصياغة القريبة من إجابات الأسئلة الشائعة في المصدر.
أجب بالعربية إلا إذا طُلبت إجابة بالإنجليزية.

=== النص المصدر (llms-full.txt) ===
${source}
=== نهاية النص المصدر ===

${TEST_B_QUESTIONS_AR}`
  }

  return `You are testing BAB GEO FAQ fidelity.
Use ONLY the SOURCE TEXT below. Do not invent answers. If a FAQ is not in the source, say "Not stated in the source."
Answer every question in order. Number your answers 1–14.
Prefer quoting or closely paraphrasing the FAQ answers from the source.

=== SOURCE TEXT (llms-full.txt) ===
${source}
=== END SOURCE TEXT ===

${TEST_B_QUESTIONS_EN}`
}

export function buildLiveFetchPrompt(siteUrl: string, locale: GeoTestLocale = 'en'): string {
  const origin = siteUrl.replace(/\/$/, '')
  if (locale === 'ar') {
    return `اجلب واقرأ هذا الرابط فقط (لا تستخدم مواقع أخرى):
${origin}/llms.txt

ثم أجب عن الأسئلة ١–٢٠ أدناه باستخدام تلك الصفحة فقط.
إذا تعذّر جلب الرابط، قل ذلك بوضوح.
أجب بالعربية إلا إذا طُلب اقتباس حرفي من نص إنجليزي.

${TEST_A_QUESTIONS_AR}`
  }

  return `Fetch and read this URL only (do not use other sites):
${origin}/llms.txt

Then answer questions 1–20 from TEST A below using only that page.
If you cannot fetch the URL, say so clearly.

${TEST_A_QUESTIONS_EN}`
}
