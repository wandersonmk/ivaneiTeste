let historico = [];
let cartela = [];
let numerosSorteados = new Set();

// Inicializar cartela ao carregar a página
window.addEventListener('DOMContentLoaded', function() {
    criarCartela();
});

function criarCartela() {
    const min = parseInt(document.getElementById('minNumber').value) || 1;
    const max = parseInt(document.getElementById('maxNumber').value) || 100;
    
    cartela = [];
    for (let i = min; i <= max; i++) {
        cartela.push(i);
    }
    
    renderizarCartela();
}

function renderizarCartela() {
    const cartelaDiv = document.getElementById('cartela');
    cartelaDiv.innerHTML = '';
    
    cartela.forEach(numero => {
        const div = document.createElement('div');
        div.className = 'numero-cartela';
        div.id = `cartela-${numero}`;
        div.textContent = numero;
        
        if (numerosSorteados.has(numero)) {
            div.classList.add('sorteado');
        }
        
        cartelaDiv.appendChild(div);
    });
}

function marcarNumeroNaCartela(numero) {
    numerosSorteados.add(numero);
    const elemento = document.getElementById(`cartela-${numero}`);
    if (elemento) {
        setTimeout(() => {
            elemento.classList.add('sorteado');
        }, 100);
    }
}

function resetarCartela() {
    numerosSorteados.clear();
    renderizarCartela();
    document.getElementById('resultado').innerHTML = '';
}

function compartilharCartela() {
    const min = Math.min(...cartela);
    const max = Math.max(...cartela);
    const sorteados = Array.from(numerosSorteados).sort((a, b) => a - b);
    
    let mensagem = `🎯 *Cartela de Bingo*\n\n`;
    mensagem += `Intervalo: ${min} a ${max}\n`;
    mensagem += `Total de números: ${cartela.length}\n\n`;
    
    if (sorteados.length > 0) {
        mensagem += `✅ *Números Sorteados (${sorteados.length}):*\n`;
        mensagem += sorteados.join(', ');
    } else {
        mensagem += `Nenhum número foi sorteado ainda.`;
    }
    
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>📤 Compartilhar Cartela</h3>
                <button class="close-modal" onclick="fecharModal()">&times;</button>
            </div>
            <div class="share-options">
                <button class="share-btn whatsapp" onclick="compartilharWhatsApp()">
                    💬 Compartilhar no WhatsApp
                </button>
                <button class="share-btn telegram" onclick="compartilharTelegram()">
                    ✈️ Compartilhar no Telegram
                </button>
                <button class="share-btn copiar" onclick="copiarTexto()">
                    📋 Copiar Texto
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.style.display = 'block', 10);
    
    // Guardar mensagem globalmente
    window.mensagemCompartilhar = mensagem;
}

function fecharModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.style.display = 'none';
        setTimeout(() => modal.remove(), 300);
    }
}

function compartilharWhatsApp() {
    const texto = encodeURIComponent(window.mensagemCompartilhar);
    window.open(`https://wa.me/?text=${texto}`, '_blank');
    fecharModal();
}

function compartilharTelegram() {
    const texto = encodeURIComponent(window.mensagemCompartilhar);
    window.open(`https://t.me/share/url?url=&text=${texto}`, '_blank');
    fecharModal();
}

function copiarTexto() {
    navigator.clipboard.writeText(window.mensagemCompartilhar).then(() => {
        mostrarToast('✅ Texto copiado para a área de transferência!');
        fecharModal();
    }).catch(() => {
        mostrarToast('❌ Erro ao copiar texto');
    });
}

function mostrarToast(mensagem) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = mensagem;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function sortear() {
    const min = parseInt(document.getElementById('minNumber').value);
    const max = parseInt(document.getElementById('maxNumber').value);
    const quantidade = parseInt(document.getElementById('quantity').value);
    const numerosUnicos = document.getElementById('uniqueNumbers').checked;
    
    // Validações
    if (isNaN(min) || isNaN(max) || isNaN(quantidade)) {
        mostrarErro('Por favor, preencha todos os campos com números válidos.');
        return;
    }
    
    if (min >= max) {
        mostrarErro('O número mínimo deve ser menor que o número máximo.');
        return;
    }
    
    if (quantidade < 1) {
        mostrarErro('A quantidade deve ser pelo menos 1.');
        return;
    }
    
    if (numerosUnicos && quantidade > (max - min + 1)) {
        mostrarErro(`Não é possível sortear ${quantidade} números únicos entre ${min} e ${max}.`);
        return;
    }
    
    // Gerar números sorteados
    const numerosSorteados = gerarNumeros(min, max, quantidade, numerosUnicos);
    
    // Exibir resultado
    exibirResultado(numerosSorteados);
    
    // Adicionar ao histórico
    adicionarAoHistorico(numerosSorteados, min, max);
}

function gerarNumeros(min, max, quantidade, unicos) {
    const numeros = [];
    
    if (unicos) {
        // Gerar números únicos
        const disponiveis = [];
        for (let i = min; i <= max; i++) {
            disponiveis.push(i);
        }
        
        for (let i = 0; i < quantidade; i++) {
            const indice = Math.floor(Math.random() * disponiveis.length);
            numeros.push(disponiveis[indice]);
            disponiveis.splice(indice, 1);
        }
        
        numeros.sort((a, b) => a - b);
    } else {
        // Gerar números com possível repetição
        for (let i = 0; i < quantidade; i++) {
            const numero = Math.floor(Math.random() * (max - min + 1)) + min;
            numeros.push(numero);
        }
    }
    
    return numeros;
}

function exibirResultado(numeros) {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '';
    
    numeros.forEach((numero, index) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'numero-sorteado';
            div.textContent = numero;
            resultado.appendChild(div);
            
            // Marcar número na cartela
            marcarNumeroNaCartela(numero);
        }, index * 100);
    });
}

function mostrarErro(mensagem) {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = `<div class="erro">${mensagem}</div>`;
}

function adicionarAoHistorico(numeros, min, max) {
    const agora = new Date();
    const dataFormatada = agora.toLocaleString('pt-BR');
    
    historico.unshift({
        data: dataFormatada,
        numeros: numeros,
        range: `${min} - ${max}`
    });
    
    // Limitar histórico a 10 itens
    if (historico.length > 10) {
        historico.pop();
    }
    
    atualizarHistorico();
}

function atualizarHistorico() {
    const container = document.getElementById('historico-container');
    const historicoDiv = document.getElementById('historico');
    
    if (historico.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    container.style.display = 'block';
    historicoDiv.innerHTML = '';
    
    historico.forEach(item => {
        const div = document.createElement('div');
        div.className = 'historico-item';
        div.innerHTML = `
            <div class="data">${item.data} (${item.range})</div>
            <div class="numeros">Números: ${item.numeros.join(', ')}</div>
        `;
        historicoDiv.appendChild(div);
    });
}

function limparHistorico() {
    if (confirm('Deseja realmente limpar todo o histórico?')) {
        historico = [];
        atualizarHistorico();
    }
}

function mostrarGanhador() {
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '<div class="ganhador-display">🏆 IVANEI É O GANHADOR! 🏆</div>';
}

// Permitir sortear com Enter
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sortear();
    }
});
