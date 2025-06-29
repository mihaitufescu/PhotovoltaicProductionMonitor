import tempfile
import csv
import io
import json

def save_csv_string_to_file(csv_string: str) -> str:
    data = json.loads(csv_string)

    if isinstance(data, dict):
        data = [data]

    if not data or not isinstance(data, list):
        raise ValueError("Fișierul CSV este gol sau are o structură greșită.")

    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False, newline='') as tmpfile:
        writer = csv.DictWriter(tmpfile, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        return tmpfile.name

def convert_json_to_csv_file(json_string: str) -> str:
    data = json.loads(json_string)

    if isinstance(data, dict):
        data = [data]

    if not data:
        raise ValueError("Fisier gol")

    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False, newline='') as tmpfile:
        writer = csv.DictWriter(tmpfile, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        return tmpfile.name
