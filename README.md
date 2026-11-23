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

### Endereço, pedidos e entrega

- Antes de abrir o Payment Brick, o checkout consulta `GET /api/usuarios/me/` e apresenta o endereço de entrega cadastrado.
- Ao confirmar o endereço, o frontend atualiza o perfil com `PATCH /api/usuarios/me/` e prepara o carrinho enviando `endereco_entrega` para `POST /api/carrinho/finalizar/`.
- O backend salva uma cópia do endereço no pedido. Alterações futuras no perfil não modificam pedidos anteriores.
- Depois da aprovação validada pelo webhook do Mercado Pago, o pedido fica `PAGO`, a peça deixa de aparecer no catálogo e o pedido inicia em `AGUARDANDO_PREPARACAO`.
- A tela **Meus pedidos** usa `GET /api/pedidos/`; o detalhe usa `GET /api/pedidos/{id}/` e apresenta o endereço e as etapas reais de entrega.
- O vendedor consulta suas vendas em `GET /api/vendas/` e atualiza a etapa logística em `PATCH /api/pedidos/{id}/entrega/`, avançando nesta ordem: `ENVIADO`, `EM_TRANSITO`, `SAIU_PARA_ENTREGA`, `ENTREGUE`.
- O checkout consulta novamente o pedido a cada cinco segundos enquanto o pagamento estiver pendente. Somente o estado persistido pelo backend confirma a compra.

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
