FROM python:3.12-slim

# Set working directory
WORKDIR /dagster-app

# Copy requirements.txt and install Python dependencies
COPY requirements.txt .

# Set GitHub token as an ARG
ARG GITHUB_TOKEN

RUN apt-get update && apt-get install -y \
    wget curl unzip gnupg ca-certificates \
    fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 \
    libxcomposite1 libxdamage1 libxrandr2 xdg-utils libu2f-udev libvulkan1 \
    chromium && \
    apt-get clean

# Set environment variables
ENV CHROME_BIN=/usr/bin/chromium
ENV PATH=$PATH:/usr/bin

# Install latest matching ChromeDriver manually
RUN CHROME_VERSION=$(chromium --version | grep -oP "\d+\.\d+\.\d+") && \
    DRIVER_VERSION=$(curl -s "https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_${CHROME_VERSION}") && \
    wget -O /tmp/chromedriver.zip "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/${DRIVER_VERSION}/linux64/chromedriver-linux64.zip" && \
    unzip /tmp/chromedriver.zip -d /usr/local/bin/ && \
    mv /usr/local/bin/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \
    chmod +x /usr/local/bin/chromedriver && \
    rm -rf /tmp/chromedriver.zip /usr/local/bin/chromedriver-linux64

# Install Python dependencies (including selenium)
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the required ports
EXPOSE 3001
EXPOSE 4000

# Command to run the Dagster service
CMD ["dagster", "dev", "-h", "0.0.0.0", "-p", "3001"]
