from dagster import define_asset_job, Definitions, load_assets_from_modules, ScheduleDefinition
from dagster_app import assets

all_assets = load_assets_from_modules([assets])

fusionsolar_job = define_asset_job(
    "fusionsolar_pipeline", 
    selection=["download_fusionsolar_report", "convert_report_to_csv"]
)

file_ingestion_job = define_asset_job(
    "file_ingestion_pipeline",
    selection=["ingest_file_asset", "write_to_db_asset"],
)

alerts_job = define_asset_job(
    "alerts_pipeline",
    selection=["delete_old_alerts", "insert_alerts"],
)

alert_schedule = ScheduleDefinition(
    job=alerts_job,
    cron_schedule="*/15 * * * *",  # every 15 minutes
)

defs = Definitions(
    assets=all_assets,
    jobs=[fusionsolar_job, file_ingestion_job, alerts_job],
    schedules=[alert_schedule],
)
