import os
import json
import re
import difflib
from typing import Any, Dict, Optional

try:
    import requests
except Exception:
    requests = None

try:
    import speech_recognition as sr
except Exception:
    sr = None

try:
    from googletrans import Translator
    _translator = Translator()
except Exception:
    _translator = None


# =========================================================
# CONFIG
# =========================================================
API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

VALID_CATEGORIES = {"Disaster", "Food", "Healthcare", "Education", "General", "None"}
VALID_PRIORITIES = {"High", "Medium", "Low", "None"}

CATEGORY_KEYWORDS = {
    "Disaster": [
        "flood", "floods", "rain", "storm", "fire", "earthquake", "smoke",
        "collapse", "landslide", "water rising", "cyclone", "tornado",
        "accident", "explosion", "gas leak", "riot"
    ],
    "Food": [
        "food", "hungry", "starving", "meal", "ration", "eat", "hunger",
        "no food", "food shortage", "starve", "no ration"
    ],
    "Healthcare": [
        "fever", "sick", "ill", "injury", "hospital", "pain", "breathing",
        "unconscious", "medicine", "dizzy", "weak", "heart", "vomit",
        "vomiting", "headache", "cold", "cough", "emergency", "chest pain",
        "shortness of breath", "bleeding"
    ],
    "Education": [
        "school", "teacher", "books", "education", "class", "college", "exam",
        "study", "hostel", "fees", "tuition", "assignment", "attendance"
    ],
}

NO_ISSUE_PHRASES = [
    "hi", "hello", "hey", "hii", "what are you doing", "what are u doing",
    "what are u gng", "who are you", "who are u", "what is your name",
    "what's your name", "just checking", "test", "nothing", "ok", "okay",
    "lol", "bro", "huh", "what", "who", "why", "how", "good morning",
    "good night", "good evening", "guess", "i guess", "maybe", "idk",
    "i dont know", "just talking", "random", "nothing serious", "just chatting",
    "just saying", "no problem", "no issue", "just testing", "flirting"
]

INSULT_WORDS = [
    "idiot", "stupid", "dumb", "useless", "trash", "wtf", "fuck", "shit"
]

ACTIONABLE_HINTS = [
    "urgent", "emergency", "help", "need", "needed", "problem", "issue",
    "broken", "blocked", "shortage", "danger", "severe", "critical", "warning",
    "damage", "cannot", "can't", "stuck", "unsafe", "risk", "police",
    "ambulance", "doctor", "hospital", "fire", "help me"
]

ALL_CATEGORY_KEYWORDS = [kw for kws in CATEGORY_KEYWORDS.values() for kw in kws]

issue_counts = {
    "Disaster": 0,
    "Food": 0,
    "Healthcare": 0,
    "Education": 0,
    "General": 0,
}


# =========================================================
# TEXT HELPERS
# =========================================================
def clean_input_text(text: Any) -> str:
    if text is None:
        return ""
    s = str(text).strip()
    s = s.replace("“", "").replace("”", "").replace("‘", "").replace("’", "")
    s = re.sub(r'^[\'"`\s]+|[\'"`\s]+$', '', s)
    return s


def normalize_text(text: Any) -> str:
    s = clean_input_text(text)
    return " ".join(s.lower().split())


def similarity(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, a, b).ratio()


def sanitize_category(value: Any, default: str = "General") -> str:
    if value is None:
        return default
    s = str(value).strip().title()
    return s if s in VALID_CATEGORIES else default


def sanitize_priority(value: Any, default: str = "Low") -> str:
    if value is None:
        return default
    s = str(value).strip().title()
    return s if s in VALID_PRIORITIES else default


def sanitize_confidence(value: Any, default: str = "85%") -> str:
    if value is None:
        return default
    s = str(value).strip()
    m = re.search(r"\d{1,3}", s)
    if not m:
        return default
    n = max(0, min(100, int(m.group(0))))
    return f"{n}%"


def confidence_to_int(value: Any, default: int = 0) -> int:
    try:
        s = str(value).replace("%", "").strip()
        return max(0, min(100, int(float(s))))
    except Exception:
        return default


