import requests
import re

from bs4 import BeautifulSoup
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

def generate_confirmation_link(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    url = f"http://localhost:3000/confirm-email/{uid}/{token}/"
    return url

def generate_reset_token(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_url = f"http://localhost:3000/reset-password/{uid}/{token}/"

    return reset_url

def fetch_day_ahead_market_price():
    url = "https://www.opcom.ro/anunturi-stiri-pp/en/1"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        announcements = soup.select("div#contp li")

        for li in announcements:
            text = li.get_text(separator=" ", strip=True)
            match = re.search(r"weighted average price of the Day Ahead Market for (.*?) amounting to ([\d.,]+) lei/MWh", text)
            if match:
                month_year = match.group(1)
                price_str = match.group(2).replace(",", ".")
                return {
                    "month_year": month_year,
                    "price_lei_per_MWh": float(price_str)
                }

        return {"error": "Price announcement not found in the page content."}

    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {e}"}