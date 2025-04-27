import os
import pandas as pd
import psycopg2
from datetime import date

def csv_db_write(csv_path: str, plant_id: int = 1):
    df = pd.read_csv(csv_path)

    conn = psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("HOST_DB"),
        port=os.getenv("PORT_DB"),
    )
    cur = conn.cursor()

    insert_query = """
    INSERT INTO apiapp_plantdata (
        plant_id,
        plant_name,
        inverter_name,
        total_string_capacity_kwp,
        yield_kwh,
        total_yield_kwh,
        specific_energy_kwh_per_kwp,
        peak_ac_power_kw,
        grid_connection_duration_h,
        load_date,
        read_date
        
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    today = date.today()
    for _, row in df.iterrows():
        cur.execute(insert_query, (
            plant_id,
            row["Plant Name"],
            row["Device Name"],
            row["Total String Capacity (kWp)"],
            row["Yield (kWh)"],
            row["Total Yield (kWh)"],
            row["Specific Energy (kWh/kWp)"],
            row["Peak AC Power (kW)"],
            row["Grid Connection Duration (h)"],
            today,  # read_date
            today,
        ))

    conn.commit()
    cur.close()
    conn.close()

    print(f"✅ Wrote {len(df)} records to DB for plant_id={plant_id}")
