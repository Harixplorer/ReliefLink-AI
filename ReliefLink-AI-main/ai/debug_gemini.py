from google import genai

# 👉 PUT YOUR API KEY HERE (or leave as is, fallback will handle)
client = genai.Client(api_key="AIzaSyC1_Ne4tLd4zf8yBwAfdabdueyVnzt2i4M")


def safe_generate(prompt):
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt
        )
        return response.text
    except Exception as e:
        return f"ERROR: {e}"


def test_connection():
    print("=== Testing Connection ===")
    result = safe_generate("Say hello in one word")

    if "ERROR" in result:
        print("❌ Gemini NOT working")
        print(result)
    else:
        print("✅ Gemini Working")
        print("Response:", result)


def test_classification():
    print("\n=== Testing Classification ===")

    prompt = """
Analyze this input and return ONLY JSON.

Input: "Flood in my area urgent"

Output:
{
  "category": "Disaster | Food | Healthcare | Education | General",
  "priority": "High | Medium | Low"
}

Only return JSON.
"""

    result = safe_generate(prompt)

    if "ERROR" in result:
        print("❌ Classification Failed")
        print(result)
    else:
        print("🧠 Classification Result:")
        print(result)


if __name__ == "__main__":
    test_connection()
    test_classification()