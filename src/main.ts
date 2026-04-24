import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
// @ts-expect-error router module is JS
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
