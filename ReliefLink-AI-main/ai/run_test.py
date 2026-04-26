import json

try:
    import speech_recognition as sr
except Exception:
    sr = None

from logic import process_input


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


volunteers = [
    {"name": "Ravi", "skill": "Disaster", "trust": 9},
    {"name": "Anjali", "skill": "Food", "trust": 8},
    {"name": "Kiran", "skill": "Healthcare", "trust": 7},
    {"name": "Meena", "skill": "Education", "trust": 6},
]


print("\nReliefLink AI+ System")
print("Type 'exit' anytime to quit")

while True:
    try:
        mode = input("\nMode (t = type, v = voice): ").strip().lower()
    except KeyboardInterrupt:
        print("\nExiting...")
        break

    if mode == "exit":
        break

    if mode == "v":
        text = get_voice_input()
        if not text:
            continue
    else:
        text = input("Enter problem: ").strip()

    if text.lower() == "exit":
        break

    result = process_input(text, volunteers)

    print("\nOUTPUT:")
    print(json.dumps(result, indent=2, ensure_ascii=False))