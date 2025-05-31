from dagster import define_asset_job, Definitions, load_assets_from_modules
from dagster_app import assets

all_assets = load_assets_from_modules([assets])

fusionsolar_job = define_asset_job("fusionsolar_pipeline", selection=["download_fusionsolar_report", "convert_report_to_csv", "write_report_to_db"])

file_ingestion_job = define_asset_job(
    "file_ingestion_pipeline",
    selection=["ingest_file_asset", "write_to_db_asset"],
)

defs = Definitions(
    assets=all_assets,
    jobs=[fusionsolar_job, file_ingestion_job],
)