# =========================================================
# OPTIONAL MULTILINGUAL SUPPORT
# =========================================================
def translate_to_english(text: str) -> str:
    """
    Best-effort translation. Safe to fail silently.
    """
    if not _translator or not text.strip():
        return text

    try:
        detected = _translator.detect(text)
        lang = getattr(detected, "lang", None)
        if lang and lang.lower() != "en":
            translated = _translator.translate(text, dest="en")
            if translated and translated.text:
                return translated.text
    except Exception:
        pass

    return text


def prepare_analysis_text(text: Any) -> Dict[str, str]:
    original = clean_input_text(text)
    translated = translate_to_english(original)
    analysis_text = translated if normalize_text(translated) != normalize_text(original) else original
    return {
        "original": original,
        "translated": translated,
        "analysis_text": analysis_text
    }


# =========================================================
# SIGNAL DETECTION
# =========================================================
def detect_soft_distress(text: str) -> bool:
    t = normalize_text(text)
    phrases = [
        "feeling off", "feel off", "a bit off", "not feeling well", "not okay",
        "unwell", "tired", "weak", "dizzy", "sick", "pain", "fever",
        "cannot breathe", "can't breathe", "breathing problem", "heart beating",
        "chest pain", "shortness of breath", "something feels off", "feels off",
        "feels wrong", "not right", "weird feeling", "i feel strange",
        "something feels really wrong", "something is wrong here",
        "things feel wrong", "not feeling safe", "unsafe here", "i feel unsafe",
        "people are scared", "people are panicking", "we are scared",
        "i feel danger", "danger around", "something is not right",
        "weird situation", "something strange happening"
    ]
    return any(phrase in t for phrase in phrases)


def detect_emotions(text: str) -> list:
    t = normalize_text(text)
    emotions = []
    if any(word in t for word in ["scared", "afraid", "panic", "panicking", "terrified", "worried", "anxious", "fear", "unsafe", "danger", "threat"]):
        emotions.append("fear")
    if any(word in t for word in ["panic", "panicking", "chaos", "frightened", "frightening", "alarm", "emergency", "screaming"]):
        emotions.append("panic")
    if any(word in t for word in ["distress", "distressed", "stress", "unsafe", "trouble"]):
        emotions.append("distress")
    return emotions


def detect_context_signals(text: str) -> list:
    t = normalize_text(text)
    contexts = []
    if any(phrase in t for phrase in ["many people", "lots of people", "everyone", "our area", "my area", "near me", "around here", "nearby", "in the area", "whole village", "whole town", "community", "neighborhood", "neighbourhood", "around us"]):
        contexts.append("area-wide impact")
    if any(word in t for word in ["many", "several", "lots", "crowd", "everyone"]):
        contexts.append("many people affected")
    if any(word in t for word in ["near me", "nearby", "around here"]):
        contexts.append("local urgency")
    return contexts


def category_scores(text: str) -> Dict[str, int]:
    t = normalize_text(text)
    words = t.split()

    scores = {
        "Disaster": 0,
        "Food": 0,
        "Healthcare": 0,
        "Education": 0,
        "General": 0,
    }

    for category, keywords in CATEGORY_KEYWORDS.items():
        for key in keywords:
            if key in t:
                scores[category] += 2

    for category, keywords in CATEGORY_KEYWORDS.items():
        for word in words:
            for key in keywords:
                if similarity(word, key) > 0.72:
                    scores[category] += 1

    if "no food" in t or "no food for days" in t or "starving" in t:
        scores["Food"] += 3

    if "cannot breathe" in t or "can't breathe" in t or "not breathing" in t:
        scores["Healthcare"] += 4

    if "house on fire" in t or "fire" in t:
        scores["Disaster"] += 3

    if "water rising" in t or "flood" in t:
        scores["Disaster"] += 3

    if "school" in t and ("no teachers" in t or "no books" in t):
        scores["Education"] += 3

    if "police" in t or "ambulance" in t or "doctor" in t or "hospital" in t:
        scores["General"] += 2

    return scores


def has_strong_issue_signal(text: str) -> bool:
    t = normalize_text(text)
    if not t:
        return False
    if detect_soft_distress(t):
        return True
    if any(k in t for k in ALL_CATEGORY_KEYWORDS):
        return True
    if any(a in t for a in ACTIONABLE_HINTS):
        return True
    if detect_emotions(t):
        return True
    return False


