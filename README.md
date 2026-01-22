# 📱 Proyecto React Native (Expo)

Este proyecto está desarrollado con **React Native usando Expo**. A continuación encontrarás los comandos y pasos necesarios para ejecutar la aplicación, validar el entorno y generar builds tanto en la nube como **localmente**.

---

## 🚀 Requisitos previos

Asegúrate de tener instalado:

* Node.js (LTS recomendado)
* Java JDK 17
* Android Studio (con Android SDK y emulador o dispositivo físico)
* Expo CLI
* EAS CLI

```bash
npm install -g expo-cli eas-cli
```

---

## ▶️ Ejecutar la app en Android

### ✅ PASO 1 — Ubicarse en el proyecto

Debes estar en la raíz del proyecto (donde está el archivo `package.json`).

### ✅ PASO 2 — Ejecutar en un dispositivo o emulador

```bash
npx expo run:android --device
```

Esto compila y ejecuta la app directamente en el dispositivo Android conectado.

---

## 🧪 Validar el proyecto Expo

Antes de generar builds, es recomendable validar el estado del proyecto:

```bash
npx expo-doctor
```

Para regenerar los archivos nativos (Android / iOS):

```bash
npx expo prebuild --clean
```

---

## 📦 Generación de builds con EAS (Nube)

### 🚀 Generar **AAB** (requerido para Google Play)

```bash
eas build -p android --profile production-aab
```

✔ Genera un archivo `.aab` listo para subir a Google Play Console.

---

### 📱 Generar **APK** (pruebas, QA, instalación directa)

```bash
eas build -p android --profile production-apk
```

✔ Genera un archivo `.apk` para pruebas internas.

---

## 🖥️ Generar APK **LOCALMENTE** (sin nube)

> ⚠️ Recomendado para Windows o cuando no se desea usar EAS Build en la nube.

### 📱 PASO 1 — Entrar a la carpeta Android

```powershell
cd android
```

### 📱 PASO 2 — Generar APK release

```powershell
.\gradlew assembleRelease
```

### 📱 PASO 2 — Generar AAB release

```powershell
.\gradlew bundleRelease
```

---

## ✅ Resultado esperado

Si todo sale bien, verás:

```text
BUILD SUCCESSFUL
```

El APK se generará en la siguiente ruta:

```text
android\app\build\outputs\apk\release\app-release.apk
```

Este archivo puede instalarse directamente en dispositivos Android.


📦 Dónde queda el AAB

Después de correr el comando, el archivo se genera aquí:
```text
android/app/build/outputs/bundle/release/app-release.aab
```
---

## 📝 Notas importantes

* El build local **NO usa Expo EAS ni la nube**
* El APK debe estar **firmado** para instalarse en dispositivos reales
* La primera compilación puede tardar varios minutos

---

## 👨‍💻 Autor

Proyecto desarrollado con React Native + Expo.

---

✨ ¡Listo! Con estos pasos puedes ejecutar, validar y generar versiones de tu app sin problemas.
