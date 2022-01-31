# KohlNumbra

KohlNumbra (fork of PenumbraLynx) is an open source and highly customizable frontend for LynxChan 2.7. It uses Nunjucks as a templating engine and SASS as a CSS preprocessor. Compilation to multiple languages is supported.

## Requirements

- LynxChan 2.7.x: https://gitgud.io/LynxChan/LynxChan/tree/2.7.x
- KC-Addon: https://gitgud.io/kohlchan-dev/lynxchanaddon-kc

## Install

Install by cloning anywhere and then pointing it to the engine on the global settings. Make sure to check out the correct tag.

To personalize your chan please read LynxChan's documentation on templates.

Run `npm install` to download the dependencies of the build system.

## Build

Create a copy of the configuration and adjust it according to your wishes:

> cp config/kohlnumbra.json.example config/kohlnumbra.json

Then build:

> npm run build

Attach --production to the previous command for production deployment.

You may use environment variables for the build process:

```bash
KC_ENABLED_LANGUAGES=en,de
KC_DEFAULT_LANGUAGE=en
KC_SOURCEMAPS_ENABLED=false
KC_MINIFIED_DEFAULT_ENABLED=true
KC_MINIFIED_CSS_ENABLED=true
KC_MINIFIED_HTML_ENABLED=true
KC_MINIFIED_JS_ENABLED=true
KC_SCSS_VARIABLES_PATH=src/scss/default/_variables.scss
```

## Clean

> npm run clean

Deletes all symlinks and files in `./dist/`.

## Favicon

The favicon in the static directory is served from mongo and will need to be uploaded into MongoDB manually. To do this you need to get the mongofiles tool and run

> mongofiles -h localhost -d {dbName} -l {/path/to/yourfavicon} put /favicon.ico

This front end currently requires you to set the URI of the overboard as "overboard".
