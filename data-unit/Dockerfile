FROM python:3.12

WORKDIR /dagster-app

COPY requirements.txt .

ARG GITHUB_TOKEN
RUN git config --global credential.helper store

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 3001
EXPOSE 4000

CMD ["dagster", "dev", "-h", "0.0.0.0", "-p", "3001"]
