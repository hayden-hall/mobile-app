# Hayden Hall Mobile App

## Instructions
### Development Environment Setup Instructions

- Goto https://facebook.github.io/react-native/docs/getting-started and make the correct setup of React-Native with Android studio.

### Development Setup Instructions

- Clone the repository above
- Using Terminal, cd into the `haydenhall` directory
- run `yarn install` to install dependency
- Run this command: `react-native link` to link Assets to ios/android and React native libraries
- run `npm start` and In another tab, run `react-native run-android` for android.

### Archive(.apk) generation Instructions

- Generate the main.jsbundle using below command. This command generate the main.jsbundle file in Android project.

```
react-native bundle --dev false --entry-file index.js --bundle-output android/main.jsbundle --platform android
```

- Now you can proceed and generate the apk from Android Studio.
- Open android folder project in Android Studio and click on Make Project button this will build the apk.
- The generated apk can be found in app->build->outputs->apk->debug->app-debug.apk.

## Acknowledgement
Deeply grateful to the team who developed the first version!
- Gaurav Kheterpal
- Umangshu Chouhan
- Anmol Mathur