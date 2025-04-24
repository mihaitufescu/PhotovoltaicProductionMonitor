from dagster import asset
from dagster_app.custom_jobs.scrape_inverter import run_fusionsolar_scraper
from dagster_app.custom_jobs.convert_xlxs_to_csv import convert_xlxs_to_csv
from dagster_app.custom_jobs.csv_db_write import csv_db_write

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