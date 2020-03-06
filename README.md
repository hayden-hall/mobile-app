# Hayden Hall Mobile App

## Development
1. Clone the repository.
2. Run `npm install` to install dependency.
3. Install expo app ( [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/jp/app/expo-client/id982107779) ) in your mobile device.
4. Run `npm start`. Metro bundler will open as new browser tab. Scan the QR Code and test the app in your device.

### Environment Variable
Create a `.env` file to set the endpoint URL of the [Login API](https://github.com/hayden-hall/auth0-salesforce-login-api)

```
LOGIN_API_URL=https://YOUR_HEROKU_APP.herokuapp.com/login
```

### (Old) Archive(.apk) Generation
Generate the main.jsbundle using below command. This command generate the main.jsbundle file in Android project.

```
react-native bundle --dev false --entry-file index.js --bundle-output android/main.jsbundle --platform android
```

Now you can proceed and generate the apk from Android Studio. Open android folder project in Android Studio and click on [Make Project] button this will build the apk. The generated apk can be found in `app/build/outputs/apk/debug/app-debug.apk`.

## Acknowledgement
Deeply grateful to the team who developed the first version!
- Gaurav Kheterpal
- Umangshu Chouhan
- Anmol Mathur