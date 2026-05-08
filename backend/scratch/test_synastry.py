import requests
import json

url = "http://localhost:8000/calculate/compare/"
payload = {
    "person_a": {
        "name": "Person A",
        "year": 1990, "month": 1, "day": 1, "hour": 12, "minute": 0,
        "lat": 13.75, "lon": 100.5, "timezone": "Asia/Bangkok"
    },
    "person_b": {
        "name": "Person B",
        "year": 1995, "month": 5, "day": 15, "hour": 9, "minute": 30,
        "lat": 13.75, "lon": 100.5, "timezone": "Asia/Bangkok"
    }
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    if response.ok:
        data = response.json()
        print("Success! Got two charts.")
        print(f"Person A Lagna: {data['person_a_chart']['lagna']['longitude']}")
        print(f"Person B Lagna: {data['person_b_chart']['lagna']['longitude']}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Failed to connect: {e}")
