import urllib.request
import json

url = "http://localhost:8000/calculate/compare/"
payload = {
    "person_a": {
        "year": 1990, "month": 1, "day": 1, "hour": 12, "minute": 0,
        "lat": 13.75, "lon": 100.5, "timezone": "Asia/Bangkok"
    },
    "person_b": {
        "year": 1995, "month": 5, "day": 15, "hour": 9, "minute": 30,
        "lat": 13.75, "lon": 100.5, "timezone": "Asia/Bangkok"
    }
}

req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as f:
        res = f.read()
        data = json.loads(res)
        print("Success! Got data for both charts.")
        print(f"Person A Julian Date: {data['person_a_chart']['julian_date']}")
except Exception as e:
    print(f"Error: {e}")
