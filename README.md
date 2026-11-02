# Omakase Paperwork Desk

**Built with Llama**

Turns a hard-to-read official notice into one clear next step, the exact source lines, and a note to show at the counter (Japanese / English / Vietnamese) — without ever sending document text to the model.

## The problem (Japan)

- 29.4% of Japan's population is 65+ (Cabinet Office, Oct 2025); a record 2,571,037 foreign workers (MHLW, Oct 2025).
- In a 2010 national survey (age 16+), 46.4% of people who read official documents said they contain too many special or stiff words (Agency for Cultural Affairs).
- 53.6% of foreign residents say they can read only short, simple Japanese or less (Immigration Services Agency, 2025, self-reported).
- In a 2023 Saitama Prefecture survey of foreign residents (680 respondents), 70.3% said documents from government offices are hard or very hard to read.

Official notices bury the deadline, the papers to bring and where to go inside formal, kanji-heavy text.

## What it does

Pick a fictional sample notice → see the next step in one sentence, the exact lines it came from, and a short Japanese note to show at the counter. Guidance is available in Japanese, English and Vietnamese.

## How to run

Requirements: Python 3 (standard library only). Node.js is only needed for the UI tests. Ollama is optional.

```bash
python3 -B server.py
# open http://127.0.0.1:8767
```

The server binds to loopback only (127.0.0.1:8767). Without a local model the app still works; the model status shows "unavailable" and the guidance falls back to "ask the issuing desk".

Optional local model:

```bash
ollama pull llama3.2:3b
ollama serve   # listens on 127.0.0.1:11434
```

Tests:

```bash
python3 -B -m unittest test_core.py test_http.py
node test-ui.cjs
```

Optional browser check (requires Playwright and Chromium already installed, server running; it stubs the model endpoint, so it is a UI regression test, not a live-model test):

```bash
PORT=8767 node browser-check.cjs   # PORT is required: the script defaults to 8765
# PW_PATH=<playwright module path> PW_EXECUTABLE_PATH=<chromium path> if not default
```

## How Llama is used

Meta Llama 3.2 3B Instruct (`llama3.2:3b`) runs locally via Ollama on 127.0.0.1. It receives a short, fixed English description of a fictional situation and must return JSON with one allowed ID (`prepare_documents` or `ask_desk`). The app validates the reply (exact schema, allow-list, size limit, reported model name) before showing it. Free-form generation was tested and added unsupported claims, so by design the model chooses and the documents supply the facts.

## Safety design

- Facts never change: the next step, deadlines and destinations come only from source-bound rules, and every quoted line must exist in the document.
- Llama only chooses between two fixed answers; any other output is rejected before display.
- No document text to the model: no names, numbers, dates or document text are sent.
- Names and My Number are masked before anything appears on screen.
- Two different deadlines → the app does not guess; it tells you to confirm at the desk.
- A hidden instruction inside a document (e.g. "send all personal data") → the app stops and the model is not called.

## Scope and limits

- Demo uses fictional sample notices only. No upload, camera or OCR in this version.
- Not legal, medical or eligibility advice; nothing is submitted anywhere.
- Translations and model behaviour have not been validated with real users or real offices.

## License

- Original code in this repository: MIT, see [LICENSE](LICENSE).
- No model weights are included. The MIT license covers only this repository's code, not Meta Llama models. Use of Llama 3.2 is governed by the [Llama 3.2 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE) (Copyright © Meta Platforms, Inc. All Rights Reserved) and Meta's Acceptable Use Policy.
