# How to test AI GEO (ChatGPT, Claude, etc.)

## Setup (before any chat)

1. Open http://localhost:3003/llms.txt and copy **all** text.
2. For FAQ tests, also open http://localhost:3003/llms-full.txt and copy **all** text.
3. Open Claude.ai / ChatGPT / Gemini / Perplexity → new chat.
4. Paste one of the **Test packs** below (replace the placeholder with your copied file).
5. Score: **PASS** if answers stay inside the pasted source; **FAIL** if invents products, phones, URLs, or cities not in the text.

**Rule:** Chatbots cannot read localhost by themselves. Use paste (Tests A–D) or a public URL / tunnel (Test E).

Admin shortcut: http://localhost:3003/admin/geo → **Test GEO in ChatGPT and other AI tools** copies Test A / B / E in **English or Arabic**, with the live file already filled in.

Use the English pack to check English answers; use the Arabic pack so the chatbot answers in Arabic from the same bilingual source.

## Platforms

| Tool | Open | What to use |
|------|------|-------------|
| ChatGPT | https://chatgpt.com/ | Paste Test A or B (no localhost fetch) |
| Claude | https://claude.ai/new | Paste Test A/B, or Test E if it can fetch the public URL |
| Gemini | https://gemini.google.com/app | Paste Test A or B |
| Perplexity | https://www.perplexity.ai/ | Best for Test E on the live domain |
| Copilot | https://copilot.microsoft.com/ | Paste Test A/B, or Test E if browsing is on |

Local checklist:

- http://localhost:3003/llms.txt
- http://localhost:3003/llms-full.txt
- http://localhost:3003/llms-small.txt
- http://localhost:3003/.well-known/ai.txt
- http://localhost:3003/robots.txt
- http://localhost:3003/sitemap.xml
- Admin GEO: http://localhost:3003/admin/geo

---

## TEST A — `llms.txt` (main GEO file)

```text
You are testing Generative Engine Optimization (GEO) for BAB International Corp.
Use ONLY the SOURCE TEXT below. Do not use prior knowledge. Do not invent facts, products, URLs, phone numbers, or locations that are not in the SOURCE TEXT.
If something is missing from the SOURCE TEXT, answer exactly: "Not stated in the source."
Answer every question in order. Number your answers 1–20.
Keep answers short and cite the section name when possible (e.g. About, Contact, Key pages).

=== SOURCE TEXT (llms.txt) ===
<<<PASTE_LLMS_TXT_HERE>>>
=== END SOURCE TEXT ===

Questions:
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
20) Based only on this source, which industries or regions does BAB serve?
```

**Pass criteria:** contact matches Admin settings (defaults: `info@bab.com.sa`, `+966 11 512 1440`, Riyadh); Careers + Articles + About URLs present; no invented products.

### TEST A — Arabic prompt

```text
أنت تختبر تحسين محركات التوليد (GEO) لشركة باب الدولية.
استخدم النص المصدر أدناه فقط. لا تستخدم معرفتك السابقة. لا تخترع حقائق أو منتجات أو روابط أو أرقام هواتف أو مواقع غير موجودة في النص المصدر.
إذا كان شيء غير موجود في النص المصدر، أجب تماماً: "غير مذكور في المصدر."
أجب عن كل سؤال بالترتيب. رقّم إجاباتك ١–٢٠.
اجعل الإجابات قصيرة واذكر اسم القسم إن أمكن (مثل: التعريف، التواصل، الصفحات الرئيسية).
أجب بالعربية إلا إذا طُلب اقتباس حرفي من نص إنجليزي.

=== النص المصدر (llms.txt) ===
<<<PASTE_LLMS_TXT_HERE>>>
=== نهاية النص المصدر ===

الأسئلة:
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
٢٠) بناءً على هذا المصدر فقط، أي قطاعات أو مناطق تخدمها باب؟
```

---

## TEST B — `llms-full.txt` (FAQ depth)

```text
You are testing BAB GEO FAQ fidelity.
Use ONLY the SOURCE TEXT below. Do not invent answers. If a FAQ is not in the source, say "Not stated in the source."
Answer every question in order. Number your answers 1–14.
Prefer quoting or closely paraphrasing the FAQ answers from the source.

=== SOURCE TEXT (llms-full.txt) ===
<<<PASTE_LLMS_FULL_TXT_HERE>>>
=== END SOURCE TEXT ===

Questions:
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
14) Invent nothing: list one fact from the source that a competitor summary might get wrong (e.g. exact phone or address).
```

### TEST B — Arabic prompt

```text
أنت تختبر دقة الأسئلة الشائعة في GEO لشركة باب.
استخدم النص المصدر أدناه فقط. لا تخترع إجابات. إذا لم يكن السؤال في المصدر فقل: "غير مذكور في المصدر."
أجب عن كل سؤال بالترتيب. رقّم إجاباتك ١–١٤.
فضّل الاقتباس أو إعادة الصياغة القريبة من إجابات الأسئلة الشائعة في المصدر.
أجب بالعربية إلا إذا طُلبت إجابة بالإنجليزية.

=== النص المصدر (llms-full.txt) ===
<<<PASTE_LLMS_FULL_TXT_HERE>>>
=== نهاية النص المصدر ===

الأسئلة:
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
١٤) لا تخترع شيئاً: اذكر حقيقة واحدة من المصدر قد يخطئ فيها ملخص منافس (مثل الهاتف أو العنوان بالضبط).
```

