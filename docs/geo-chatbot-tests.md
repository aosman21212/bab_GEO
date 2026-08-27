# How to test AI GEO (ChatGPT, Claude, etc.)

## Setup (before any chat)

1. Open http://localhost:3003/llms.txt and copy **all** text.
2. For FAQ tests, also open http://localhost:3003/llms-full.txt and copy **all** text.
3. Open Claude.ai / ChatGPT / Gemini / Perplexity → new chat.
4. Paste one of the **Test packs** below (replace the placeholder with your copied file).
5. Score: **PASS** if answers stay inside the pasted source; **FAIL** if invents products, phones, URLs, or cities not in the text.

**Rule:** Chatbots cannot read localhost by themselves. Use paste (Tests A–D) or a public URL / tunnel (Test E).

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

Replace `YOUR-DOMAIN` with `bab.com.sa` or your tunnel host (not localhost unless the tool can reach it).

---

## Optional short packs

### `llms-small.txt`

```text
Use ONLY this source. What is BAB in one sentence, and what contact info appears?

=== SOURCE ===
<<<PASTE_LLMS_SMALL_TXT_HERE>>>
=== END ===
```

### `.well-known/ai.txt`

```text
Use ONLY this source.
1) What is the preferred citation name?
2) What files does it point AI tools to?
3) Quote any citation note.

=== SOURCE ===
<<<PASTE_AI_TXT_HERE>>>
=== END ===
```
