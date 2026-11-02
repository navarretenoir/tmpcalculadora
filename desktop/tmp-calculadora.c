/* TMP Calculadora — ventana nativa para Linux (GTK 4 + WebKitGTK 6) de la interfaz ui/index.html.
 * Todo ocurre en el dispositivo: sin internet, sin cuentas. Desarrollada por Javiera Navarrete para Tu Mundo Pet. */
#include <gtk/gtk.h>
#include <webkit/webkit.h>

#ifndef UI_DIR
#define UI_DIR "/usr/share/tmp-calculadora/ui"
#endif

static gboolean on_decidir (WebKitWebView *v, WebKitPolicyDecision *d, WebKitPolicyDecisionType t, gpointer u) {
    (void) v; (void) u;
    if (t != WEBKIT_POLICY_DECISION_TYPE_NAVIGATION_ACTION && t != WEBKIT_POLICY_DECISION_TYPE_NEW_WINDOW_ACTION) return FALSE;
    WebKitNavigationAction *a = webkit_navigation_policy_decision_get_navigation_action (WEBKIT_NAVIGATION_POLICY_DECISION (d));
    const char *uri = webkit_uri_request_get_uri (webkit_navigation_action_get_request (a));
    if (uri && !g_str_has_prefix (uri, "file://")) {            /* nada navega dentro de la app: los enlaces a la tienda se abren en el navegador */
        if (g_str_has_prefix (uri, "https://www.tiendatumundopet.cl/")) g_app_info_launch_default_for_uri (uri, NULL, NULL);
        webkit_policy_decision_ignore (d);
        return TRUE;
    }
    return FALSE;
}

static void activar (GtkApplication *app, gpointer u) {
    (void) u;
    GtkWidget *win = gtk_application_window_new (app);
    gtk_window_set_title (GTK_WINDOW (win), "TMP Calculadora");
    gtk_window_set_default_size (GTK_WINDOW (win), 1100, 820);
    gtk_window_set_icon_name (GTK_WINDOW (win), "io.github.navarretenoir.TMPCalculadora");

    WebKitWebView *v = WEBKIT_WEB_VIEW (g_object_new (WEBKIT_TYPE_WEB_VIEW, NULL));
    WebKitSettings *s = webkit_web_view_get_settings (v);
    webkit_settings_set_allow_file_access_from_file_urls (s, TRUE);
    webkit_settings_set_enable_developer_extras (s, g_getenv ("TMPCALC_DEV") != NULL);
    webkit_settings_set_hardware_acceleration_policy (s, WEBKIT_HARDWARE_ACCELERATION_POLICY_NEVER);
    g_signal_connect (v, "decide-policy", G_CALLBACK (on_decidir), NULL);

    const char *dir = g_getenv ("TMPCALC_UI") ? g_getenv ("TMPCALC_UI") : UI_DIR;
    gchar *ruta = g_build_filename (dir, "index.html", NULL);
    gchar *uri = g_filename_to_uri (ruta, NULL, NULL);
    webkit_web_view_load_uri (v, uri);
    g_free (uri); g_free (ruta);
    gtk_window_set_child (GTK_WINDOW (win), GTK_WIDGET (v));
    gtk_window_present (GTK_WINDOW (win));
}

int main (int argc, char **argv) {
    GtkApplication *app = gtk_application_new ("io.github.navarretenoir.TMPCalculadora", G_APPLICATION_DEFAULT_FLAGS);
    g_signal_connect (app, "activate", G_CALLBACK (activar), NULL);
    int r = g_application_run (G_APPLICATION (app), argc, argv);
    g_object_unref (app);
    return r;
}
