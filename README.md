# ft_transcendence

ft_transcendence is a web application project developed as part of the 42 school curriculum. The project aims to provide a full-stack web experience, including authentication, a database, and a modern frontend using Tailwind CSS and TypeScript.

## Features
- User authentication (login/signup)
- Interactive frontend with TypeScript
- Styled with Tailwind CSS
- Modular code structure
- Database integration

## Project Structure
```
main.js                # Main entry point
package.json           # Project dependencies and scripts
tailwind.config.js     # Tailwind CSS configuration
tsconfig.json          # TypeScript configuration
api/                   # API endpoints (e.g., authentication)
db/                    # Database connection and logic
public/                # Static files (CSS, HTML, SVGs)
public/styles.css      # Tailwind CSS output
public/static/         # Static HTML and assets
public/svg/            # SVG icons
public/ts/             # Frontend TypeScript files
```

## Prerequisites
- Docker

## Running the Project
1. Build docker:
   ```sh
   docker compose up ( -d )
   ```
2. Open your browser:
   ```sh
   Open your browser and go to `http://localhost:3000.
   ```

## Development
- TypeScript source files are in `public/ts/`.
- API logic is in `api/`.
- Database logic is in `db/`.
- Static assets and HTML are in `public/static/`.

## License
This project is for educational purposes at 42 school.
