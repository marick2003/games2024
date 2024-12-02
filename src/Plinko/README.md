# Plinko

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### For deploy

```sh
npm run deploy
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

backend node js project url:
https://github.com/marcussfu/plinko_nodeJS_TS.git


## docker build and run cmd

on frontend folder to cmd these code

docker build --build-arg NODE_ENV=development -t my-app:dev .  // for development

docker build --build-arg NODE_ENV=production -t my-app:pro .  // for production

docker run -it -p 8080:80 my-app:dev // when build, we add dev and pro tag, so run image to container, need to figure tag, and we can also use same name

docker run -it -p 8080:80 my-app:pro

Ctrl + C to close the container

docker start "container name"

docker stop "container name"