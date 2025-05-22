import os
import json
import psycopg2
import csv
from datetime import date

def csv_db_write(csv_path:str):

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
        total_string_capacity_kwp,
        yield_kwh,
        total_yield_kwh,
        specific_energy_kwh_per_kwp,
        peak_ac_power_kw,
        grid_connection_duration_h,
        read_date,
        load_date
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    today = date.today()

    
    
    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        data = list(reader)
    print(f"csv_db_write got data: {repr(data)}")  # show exactly what data is
    # Then proceed with inserting `data` as before
    entry = data[0]
    read_date = entry.get("read_date")

    cur.execute(insert_query, (
        entry.get("plant_id"),
        entry.get("total_string_capacity_kwp"),
        entry.get("yield_kwh"),
        entry.get("total_yield_kwh"),
        entry.get("specific_energy_kwh_per_kwp"),
        entry.get("peak_ac_power_kw"),
        entry.get("grid_connection_duration_h"),
        read_date,
        today,  # load_date
    ))

    conn.commit()
    cur.close()
    conn.close()

    print(f"✅ Wrote 1 record to DB for plant_id={entry.get('plant_id')}")
