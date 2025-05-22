import tempfile
import csv
import io
import json

def save_csv_string_to_file(csv_string: str) -> str:
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as tmpfile:
        tmpfile.write(csv_string)
        return tmpfile.name

def convert_json_to_csv_file(json_string: str) -> str:
    # parse JSON string to list of dicts
    data = json.loads(json_string)

    # Ensure it's a list of dicts, if not wrap it
    if isinstance(data, dict):
        data = [data]

    if not data:
        raise ValueError("Empty JSON data")

    # Write to CSV tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False, newline='') as tmpfile:
        writer = csv.DictWriter(tmpfile, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        return tmpfile.name
