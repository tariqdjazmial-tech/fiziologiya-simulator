# PhysioNova — мобилно приложение (Android и iOS)

Приложението е направено с [Capacitor](https://capacitorjs.com): същият сайт от папка `site/` се показва в нативно приложение.

| Папка / файл | Какво е |
|---|---|
| `site/` | Сайтът. Всяка промяна тук влиза и в приложението. |
| `site/js/native.js` | Работи само вътре в приложението: лента най-горе, бутон „назад“, вход с Google, плащане, външни връзки. |
| `capacitor.config.json` | Име (`PhysioNova`), идентификатор (`com.physionova.app`), цветове на началния екран. |
| `android/`, `ios/` | Нативните проекти за Android Studio и Xcode. |
| `assets/` | Изходните картинки за иконата и началния екран. |

## Сглобяване

Трябват Node.js 22+ и:
- за Android: [Android Studio](https://developer.android.com/studio);
- за iOS: Mac с Xcode 16+.

```bash
npm install
npm run android   # копира site/ в проекта и отваря Android Studio
npm run ios       # същото за Xcode (само на Mac)
```

След всяка промяна в `site/` пусни `npx cap sync`, преди да сглобиш отново.

Нова икона: смени картинките в `assets/` и пусни
`npx @capacitor/assets generate --android --ios --iconBackgroundColor '#000000' --splashBackgroundColor '#000000'`.

## Настройки, които трябват, преди приложението да работи напълно

1. **Адрес на сайта**: в `config.json` и `site/js/config.js` попълни `siteUrl` с адреса на сайта в Cloudflare. Без него плащането не работи в приложението.
2. **Supabase → Authentication → URL Configuration → Redirect URLs**: добави `com.physionova.app://auth`. Без това входът с Google не връща потребителя в приложението.
3. **Cloudflare**: качи новия `src/worker.js` (в него са разрешенията за CORS от приложението).
