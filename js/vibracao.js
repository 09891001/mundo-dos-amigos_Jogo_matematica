/**
 * FEEDBACK TÁTIL: Vibra o celular do jogador
 */
function vibrarAcerto() {
    console.log("[VIBRAÇÃO]: Sucesso detectado.");
    if (navigator.vibrate) {
        // Uma vibração firme de 200 milissegundos
        navigator.vibrate(200);
    }
}



function vibrarErro() {
    console.log("[VIBRAÇÃO]: Erro detectado.");
    if (navigator.vibrate) {
        // Duas vibrações curtas para sinalizar atenção
        navigator.vibrate([100, 50, 100]);
    }
}