# =========================================================
# VOICE INPUT
# =========================================================
def get_voice_input(language: str = "en-US") -> str:
    if sr is None:
        print("SpeechRecognition is not installed.")
        return ""

    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("\n🎤 Speak now...")
            recognizer.adjust_for_ambient_noise(source, duration=1)
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=12)

        try:
            text = recognizer.recognize_google(audio, language=language)
            print(f"🗣 You said: {text}")
            return text
        except sr.UnknownValueError:
            print("❌ Could not understand the audio.")
            return ""
        except sr.RequestError:
            print("❌ Speech recognition service error.")
            return ""
    except Exception as e:
        print(f"❌ Voice input error: {e}")
        return ""


# =========================================================
# LLM PROMPTING
# =========================================================
def build_llm_prompt(original_text: str, translated_text: str) -> str:
    return f"""
You are a real-world problem detection AI.

Your job:
1. Decide whether the input describes a real actionable issue.
2. If yes, classify it into:
   - Disaster
   - Food
   - Healthcare
   - Education
   - General
3. If it is casual talk, nonsense, greeting, joke, or not actionable, return "None".
4. Assign urgency:
   - High
   - Medium
   - Low
   - None

Important:
- Understand meaning, not just keywords.
- Handle slang, broken English, voice transcript mistakes, and mixed language.
- If the input sounds concerning but unclear, use "General".
- If there is fear, danger, panic, emergency, or severe health risk, increase priority.
- Output JSON only. No markdown. No extra text.

Return exactly:
{{
  "category": "Disaster | Food | Healthcare | Education | General | None",
  "priority": "High | Medium | Low | None",
  "confidence": "0-100%",
  "reasoning": "short human-like explanation"
}}

Original input:
{json.dumps(original_text, ensure_ascii=False)}

Translated input if available:
{json.dumps(translated_text, ensure_ascii=False)}
""".strip()


def extract_json_object(raw_text: str) -> Dict[str, Any]:
    default = {
        "category": "General",
        "priority": "Low",
        "confidence": "85%",
        "reasoning": ""
    }

    if not raw_text:
        return default

    text = str(raw_text).strip()
    text = re.sub(r"```(?:json)?", "", text, flags=re.IGNORECASE).strip()

    try:
        data = json.loads(text)
        if isinstance(data, dict):
            category = sanitize_category(data.get("category"), default="General")
            priority_default = "None" if category == "None" else "Low"
            priority = sanitize_priority(data.get("priority"), default=priority_default)
            if category == "None":
                priority = "None"
            return {
                "category": category,
                "priority": priority,
                "confidence": sanitize_confidence(data.get("confidence")),
                "reasoning": str(data.get("reasoning", "")).strip(),
            }
    except Exception:
        pass

    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            data = json.loads(match.group())
            if isinstance(data, dict):
                category = sanitize_category(data.get("category"), default="General")
                priority_default = "None" if category == "None" else "Low"
                priority = sanitize_priority(data.get("priority"), default=priority_default)
                if category == "None":
                    priority = "None"
                return {
                    "category": category,
                    "priority": priority,
                    "confidence": sanitize_confidence(data.get("confidence")),
                    "reasoning": str(data.get("reasoning", "")).strip(),
                }
        except Exception:
            pass

    return default



def is_llm_output_valid(parsed: Dict[str, Any], text: str) -> bool:
    try:
        confidence = confidence_to_int(parsed.get("confidence"), default=0)

        # 🔥 Only reject if REALLY bad
        if confidence < 25:
            return False

        # If LLM says None but text clearly has strong signals → reject
        if parsed.get("category") == "None" and has_strong_issue_signal(text):
            return False

        return True
    except Exception:
        return False



def call_llm(original_text: str, translated_text: str) -> Optional[Dict[str, Any]]:
    if not API_KEY or requests is None:
        return None

    prompt = build_llm_prompt(original_text, translated_text)
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "ReliefLink AI+",
    }
    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
    }

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=15
        )
        if response.status_code != 200:
            return None

        data = response.json()
        if not isinstance(data, dict):
            return None

        choices = data.get("choices")
        if not choices or not isinstance(choices, list):
            return None

        raw = choices[0].get("message", {}).get("content", "")
        return extract_json_object(raw)
    except Exception:
        return None


