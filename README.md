# Vanilla React Utils

This is the base package for the front-end functionality of Tomodomo's
Vanilla-based forums.

## Usage
Run `yarn` first, to install the npm dependencies.

### Production build
```
yarn build
```
It will create a bundle in `dist/index.js` which is the entry point of this npm package.

## Development
```
yarn dev
```
We don't use TDD currently (we will, hopefully) and we don't publish the package.
So, currently, we test the code locally in the context of the whole app.

To develop and test things in this workflow:
1. Clone this repo and install deps
1. Use the package in the main app by adding it to its `dependencies` in `package.json`, e.g.:
    ```
    "vanilla-react-utils": "./tomodomo_modules/vanilla-react-utils"
    ```
1. Make a symlink from this npm to `node_modules`, eg:
    ```bash
    # in the root dir of the main app
    cd node_modules && ln -s ../tomodomo_modules/vanilla-react-utils vanilla-react-utils
    ```
1. Run `yarn dev` in both the package dir and main dir

Note: dir `tomodomo_modules` is configured in gulp (watch) and gitignore of the main app.
