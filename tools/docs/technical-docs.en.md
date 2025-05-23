# Technical Documentation of the Olympic Games Online Ticketing Application

## Introduction

- **Project Goal**  
Replace physical tickets, which are prone to fraud, with a secure electronic ticketing system. Visitors purchase their tickets online and receive QR codes via email, ensuring ticket authenticity.

- **Functional Scope**  
Offer consultation, shopping cart and user authentication, generation of two keys (user / ticket) concatenated and encoded into a QR code. An Admin Panel allows offer management and viewing of sales statistics.

## General Architecture

![General Architecture](architecture.svg)

## Data Model (Relational Schema)

![Conceptual Data Model](mcd.svg)

## API Endpoints

*[Interactive API documentation](https://studi-exam-jo.lois-kouninef.eu/docs)*

## Security

- **Password Storage**: Using `bcrypt` library (salt = 10)  
- **Secret Keys**:  
  - `secret_key` (user): UUID, auto-generated on registration  
  - `hashed_token` (ticket): UUID, auto-generated on purchase, unique to each ticket  
  - Encryption with NodeJS `crypto` module before storing in the database  
- **Authentication**: Passport with Session strategy  
- **Authorization**: NestJS Guards used for roles (`admin`, `staff`, `customer`) and to restrict access to personal data  
- **Validation**: DTOs using `class-validator` for all inputs  
- **CSRF / XSS**: CORS configured, Content-Security-Policy headers applied  

## Development Environment Setup

- **Prerequisites**: NodeJS >= 18, PostgreSQL >= 13, Docker, and Docker Compose  
- **Installation**

```bash
git clone git@github.com:LoisKOUNINEF/paris-2024.git
cd paris-2024

touch .env
# Environment variables: DB_HOST, DB_NAME, DB_PORT, DB_USER, DB_PASSWORD, STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, SMTP_HOST, SESSION_SECRET, ALLOWED_URL, SERVER_PORT

npm install

# Run migrations
nx run server-data-source:migration-run

# Start front-end and back-end in development mode
nx run-many --target=serve
```