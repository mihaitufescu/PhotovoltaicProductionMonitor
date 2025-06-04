import psycopg2
import os

def insert_new_alert_logs():
    conn = psycopg2.connect(
        dbname=os.getenv("POSTGRES_DB"),
        user=os.getenv("POSTGRES_USER"),
        password=os.getenv("POSTGRES_PASSWORD"),
        host=os.getenv("HOST_DB"),
        port=os.getenv("PORT_DB"),
    )
    cur = conn.cursor()

    # Step 1: Invalidate old alert logs
    cur.execute("""
        WITH latest_data AS (
            SELECT DISTINCT ON (pd.plant_id)
                pd.id AS plant_data_id,
                pd.plant_id,
                pd.read_date
            FROM apiapp_plantdata pd
            WHERE pd.load_date::date = CURRENT_DATE
              AND pd.is_valid = TRUE
            ORDER BY pd.plant_id, pd.read_date DESC, pd.load_date DESC
        )
        UPDATE apiapp_alertlog al
        SET is_valid = FALSE
        FROM latest_data ld
        JOIN apiapp_alarmplant ap ON ap.plant_id = ld.plant_id
        WHERE al.plant_data_id = ld.plant_data_id
          AND al.metric_type = ap.metric_type
          AND al.is_valid = TRUE;
    """)
    print(f"Invalidated {cur.rowcount} rows")
    conn.commit()

    # Step 2: Insert new alert logs
    cur.execute("""
        WITH latest_data AS (
            SELECT DISTINCT ON (pd.plant_id)
                pd.id AS plant_data_id,
                pd.plant_id,
                pd.read_date,
                pd.yield_kwh,
                pd.peak_ac_power_kw,
                pd.specific_energy_kwh_per_kwp
            FROM apiapp_plantdata pd
            WHERE pd.load_date::date = CURRENT_DATE
              AND pd.is_valid = TRUE
            ORDER BY pd.plant_id, pd.read_date DESC, pd.load_date DESC
        ),
        recent_avg AS (
            SELECT
                pd.plant_id,
                ap.threshold_value,
                AVG(pd.yield_kwh) AS avg_value
            FROM apiapp_plantdata pd
            JOIN apiapp_alarmplant ap ON ap.plant_id = pd.plant_id
            JOIN latest_data ld ON ld.plant_id = pd.plant_id
                AND pd.read_date >= ld.read_date - INTERVAL '7 days'
                AND pd.read_date <= ld.read_date
            WHERE pd.is_valid = TRUE
            GROUP BY pd.plant_id, ap.threshold_value
            HAVING COUNT(DISTINCT pd.read_date) >= 5
        )
        INSERT INTO apiapp_alertlog (
            plant_id,
            plant_data_id,
            read_date,
            status,
            metric_type,
            threshold_value,
            actual_value,
            triggered_at,
            avg_value,
            is_valid,
            unread
        )
        SELECT
            ld.plant_id,
            ld.plant_data_id,
            ld.read_date,
            CASE 
                WHEN ra.avg_value IS NULL THEN 'n/a'
                WHEN ap.metric_type = 'yield' AND ld.yield_kwh < ra.avg_value * (ap.threshold_value / 100.0) THEN 'triggered'
                WHEN ap.metric_type = 'power' AND ld.peak_ac_power_kw < ra.avg_value * (ap.threshold_value / 100.0) THEN 'triggered'
                WHEN ap.metric_type = 'specific_energy' AND ld.specific_energy_kwh_per_kwp < ra.avg_value * (ap.threshold_value / 100.0) THEN 'triggered'
                ELSE 'ok'
            END,
            ap.metric_type,
            COALESCE(ra.avg_value * (ap.threshold_value / 100.0), -1),
            CASE 
                WHEN ap.metric_type = 'yield' THEN ld.yield_kwh
                WHEN ap.metric_type = 'power' THEN ld.peak_ac_power_kw
                WHEN ap.metric_type = 'specific_energy' THEN ld.specific_energy_kwh_per_kwp
            END,
            CASE 
                WHEN ra.avg_value IS NOT NULL AND (
                    (ap.metric_type = 'yield' AND ld.yield_kwh < ra.avg_value * (ap.threshold_value / 100.0)) OR
                    (ap.metric_type = 'power' AND ld.peak_ac_power_kw < ra.avg_value * (ap.threshold_value / 100.0)) OR
                    (ap.metric_type = 'specific_energy' AND ld.specific_energy_kwh_per_kwp < ra.avg_value * (ap.threshold_value / 100.0))
                ) THEN NOW()
                ELSE NULL
            END,
            COALESCE(ra.avg_value, -1),
            TRUE,
            TRUE
        FROM latest_data ld
        JOIN apiapp_alarmplant ap ON ap.plant_id = ld.plant_id
        LEFT JOIN recent_avg ra ON ra.plant_id = ld.plant_id
        WHERE NOT EXISTS (
            SELECT 1
            FROM apiapp_alertlog al
            WHERE al.plant_data_id = ld.plant_data_id
              AND al.metric_type = ap.metric_type
              AND al.is_valid = TRUE
              AND al.actual_value = CASE 
                    WHEN ap.metric_type = 'yield' THEN ld.yield_kwh
                    WHEN ap.metric_type = 'power' THEN ld.peak_ac_power_kw
                    WHEN ap.metric_type = 'specific_energy' THEN ld.specific_energy_kwh_per_kwp
              END
              AND al.status = CASE 
                    WHEN ra.avg_value IS NULL THEN 'n/a'
                    WHEN ap.metric_type = 'yield' AND ld.yield_kwh < ra.avg_value * (ap.threshold_value / 100.0) THEN 'triggered'
                    WHEN ap.metric_type = 'power' AND ld.peak_ac_power_kw < ra.avg_value * (ap.threshold_value / 100.0) THEN 'triggered'
                    WHEN ap.metric_type = 'specific_energy' AND ld.specific_energy_kwh_per_kwp < ra.avg_value * (ap.threshold_value / 100.0) THEN 'triggered'
                    ELSE 'ok'
              END
        )
    """)

    print(f"Inserted {cur.rowcount} rows")
    conn.commit()
    cur.close()
    conn.close()
