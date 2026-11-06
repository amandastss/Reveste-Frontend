# Reveste-Frontend

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Configuração local

Copie `.env.example` para `.env` e configure:

- `VITE_API_URL`: URL raiz do backend (por exemplo, `http://localhost:8000` ou `https://servidor`); pode terminar em `/api`, pois o cliente normaliza esse sufixo.
- `VITE_MERCADO_PAGO_PUBLIC_KEY`: chave **pública** do Mercado Pago compatível com o ambiente de credenciais do backend.

Não configure `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_WEBHOOK_SECRET` nem qualquer segredo em variáveis `VITE_*`: credenciais privadas pertencem somente à configuração do backend. Para produção, defina a chave pública e a URL do backend no ambiente de build/deploy; o `.env.production` do repositório não contém a chave.

O checkout usa o Payment Brick no navegador. O backend valida/prepara o pedido, determina o total e recebe o `pedido_id` junto dos dados produzidos pelo Brick. O frontend confirma a compra consultando `GET /api/pedidos/{id}/`; os parâmetros de retorno do Mercado Pago e o status do callback não são confirmação de pagamento. A API atual de pagamentos pode retornar também campos de preferência (`preference_id`/`init_point`) ao preparar o checkout; o frontend usa apenas `pedido_id`, `amount` e email do pagador e nunca navega para esses links.

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
