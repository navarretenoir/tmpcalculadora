// TMP Calculadora para macOS e iOS — configuración del anfitrión. Desarrollada por Javiera Navarrete para Tu Mundo Pet.
import Foundation
extension ConfigApp {
    static let actual = ConfigApp(
        nombre: "TMP Calculadora",
        inicio: .local("index.html"),
        puente: .ninguno,
        permitidos: [],
        fuera: ["http://", "https://"],      // los enlaces a tiendatumundopet.cl se abren en el navegador
        ventanasDentro: false,
        activos: [])
}
