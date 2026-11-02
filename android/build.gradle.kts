// TMP Calculadora para Android 5.0 en adelante (Tu Mundo Pet; desarrollada por Javiera Navarrete). Sin dependencias externas.
plugins { id("com.android.application") version "9.4.1" }

val assetsUi = layout.buildDirectory.dir("assets-ui").get().asFile
val prepararUi by tasks.registering(Sync::class) {
    into(assetsUi)
    from(rootDir.resolve("../app")) { into("ui"); exclude("*.bak*") }
    doLast {   // desde file:///android_asset la CSP del navegador no aplica: la red ya está bloqueada por no pedir permiso INTERNET
        val f = File(assetsUi, "ui/index.html")
        f.writeText(f.readText().replace(Regex("<meta http-equiv=\"Content-Security-Policy\"[^>]*>\\n?"), ""))
    }
}
android {
    namespace = "cl.kotone.tmpcalculadora"
    compileSdk { version = release(36) { minorApiLevel = 1 } }
    defaultConfig { applicationId = "cl.kotone.tmpcalculadora"; minSdk = 21; targetSdk = 36; versionCode = 1; versionName = "1.0" }
    sourceSets["main"].apply { manifest.srcFile("AndroidManifest.xml"); java.srcDirs("src"); res.srcDirs("res"); assets.srcDirs(assetsUi) }
    buildTypes { release { isMinifyEnabled = false } }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_11; targetCompatibility = JavaVersion.VERSION_11 }
    lint { abortOnError = false; textReport = true }
}
tasks.named("preBuild") { dependsOn(prepararUi) }
