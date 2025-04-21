from dagster import define_asset_job, Definitions, load_assets_from_modules
from dagster_app import assets

all_assets = load_assets_from_modules([assets])

fusionsolar_job = define_asset_job("fusionsolar_pipeline", selection="*")

defs = Definitions(
    assets=all_assets,
    jobs=[fusionsolar_job],
)
