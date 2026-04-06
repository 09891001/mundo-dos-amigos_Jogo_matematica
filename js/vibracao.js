// 🔇 SISTEMA DE VIBRAÇÃO SILENCIADO (COMPATÍVEL COM TODOS OS DISPOSITIVOS)

function vibrarAcerto() {
    // Só executa se o dispositivo realmente suportar vibração
    if (!navigator.vibrate) return;

    try {
        navigator.vibrate(100);
    } catch (e) {
        // 🔇 silêncio total (não polui console)
    }
}

function vibrarErro() {
    if (!navigator.vibrate) return;

    try {
        navigator.vibrate([100, 50, 100]);
    } catch (e) {
        // 🔇 silêncio total
    }
}