# =========================================================
# FALLBACK RULE ENGINE
# =========================================================
def rule_based_analysis(text: str) -> Dict[str, Any]:
    t = normalize_text(text)

    if not t:
        return {
            "category": "None",
            "priority": "None",
            "confidence": "100%",
            "reasoning": "Empty input."
        }

    if t in NO_ISSUE_PHRASES and not has_strong_issue_signal(t):
        return {
            "category": "None",
            "priority": "None",
            "confidence": "100%",
            "reasoning": "No actionable issue detected."
        }

    if t in {"help", "help me", "please help", "need help"}:
        return {
            "category": "General",
            "priority": "Medium",
            "confidence": "75%",
            "reasoning": "General help request detected."
        }

    scores = category_scores(t)
    words = t.split()

    if "no food" in t or "no food for days" in t or "starving" in t:
        scores["Food"] += 3

    if "cannot breathe" in t or "can't breathe" in t or "not breathing" in t:
        scores["Healthcare"] += 4

    if "house on fire" in t or "fire" in t:
        scores["Disaster"] += 3

    if "water rising" in t or "flood" in t:
        scores["Disaster"] += 3

    if "school" in t and ("no teachers" in t or "no books" in t):
        scores["Education"] += 3

    if any(w in t for w in ["urgent", "emergency", "immediately", "critical", "severe", "danger", "warning"]):
        scores["General"] += 1

    category = max(scores, key=scores.get)
    if scores[category] == 0:
        category = "General"

    emotions = detect_emotions(t)
    contexts = detect_context_signals(t)

    priority_score = 0
    if any(w in t for w in ["urgent", "emergency", "immediately", "critical", "severe", "danger", "warning"]):
        priority_score += 2
    if any(w in t for w in ["help", "need", "needed", "problem", "issue", "wrong", "cannot", "can't", "stuck", "unsafe"]):
        priority_score += 1
    if category == "Healthcare" and any(w in t for w in ["breathing", "unconscious", "cannot breathe", "heart", "chest pain", "bleeding"]):
        priority_score += 3
    if category == "Disaster" and any(w in t for w in ["flood", "fire", "storm", "earthquake", "collapse"]):
        priority_score += 2
    if category == "Food" and any(w in t for w in ["no food", "hungry", "starving", "food shortage"]):
        priority_score += 2
    if emotions:
        priority_score += 1
    if contexts:
        priority_score += 1

    if priority_score >= 4:
        priority = "High"
    elif priority_score >= 2:
        priority = "Medium"
    else:
        priority = "Low"

    confidence = min(96, 45 + scores.get(category, 0) * 12 + priority_score * 10)
    if category == "General":
        confidence = max(55, confidence)

    return {
        "category": category,
        "priority": priority,
        "confidence": f"{confidence}%",
        "reasoning": "Fallback rule-based classification."
    }


# =========================================================
# VOLUNTEER MATCHING
# =========================================================
def volunteer_score(volunteer: Dict[str, Any], category: str, text: str = "") -> float:
    score = float(volunteer.get("trust", 0) or 0)

    skill = str(volunteer.get("skill", "")).strip()
    if skill == category:
        score += 50

    available = str(volunteer.get("available", "")).strip().lower()
    if available in {"true", "yes", "available", "1"}:
        score += 5

    volunteer_location = normalize_text(volunteer.get("location", ""))
    if volunteer_location and volunteer_location in normalize_text(text):
        score += 5

    return score


def match_volunteer(category: str, volunteers: Any, text: str = "") -> Dict[str, Any]:
    if not isinstance(volunteers, list):
        volunteers = []

    if category == "None":
        return {"name": None, "trust": None, "skill": None}

    valid_volunteers = [v for v in volunteers if isinstance(v, dict) and "name" in v]
    if not valid_volunteers:
        return {"name": "Nearest Available Volunteer", "trust": None, "skill": None}

    matched = [v for v in valid_volunteers if str(v.get("skill", "")).strip() == category]
    pool = matched if matched else valid_volunteers

    best = max(pool, key=lambda v: volunteer_score(v, category, text))
    return best


def generate_explanation(volunteer, category, reasoning=""):
    if category == "None":
        return "Input does not indicate a real-world issue."

    name = volunteer.get("name") if volunteer else None
    trust = volunteer.get("trust") if volunteer else None

    base = f"This case was classified under {category}."

    if reasoning:
        base += f" {reasoning}"

    if name:
        base += f" Assigned to {name} based on relevant expertise"
        if trust:
            base += f" and trust score ({trust})."
    else:
        base += " Assigned to nearest available volunteer."

    return base


