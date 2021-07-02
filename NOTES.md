# Running PostgreSQL with Docker

`$ docker pull postgres`

`$ docker run -p 5432:5432 --name docxforms-postgres -e POSTGRES_PASSWORD=mysecretpassword -d postgres`

`$ psql -h host.docker.internal -p 5432 -U postgres -W`