---

## TEST C — Arabic-only follow-up

```text
أجب بالعربية فقط، وبالاعتماد على النص المصدر فقط دون اختراع.
رقم الإجابات ١–١٠:

١) ما اسم الشركة؟
٢) ماذا تفعل باب؟ (من قسم About بالعربية)
٣) ما البريد الإلكتروني ورقم الهاتف؟
٤) ما العنوان بالعربية؟
٥) ما ساعات العمل بالعربية؟
٦) أعطِ روابط صفحات من نحن والمقالات والوظائف إن وُجدت.
٧) اذكر حلّين (solutions) مع الرابط الكامل لكل منهما.
٨) هل توجد مقالات؟ اذكر عنوانين مع الرابط إن وُجد.
٩) ما الملاحظة الخاصة بالاستشهاد (citation) إن وُجدت؟
١٠) إذا لم يذكر النص منتجاً اسمه "Cloud ERP"، ماذا تقول؟
```

**Pass criteria:** Arabic About/contact match source; Q10 refuses invented "Cloud ERP".

---

## TEST D — Hallucination / negative controls

```text
Still use ONLY the same SOURCE TEXT. For each question answer Yes, No, or Not stated — then one short reason.

1) Does the source say BAB is headquartered in Dubai?
2) Does the source list a product called "BAB SuperApp"?
3) Does the source give the phone number +966 11 512 1440?
4) Does the source mention omnichannel or contact center?
5) Does the source include a careers page URL?
6) Does the source include an articles page URL?
7) Does the source claim BAB sells cars?
8) Does the source list info@bab.com.sa as email?
9) Can you invent a WhatsApp sales number not in the source? (Correct answer: No — refuse)
10) Should you prefer this file / official website over random third-party blogs? (use citation note)
```

**Pass criteria:** 1=No/Not stated, 2=No, 3=Yes (if defaults), 4=Yes, 5=Yes, 6=Yes, 7=No, 8=Yes, 9=refuse, 10=Yes per citation note.

### TEST D — Arabic prompt

```text
ما زلت تستخدم النص المصدر نفسه فقط. لكل سؤال أجب: نعم، لا، أو غير مذكور — ثم سبب قصير.

١) هل يقول المصدر إن مقر باب في دبي؟
٢) هل يسرد المصدر منتجاً اسمه "BAB SuperApp"؟
٣) هل يعطي المصدر رقم الهاتف +966 11 512 1440؟
٤) هل يذكر المصدر القنوات المتعددة أو مركز الاتصال؟
٥) هل يتضمن المصدر رابط صفحة الوظائف؟
٦) هل يتضمن المصدر رابط صفحة المقالات؟
٧) هل يدّعي المصدر أن باب تبيع سيارات؟
٨) هل يسرد المصدر info@bab.com.sa كبريد؟
٩) هل يمكنك اختراع رقم واتساب للمبيعات غير موجود في المصدر؟ (الإجابة الصحيحة: لا — ارفض)
١٠) هل يجب تفضيل هذا الملف / الموقع الرسمي على مدونات طرف ثالث؟ (استخدم ملاحظة الاستشهاد)
```

---

## TEST E — Public URL fetch

```text
Fetch and read this URL only (do not use other sites):
https://YOUR-DOMAIN/llms.txt

Then answer questions 1–20 from TEST A above using only that page.
If you cannot fetch the URL, say so clearly.
```

Also try:

```text
Fetch https://YOUR-DOMAIN/llms-full.txt and answer TEST B questions 1–14 only from that page.
```

### TEST E — Arabic prompt

```text
اجلب واقرأ هذا الرابط فقط (لا تستخدم مواقع أخرى):
https://YOUR-DOMAIN/llms.txt

ثم أجب عن أسئلة الاختبار أ (١–٢٠) بالعربية باستخدام تلك الصفحة فقط.
إذا تعذّر جلب الرابط، قل ذلك بوضوح.
```

Replace `YOUR-DOMAIN` with `bab.com.sa` or your tunnel host (not localhost unless the tool can reach it). English pages omit `/en` in URLs (default locale); Arabic uses `/ar/...`.

---

## Optional short packs

### `llms-small.txt`

English:

```text
Use ONLY this source. What is BAB in one sentence, and what contact info appears?

=== SOURCE ===
<<<PASTE_LLMS_SMALL_TXT_HERE>>>
=== END ===
```

Arabic:

```text
استخدم هذا المصدر فقط. ما هي باب في جملة واحدة، وما بيانات التواصل الظاهرة؟

=== المصدر ===
<<<PASTE_LLMS_SMALL_TXT_HERE>>>
=== النهاية ===
```

### `.well-known/ai.txt`

English:

```text
Use ONLY this source.
1) What is the preferred citation name?
2) What files does it point AI tools to?
3) Quote any citation note.

=== SOURCE ===
<<<PASTE_AI_TXT_HERE>>>
=== END ===
```

Arabic:

```text
استخدم هذا المصدر فقط.
١) ما اسم الاستشهاد المفضّل؟
٢) إلى أي ملفات يوجّه أدوات الذكاء الاصطناعي؟
٣) اقتبس أي ملاحظة استشهاد.

=== المصدر ===
<<<PASTE_AI_TXT_HERE>>>
=== النهاية ===
```