# =========================================================
# PREDICTION
# =========================================================
def update_prediction(category: str) -> Optional[str]:
    if category not in {"Disaster", "Food", "Healthcare", "Education"}:
        return None

    issue_counts[category] += 1

    if issue_counts[category] >= 3:
        return f"⚠️ Repeated {category} reports detected. Trend indicates rising risk."
    if issue_counts[category] == 2:
        return f"⚠️ Multiple {category} reports detected. Risk may be increasing."

    return None


# =========================================================
# MAIN ANALYZER
# =========================================================
def analyze_text(text: Any) -> Dict[str, Any]:
    prepared = prepare_analysis_text(text)
    original = prepared["original"]
    translated = prepared["translated"]
    analysis_text = prepared["analysis_text"]

    if not original:
        return {
            "category": "None",
            "priority": "None",
            "confidence": "100%",
            "reasoning": "Empty input."
        }

    # 🔥 LLM FIRST (PRIMARY BRAIN)
    llm_result = call_llm(original, translated)

    if isinstance(llm_result, dict):
        # Light validation only (no strict blocking)
        if not is_llm_output_valid(llm_result, analysis_text):
            # If LLM is clearly bad → fallback
            return rule_based_analysis(analysis_text)

        category = sanitize_category(llm_result.get("category"), default="General")
        priority_default = "None" if category == "None" else "Low"
        priority = sanitize_priority(llm_result.get("priority"), default=priority_default)

        if category == "None":
            priority = "None"

        return {
            "category": category,
            "priority": priority,
            "confidence": sanitize_confidence(llm_result.get("confidence")),
            "reasoning": str(llm_result.get("reasoning", "")).strip()
        }

    # ⚠️ ONLY if LLM completely fails
    return rule_based_analysis(analysis_text)


# =========================================================
# PUBLIC API
# =========================================================
def process_input(text: Any, volunteers: Any = None) -> Dict[str, Any]:
    prepared = prepare_analysis_text(text)
    original = prepared["original"]
    analysis_text = prepared["analysis_text"]

    ai = analyze_text(original)

    category = sanitize_category(ai.get("category"), default="General")
    priority_default = "None" if category == "None" else "Low"
    priority = sanitize_priority(ai.get("priority"), default=priority_default)
    confidence = sanitize_confidence(ai.get("confidence"), default="85%")
    reasoning = str(ai.get("reasoning", "")).strip()

    if category == "None":
        return {
            "category": "None",
            "priority": "None",
            "volunteer": None,
            "explanation": "No actionable issue detected.",
            "risk": None,
            "confidence": confidence
        }

    volunteers = volunteers if isinstance(volunteers, list) else []
    volunteer = match_volunteer(category, volunteers, analysis_text)
    explanation = generate_explanation(volunteer, category, reasoning=reasoning)
    risk = update_prediction(category)

    return {
        "category": category,
        "priority": priority,
        "volunteer": volunteer.get("name"),
        "explanation": explanation,
        "risk": risk,
        "confidence": confidence
    }


# =========================================================
# LOCAL TEST / INTERACTIVE RUN
# =========================================================
if __name__ == "__main__":
    sample_volunteers = [
        {"name": "Ravi", "skill": "Disaster", "trust": 9},
        {"name": "Anjali", "skill": "Food", "trust": 8},
        {"name": "Kiran", "skill": "Healthcare", "trust": 7},
        {"name": "Meena", "skill": "Education", "trust": 6},
        {"name": "Suresh", "skill": "General", "trust": 5},
    ]

    print("ReliefLink AI+ System")
    print("Type 'exit' to quit")
    print("Type 'v' to use voice input\n")

    while True:
        try:
            mode = input("Mode (t = type, v = voice): ").strip().lower()
        except KeyboardInterrupt:
            print("\nExiting...")
            break

        if mode == "exit":
            break

        if mode == "v":
            lang = input("Voice language code [en-US]: ").strip() or "en-US"
            text = get_voice_input(language=lang)
            if not text:
                continue
        else:
            text = input("Enter problem: ").strip()

        if text.lower() == "exit":
            break

        result = process_input(text, sample_volunteers)

        print("\nOUTPUT:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print()