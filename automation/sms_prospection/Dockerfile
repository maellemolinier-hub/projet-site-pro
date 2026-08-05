# Image du centre de pilotage (copilot_api.py). Le module utilise des imports
# relatifs (`from .config import ...`) : le code est donc copié dans un
# sous-dossier "sms_prospection" pour rester un vrai package Python, avec
# WORKDIR au niveau parent (uvicorn sms_prospection.copilot_api:app).
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir -r requirements.txt

COPY . ./sms_prospection/

EXPOSE 8020

CMD ["uvicorn", "sms_prospection.copilot_api:app", "--host", "0.0.0.0", "--port", "8020"]
