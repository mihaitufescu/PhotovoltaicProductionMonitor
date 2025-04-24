from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException
import time, os
import glob
from dotenv import load_dotenv


def run_fusionsolar_scraper() -> str:
    load_dotenv()

    chrome_options = webdriver.ChromeOptions()
    chrome_options.binary_location = "/usr/bin/chromium"  # In Docker, Chromium usually lives here
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Set downloads folder
    download_dir = os.getenv("DAGSTER_DOWNLOAD_DIR", "/dagster-home/downloads")
    os.makedirs(download_dir, exist_ok=True)

    chrome_options.add_experimental_option("prefs", {
        "download.default_directory": download_dir,
        "download.prompt_for_download": False,
        "directory_upgrade": True
    })

    # Automatically handles compatible ChromeDriver
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager(driver_version="135.0.7049.95").install()),
        options=chrome_options
    )

    try:
        driver.get(os.getenv("FUSION_URL"))
        time.sleep(2)

        driver.find_element(By.ID, "usernameInput").find_element(By.ID, "username").send_keys(os.getenv("FUSION_USER"))
        driver.find_element(By.ID, "passwordInput").find_element(By.ID, "value").send_keys(os.getenv("FUSION_PASSWORD"), Keys.RETURN)

        try:
            approve_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, '//button[contains(@class, "dpdesign-btn-primary") and contains(text(), "Approve")]'))
            )
            approve_btn.click()
            time.sleep(5)
        except TimeoutException:
            pass

        time.sleep(10)
        driver.find_element(By.XPATH, '//button[@class="dpdesign-modal-close" and @aria-label="Close"]').click()
        time.sleep(5)

        actions = ActionChains(driver)
        actions.move_to_element(driver.find_element(By.ID, "pvmsReport")).perform()
        time.sleep(3)

        driver.find_element(By.XPATH, '//a[span[@id="pvmsInverterReport"]]').click()
        time.sleep(5)

        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "tree-toggle-show"))
        ).click()
        time.sleep(5)

        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(@class, 'ant-btn') and contains(text(), 'Export')]"))
        ).click()
        time.sleep(5)

        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//a[@title='Download']"))
        ).click()
        time.sleep(5)

        list_of_files = glob.glob(os.path.join(download_dir, '*.xlsx'))
        if not list_of_files:
            raise Exception("No .xlsx files found in the download directory")

        latest_file = max(list_of_files, key=os.path.getctime)
        
        return latest_file

    finally:
        driver.quit()
