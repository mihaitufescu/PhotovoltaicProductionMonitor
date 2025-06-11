import os
import json
import psycopg2
import csv
from datetime import date

def delete_old_alert_logs():
    conn = psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("HOST_DB"),
        port=os.getenv("PORT_DB"),
    )
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM apiapp_alertlog
        WHERE read_date < CURRENT_DATE - INTERVAL '365 days'
        """)

    deleted_rows = cur.rowcount 
    conn.commit()
    cur.close()
    conn.close()
    print(f" Deleted {deleted_rows} old alert logs.")