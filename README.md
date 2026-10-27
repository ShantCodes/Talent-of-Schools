# Krtakan — school performance competition

The solution uses Onion Architecture: `Domain` contains entities and repository contracts, `Application` contains use cases/DTOs/view models, `Infrastructure` implements EF Core, SQLite, BCrypt, JWT, repositories and local file storage, and `Api` is the HTTP boundary. `Api/ClientApp` is the TypeScript React client.

## Start the API

1. Install .NET 10 SDK and run `dotnet tool restore`.
2. Review `src/Krtakan.Api/appsettings.json`; set a long unique JWT secret and use user-secrets or an environment variable for real deployments.
3. Run `dotnet ef migrations add InitialCreate --project src/Krtakan.Infrastructure --startup-project src/Krtakan.Api` whenever the model changes.
4. Run `dotnet run --project src/Krtakan.Api`.

Migrations are automatically applied on API startup. Roles and media formats are EF seed data; the configured development admin is created only when its email does not already exist. Change its credentials before sharing the project.

## Start the client

`cd src/Krtakan.Api/ClientApp && npm install && npm run dev`

Vite proxies `/api` to the API during development. Uploaded media belongs in `storage/media`; only its relative path is stored in SQLite.
