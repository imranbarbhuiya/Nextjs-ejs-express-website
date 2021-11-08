[![wakatime](https://wakatime.com/badge/user/7da43ba9-2bc5-4a32-baea-19e38fc777e2/project/c824749e-8598-418b-a1e7-e66bc731c552.svg)](https://wakatime.com/badge/user/7da43ba9-2bc5-4a32-baea-19e38fc777e2/project/c824749e-8598-418b-a1e7-e66bc731c552)
[![CircleCI](https://circleci.com/gh/Codversity/Codversity.svg?style=svg&circle-token=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)](https://github.com/Codversity/Codversity)

<p align="center">
  <a href="https://codversity.com">
    <img src="public/img/logo.png" height="128">
    <h1 align="center">Codversity</h1>
  </a>
</p>
<hr/>

## ToDo

- Course routing
- Adding frontend to index page
- adding error pages
- adding login and registration in next

## Run

### To run this code

- make sure you've [node](https://nodejs.org/en/) installed
- clone the repo
- install all dependencies with

```bash
npm install
```

- add environment variables inside .env file (see .env.example) in the root of the project.
- run

```bash
npm run dev
```

- to test the dependency vulnerabilities

```bash
npm audit
```

or with snyk

```bash
npm test
```

- for production release
- build first with

```bash
npm run build
```

- then run

```bash
npm start
```

- to deploy to heroku

  - add the env variables in the heroku environment settings.
  - clone this repo
  - set this repo in heroku deploy

That's it.
