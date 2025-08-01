# PhotovoltaicProductionMonitor

**PhotovoltaicProductionMonitor** is a modular web application designed to monitor and analyze small-scale photovoltaic (PV) systems, with a focus on accessibility for residential users. It provides a user-friendly interface, efficient data aggregation, and tools for performance tracking, making solar energy systems easier to manage and optimize.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Data Sources](#data-sources)
- [Planned Improvements](#planned-improvements)
- [License](#license)

---

## Overview

In response to the increasing adoption of solar energy, **PhotovoltaicProductionMonitor** addresses the lack of intuitive, non-restrictive tools available to residential users. Unlike many platforms designed for industrial use or locked to specific manufacturers, this project offers a customizable and user-centric solution for tracking and improving PV system performance.

---

## Key Features

- **Energy Monitoring**: Displays hourly, daily, and weekly production metrics.
- **Custom Data Input**: Supports manual entry of system details like installed capacity and production logs.
- **External Integration**: Fetches real-time data from inverter platforms and public weather databases.
- **Performance Estimation**: Correlates technical and meteorological data to estimate theoretical production.
- **Anomaly Detection**: Identifies potential faults or underperformance based on historical comparisons.
- **Data Aggregation**: Statistical processing of collected data at different time intervals.
- **Change Data Capture (CDC) flows**: Ensures data integrity and avoids duplication.
- **Scalability**: Modular architecture supports future integration and expansion.

---

## System Architecture

The application is composed of four main components:

1. **Frontend**:  
   - Built with **React**  
   - Provides a simple and intuitive interface for non-professional users

2. **Backend API**:  
   - Developed using **Django REST Framework**  
   - Handles user input, business logic, and interactions with other systems.

3. **Database**:  
   - **PostgreSQL** is used to store production data, system configurations, and logs

4. **Data Processing Layer**:  
   - Powered by **Dagster**  
   - Manages data ingestion, validation, and scheduled analysis tasks

All components are containerized using **Docker** to ensure portability, ease of deployment, and modular scaling.

---

## Technology Stack

| Component        | Technology          |
|------------------|---------------------|
| Frontend         | React               |
| Backend API      | Django REST         |
| Database         | PostgreSQL          |
| Workflow Engine  | Dagster             |
| Containerization | Docker              |
| Optional (Future)| Apache Kafka        |
| CI/CD (Optional) | GitHub Actions, Docker Compose |

---

## Data Sources

The application uses three main sources of data:

1. **User Input**: Installed capacity, system specs, start date, production entries
2. **Inverter Platforms**: Automated readings from vendor APIs
3. **Public Meteorological Platforms**:  
   - **PVGIS** (Photovoltaic Geographical Information System)  
   - **OPCOM** (Operatorul Pieţei de Energie Electrică şi de Gaze Naturale)

---

## Planned Improvements

- Integration of **machine learning models** for predictive analytics:
  - Forecast energy production based on weather and historical data
  - Detect anomalies and suggest preventive actions
  - Offer personalized optimization tips

- **Real-time data streaming** using technologies like **Apache Kafka**

- Enhanced **mobile responsiveness** and **offline support**

- Role-based access and multi-system monitoring for advanced users

## License

This project is developed for academic and research purposes. Licensing details will be added in accordance with the institution's guidelines.
