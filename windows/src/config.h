/* TMP Calculadora para Windows — configuración del anfitrión WebView2 (webhost.c). Desarrollada por Javiera Navarrete para Tu Mundo Pet. */
#define APP_NOMBRE          L"TMP Calculadora"
#define APP_CLASE           L"TmpCalculadoraJavieraNavarrete"
#define APP_AGENTE          "TMP-Calculadora-Windows/1.0 (Javiera Navarrete)"
#define APP_HOST_VIRTUAL    L"tmpcalc.local"
#define APP_CARPETA_UI      L"ui"
#define APP_INICIO          L"https://tmpcalc.local/index.html"
#define APP_CARPETA_DATOS   L"TmpCalculadora"
#define APP_PUENTE          0
#define APP_GUARDAR         0
#define APP_VENTANAS_DENTRO 0
#define APP_MENU_CONTEXTUAL FALSE
#define APP_ANCHO           1100
#define APP_ALTO            820
#define APP_COLOR_FONDO     RGB(0xED, 0xF4, 0xF2)
#define APP_MODULOS         0
#define APP_ACERCA          L"TMP Calculadora 1.0 para Windows\n\nCalcula la dosis de los productos de Tu Mundo Pet según los litros de tu acuario.\n" \
                            L"Desarrollada por Javiera Navarrete para Tu Mundo Pet.\n\nFunciona sin internet."
static const WCHAR *APP_FUERA[] = {L"http://", L"https://www.tiendatumundopet.cl/", L"https://github.com/", NULL};
static const WCHAR *APP_PERMITIDOS[] = {NULL};
