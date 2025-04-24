import pandas as pd
import os

def convert_xlxs_to_csv(load_path: str) -> str:
    # Default to env var or fallback to absolute path
    if not load_path:
        load_path = os.getenv("DAGSTER_DOWNLOAD_DIR", "/dagster-home/downloads")

        xlsx_files = [f for f in os.listdir(load_path) if f.endswith(".xlsx")]
    
        if not xlsx_files:
            raise FileNotFoundError(f"No .xlsx files found in: {load_path}")
        
        xlsx_file = max(xlsx_files, key=lambda f: os.path.getctime(os.path.join(load_path, f)))
        load_path= os.path.join(load_path, xlsx_file)
    if not os.path.exists(load_path):
        raise FileNotFoundError(f"File not found: {load_path}")
    csv_save_path = load_path.replace("Inverter ","")
    csv_save_path = csv_save_path.replace(".xlsx", ".csv")

    df = pd.read_excel(load_path, header=1)
    df.to_csv(csv_save_path, index=False)

    print(f"✅ Excel to CSV conversion done: {csv_save_path}")
    return csv_save_path
