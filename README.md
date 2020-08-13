# Emelbirb

A Discord bot for the University of Auckland Esports Club

## Setup


### Required Software To Run

Requires 
* [NodeJs 14.x.x](https://nodejs.org/en/)
* [MongoDb 4.x.x](https://www.mongodb.com/try/download/community?tck=docs_server)
* [Your Own Discord Bot](https://discord.com/developers/applications)

### Install Dependencies

```bash
npm i
```

### Compile TypeScript

```bash
npm run rebuild
```

### Start Database

```bash
mongod
```

### Create Environmental Variables

Create a project root level file called `.env` and add two lines: <br /> \
`TOKEN = YOUR_DISCORD_TOKEN`<br /> \
`DATABASE = YOUR_DATABASE_NAME`<br /> \
`BOTNAME = YOUR_BOT_NAME`

### Run

```bash
npm run start
```
