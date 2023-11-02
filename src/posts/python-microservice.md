---
title: Simple and clean architecture for a Python Microservice
description: Build a simple, testable, scalable and maintainable microservice with Python leveraging FastAPI and SQLAlchemy.
date: 2023-11-2
tags:
  - python
  - microservice
  - clean-architecture
published: true
---

While I usually prefer to develop APIs and microservices in Go, I gave Python a try the other day, and was pleasantly surprised at how smooth the experience was with FastAPI and SQLAlchemy. While there's a lot of magic happening with it (as it does with every single framework on the planet), it's a good and easy way to push a PoC out quickly.

FastAPI is one of the newest frameworks to build REST APIs in Python. It's easy and intuitive to write, keeps the codebase short, and it's kind of fast. **It is definitely not as fast as advertised on the website, and definitely not on par with a Go service** . Slower languages love to measure performance by requests per second, while in a traditional production environment, the real bottleneck will be on data serialization. Even though FastAPI makes use of pydantic for this, to great success, it will never be close in performance to a statically typed, compiled language. With that said, nobody actually needs god-like performance, so it ends up being a good tool for pretty much 99% of the userbase.

SQLAlchemy is pretty much the default ORM for Python. While I'm not a fan of ORMs, as they can create a lot of performance issues with unoptimized tables (especially with the more relationships there are) and code can be quite messy, I gave it a try since the usecase was pretty simple, without any joins or any complex queries.

Overall, it's not a stack that'd be my first choice for anything, but it's a good alternative for people comfortable with Python who want to get something out quickly.

To wrap up the intro, a brief representation of the business problem: we are looking to make a service where clients can create, read, update and delete events (yet another CRUD app on this world) through a REST API.

To check the entire code, go to [this](https://github.com/nanchano/artemis) GitHub repo 

## Project Structure

```bash
├── Makefile
├── README.md
├── artemis
│   ├── __init__.py
│   ├── db.py
│   ├── main.py
│   ├── routes.py
│   └── schemas.py
├── poetry.lock
├── pyproject.toml
└── tests
    ├── __init__.py
    ├── test_db.py
    └── test_routes.py
```

The `Makefile` contains some handy rules for development and testing

`artemis` contains the actual code for the service, with `db` being the database layer to interact with sqlite, `routes` being the REST layer, `schemas` containing the DTOs for the main model of the app as well as some requests, and `main` containing the app entrypoing.

`tests` contains the unit tests for the DB and the router.

`poetry.lock` and `pyproject.toml` are just to handle dependencies and overall project settings through `poetry`.

## Database

We are using SQLite for ease of use, but i've succesfully scaled it on production environments, and works flawlessly as long as the service handles less than 100 requests per second, which should be plenty for a lot of them. The reality is, sqlite is really fast, it's practical, ACID compliant and overall simple. It also provides an in-memory option by default which makes it very handy for tests.

Some important settings:
1. WAL mode, making the operations overall faster, as readers do not block writers and the writer does not block readers. More info on the official [docs](https://www.sqlite.org/wal.html).
2. A timeout so concurrent writers wait rather than erroring out
3. Foreign key checks just in case, not needed here, but good practice for the most part.

We have a `DBEvent` model, which will contain the data that comes and goes from the database. It needs to inherit from SQLAlchemy's Base so it can be defined and mapped to a table. We also have some helpers to stablish connections and make migrations.

In `db.py` we also define all the CRUD operations that will hit the database, without these functions using the schemas to perform them. Each of them returns the API `Event`, as it can be convinient to have it on state if we need to interact with it.

To wrap up, it's critical to pass the session or DB connection as a parameter to avoid instantiating a new one on each operation. If it's received as a parameter, it can be create once and kept on state so it's reused, heavily reducing I/O overhead, as well as making the module a breeze to test (more on tests below).


## Schemas

As mentioned, hangling requests and responses through Pydantic's models is a breeze. As such, we define an `Event` model at the API level inside `schemas`, as well as the `CreateEvent` and `UpdateEvent` one. The first one will be used across all endpoints to store the relevant data given the request, the latter two will just be used in the create and update endpoints respectively. A quick note about the update one: it's key to set the Optional type on the fields so we can perform partial updates without needing to pass every single field on the request payload. These are used on the DB layer to retrieve and return the relevant data, so they are pretty much Data Transfer Objects (DTOs) on this architecture.

## Routes
`routes` is the API layer of the service, where the router and endpoints are defined, as well as calling the DB to perform the oeprations. By checking on the DB result, we return the relevant status code based on the operations.

Some key components:
1. We stablish and persist the connection to the DB
2. We run the migrations during the router start up
3. We define the DB session as a parameter on the endpoint, wrapped up in the `Depends` class from FastAPI. This is the way the framework does dependency injection, and allows us to substitute the DB during tests, for example. In the prod setting, the session gets replaced by the `get_db` function yield value, corresponding to the DB connection itself.

## Tests
Given what's already been discussed about SQLite and dependency injection, unit testing the components is easy, allowing us to test our business logic with minimal setup. `pytest` will be used as the testing framework, as it's pretty minimal and easy to read.

To test the DB layer, we setup the database URL to `sqlite://:memory:`, and instantiate the engine and session with that. We also create a pytest fixture, which will yield the DB session to the functions, as well as setup the database for each test, by creating and dropping the necessary tables.

With this, we can pretty much call the DB functions by themselves and make sure the payload returned is the correct one, or, if applicable, that they raise the relevant errors.

To test the API layer, we have the same setup for the DB session, and create two setup/teardown functions to perform the DB migrations for each test. The key here is to override the dependency on the FastAPI app with the in-memory one: 

```python
app.dependency_overrides[routes.get_db] = override_get_db
```

We can also make use of the TestClient from FastAPI, so we can call the endpoints as needed. The only thing rest to do is call them and make sure the returned payload and status codes are exactly what we expect, and that they react the way we want to errors on the DB layer.

## From Microservice to Monolith
To wrap up, lets play around with the idea of expanding the service into a bigger app, with multiple databases and different endpoints. In fact, let's say we have to add a `User` entity to the project.

Structure wise, we could have `db`, `router` and `schemas` modules, where each submodule represents the entity they are interacting with:

```bash
├── db
│   ├── __init__.py
│   ├── events.py
│   └── users.py
├── router
│   ├── __init__.py
│   ├── events.py
│   └── users.py
└── schemas
    ├── __init__.py
    ├── events.py
    └── users.py
```

As such, the logic for each entity is encapsulated in each submodule, where the API layer on the router would call the corresponding lower level DB entity as needed, and the DTOs on the `schemas` submodule would transfer the data between layers.
