Use TypeScript with Node.js

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start the bot
npm start
```

## Project Structure

- `src/commands/` - Slash commands
- `src/handlers/` - Core handlers
- `src/models/` - Database models
- `src/ServerSetup.ts` - Server setup class
- `src/index.ts` - Main entry point
- `README.md` - This file

## Commands

All commands are prefixed with `/`:

- `/all` - Setup entire Discord server
- `/cleanup` - Remove HARVAL content
- `/setup` - Re-run server setup
- `/verify` - Verify Minecraft username
- `/profile` - View profile
- `/roles` - List all roles
- `/channels` - List all channels
- `/rules` - View server rules
- `/faq` - View FAQ
- `/leaderboard` - View leaderboards
- `/ping` - Check bot latency

## Setup

HARVAL can automatically set up an entire Discord server with ONE command:

```
/all
```

This will create:
- 10 categories with 40+ channels
- PvP tier roles for 15+ modes
- Complete ticket system
- Verification system
- Application panels
- Leaderboard tracking

## Features

- ✅ Automated server setup
- ✅ PvP tier testing system
- ✅ Minecraft verification
- ✅ Professional staff hierarchy
- ✅ Complete logging
- ✅ Modular TypeScript codebase
- ✅ Modern Discord.js v14
- ✅ MongoDB with Mongoose

## Development

```bash
# Start development server
npm run dev

# Type check
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## License

ISC

## Issues

For issues, please create a GitHub issue in this repository.

---

**Note:** To ensure the bot functions properly, make sure all environment variables from `.env.example` are set in your `.env` file.

**Created with ❤️ by the HARVAL MC Team**
