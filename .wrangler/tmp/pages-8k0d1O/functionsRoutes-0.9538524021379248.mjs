import { onRequestGet as __api_leaderboard_js_onRequestGet } from "/Users/nunofontoura/Documents/personal_website/functions/api/leaderboard.js"
import { onRequestPost as __api_my_referrals_js_onRequestPost } from "/Users/nunofontoura/Documents/personal_website/functions/api/my-referrals.js"
import { onRequestPost as __api_subscribe_js_onRequestPost } from "/Users/nunofontoura/Documents/personal_website/functions/api/subscribe.js"
import { onRequestGet as __api_unsubscribe_js_onRequestGet } from "/Users/nunofontoura/Documents/personal_website/functions/api/unsubscribe.js"
import { onRequestPost as __api_unsubscribe_js_onRequestPost } from "/Users/nunofontoura/Documents/personal_website/functions/api/unsubscribe.js"

export const routes = [
    {
      routePath: "/api/leaderboard",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_leaderboard_js_onRequestGet],
    },
  {
      routePath: "/api/my-referrals",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_my_referrals_js_onRequestPost],
    },
  {
      routePath: "/api/subscribe",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_subscribe_js_onRequestPost],
    },
  {
      routePath: "/api/unsubscribe",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_unsubscribe_js_onRequestGet],
    },
  {
      routePath: "/api/unsubscribe",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_unsubscribe_js_onRequestPost],
    },
  ]