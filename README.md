# Scalable E-commerce Platform

A scalable e-commerce platform designed around a **service-oriented architecture**, where client requests enter through an **API Gateway** and are routed to the appropriate backend services.

The project focuses on building a maintainable and scalable backend architecture with clear service boundaries, centralized request routing, authentication, and independent service development.

## Architecture

```text
                    ┌───────────────┐
                    │    Client     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  API Gateway  │
                    └───────┬───────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
      ┌────────────┐ ┌────────────┐ ┌────────────┐
      │ Auth       │ │ Product    │ │ Order      │
      │ Service    │ │ Service    │ │ Service    │
      └────────────┘ └────────────┘ └────────────┘
             │              │              │
             ▼              ▼              ▼
        Database       Database       Database
```

The **API Gateway** acts as the entry point for the platform. It receives external requests and forwards them to the appropriate internal service.

## Services

The platform is divided into independent services, for example:

* **Auth Service** — authentication and authorization
* **Product Service** — product and catalog management
* **Order Service** — order creation and management
* **Payment Service** — payment-related operations
* **Inventory Service** — stock and inventory management

Each service is responsible for its own business logic and can be developed, tested, and deployed independently.

## API Gateway

The gateway provides a single entry point for clients.

```text
Client
  │
  ▼
API Gateway
  │
  ├── /auth     → Auth Service
  ├── /products → Product Service
  ├── /orders   → Order Service
  ├── /payments → Payment Service
  └── /inventory → Inventory Service
```

This approach prevents clients from needing to know the internal location of individual services.

## Key Features

* API Gateway architecture
* Independent backend services
* REST APIs
* Authentication and authorization
* Service-to-service communication
* Database-per-service approach where applicable
* Centralized request routing
* Input validation
* Error handling
* Scalable service boundaries
* Docker-based development
* Environment-based configuration

## Technology Stack

**Backend**

* Node.js
* Express.js

**API Gateway**

* API Gateway / Gateway Service

**Databases**

* PostgreSQL / MongoDB

**Infrastructure**

* Docker
* Docker Compose
* AWS

**Additional Infrastructure**

* Redis
* Nginx
* CI/CD

## Request Flow

A typical request follows this flow:

```text
Client
   │
   │ HTTP Request
   ▼
API Gateway
   │
   │ Route
   ▼
Target Service
   │
   │ Business Logic
   ▼
Database
   │
   ▼
Target Service
   │
   ▼
API Gateway
   │
   ▼
Client
```

The gateway handles routing while the individual services remain responsible for their own business logic.

## Scalability

The architecture allows individual services to scale independently.

For example, if the Product Service receives significantly more traffic than the Order Service:

```text
Product Service
 ├── Instance 1
 ├── Instance 2
 ├── Instance 3
 └── Instance 4

Order Service
 └── Instance 1
```

Additional instances can be added to the service experiencing higher load without scaling the entire application.

## Project Structure

```text
scalable-ecommerce-platform/
│
├── api-gateway/
│
├── services/
│   ├── auth-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── inventory-service/
│
├── docker-compose.yml
│
└── README.md
```

## Running Locally

Clone the repository:

```bash
git clone <repository-url>
cd scalable-ecommerce-platform
```

Install dependencies for the required services and configure the environment variables.

Create the required `.env` files based on the provided environment configuration.

Start the infrastructure:

```bash
docker compose up -d
```

Start the required services and API Gateway.

The client communicates with the **API Gateway**, rather than directly accessing the internal services.

## Environment Variables

Each service should maintain its own configuration where appropriate.

Example:

```env
PORT=3000
DATABASE_URL=your_database_url
REDIS_URL=your_redis_url
JWT_SECRET=your_secret
```

Never commit real secrets or credentials to the repository.

## Goals

This project demonstrates how a traditional e-commerce application can be structured into independently managed services while maintaining a clear entry point through an API Gateway.

The main goals are:

* Scalability
* Maintainability
* Service isolation
* Clear API boundaries
* Independent deployment
* Reliable backend communication
* Production-oriented architecture

## Status

🚧 **In Development**

The architecture and services are being progressively implemented and improved.
