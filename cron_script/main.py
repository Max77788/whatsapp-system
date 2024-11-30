import os
import requests
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

# Load environment variables
BASE_URL = os.environ.get("BASE_URL")
CRON_SECRET = os.environ.get("CRON_SECRET")

def send_cron_request():
    try:
        # Construct the request URL
        url = f"{BASE_URL}/api/cron"

        # Send the GET request with Authorization header
        headers = {"Authorization": CRON_SECRET}
        response = requests.get(url, headers=headers)

        # Log the response
        if response.status_code == 200:
            print("Request successful:", response.text)
        else:
            print(f"Request failed with status {response.status_code}: {response.text}")
    except Exception as e:
        print(f"Error during request: {e}")

if __name__ == "__main__":
    send_cron_request()
