import requests

API_KEY = "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"

url = "https://openrouter.ai/api/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

data = {
    "model": "openai/gpt-3.5-turbo",
    "messages": [
        {"role": "user", "content": "Say hello in one word"}
    ]
}

print("Sending request...")

response = requests.post(url, headers=headers, json=data)

print("Status Code:", response.status_code)
print("Raw Response:", response.text)