# Lomax
Lomax is the Workbench Archiving Service.  It will handle bulk movement of GCS
data into and out of archives, with an overall goal of saving users' money by
taking advantage of cheaper storage classes for archives.

This service is named after the legendary music archiver
[Alan Lomax](https://en.wikipedia.org/wiki/Alan_Lomax).

[![CircleCI](https://circleci.com/gh/broadinstitute/lomax.svg?style=svg)](https://circleci.com/gh/broadinstitute/lomax)
[![codecov](https://codecov.io/gh/broadinstitute/lomax/branch/develop/graph/badge.svg)](https://codecov.io/gh/broadinstitute/lomax)

# For Developers

## Setup
This codebase requires *[npm](https://www.npmjs.com/get-npm)* and *[Node.js](https://nodejs.org/en/download/releases/)*.
Specifically, it wants Node.js version 8.15.0, or whatever minor/patch version
Google documents at https://cloud.google.com/functions/docs/concepts/nodejs-8-runtime.
`npm` is included in the `Node.js` install so typically you do not have to install
it separately.

If you already have a different version of Node on your system, think you might
need different versions in the future, or you have a hard time finding
the right version of Node to install, you might be interested in *[nvm](https://github.com/creationix/nvm)*.
`nvm` is not required to work with Lomax, but it is highly recommended and
very useful to install and manage multiple versions of Node.

To install third-party libraries, first `cd function`, then `npm install`.
You will need to `npm install` any time [package.json](function/package.json)
or [package-lock.json](function/package-lock.json) changes. Conversely, if
those files have not changed since your last install, you should not have
to run `npm install`. You must `npm install` before linting or testing.

This is a minimal set of commands that may work for you:
```
brew install nvm
nvm install 8.15.0
cd function
npm install
npm test
```

## Linting
1. `cd function` - make sure you're in the right directory. The root of this repostory is NOT the right directory!
2. `npm run lint` - note you need the extra `run` command.

If you have linter errors, you can access the linter directly with `npx eslint`.
For instance, to ask `eslint` to fix the errors it found, run `npx eslint . --fix`.

## Testing
1. `cd function` - make sure you're in the right directory. The root of this repostory is NOT the right directory!
2. `npm test`

`npm test` will automatically lint the code before running tests, and will
fail on linter exceptions. This happens via the `pretest` hook in `package.json`.
