from dagster import asset
from dagster_app.custom_jobs.scrape_inverter import run_fusionsolar_scraper
from dagster_app.custom_jobs.convert_xlxs_to_csv import convert_xlxs_to_csv
from dagster_app.custom_jobs.csv_db_write import csv_db_write
from dagster_app.custom_jobs.file_handling import save_csv_string_to_file, convert_json_to_csv_file

@asset
def download_fusionsolar_report():
    save_path = run_fusionsolar_scraper()
    return save_path

@asset
def convert_report_to_csv(download_fusionsolar_report):
    csv_path = convert_xlxs_to_csv(download_fusionsolar_report)
    return csv_path

@asset
def write_report_to_db(convert_report_to_csv):
    csv_db_write(convert_report_to_csv)
    return True

@asset(config_schema={"file_data": str, "file_type": str})  # file_type: 'csv' or 'json'
def ingest_file_asset(context) -> str:
    file_data = context.op_config["file_data"]
    file_type = context.op_config["file_type"].lower()

    if file_type == "csv":
        csv_path = save_csv_string_to_file(file_data)
        context.log.info(f"CSV data saved to {csv_path}")
    elif file_type == "json":
        csv_path = convert_json_to_csv_file(file_data)
        context.log.info(f"JSON converted to CSV and saved to {csv_path}")
    else:
        raise ValueError(f"Unsupported file_type: {file_type}")

    return csv_path

@asset
def write_to_db_asset(ingest_file_asset: str) -> bool:
    csv_db_write(ingest_file_asset)
    return True
