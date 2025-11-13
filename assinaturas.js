// Base de dados (localStorage)
let assinantes = JSON.parse(localStorage.getItem('assinantes')) || [];
let historicoPagamentos = JSON.parse(localStorage.getItem('historicoPagamentos')) || [];

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', function() {
    atualizarDashboard();
    renderizarTabela();
    criarGraficos();
    verificarAlertas();
    aplicarMascaras();
});

// FUNÇÕES DE NAVEGAÇÃO
function mostrarSecao(secao) {
    document.querySelectorAll('.secao').forEach(s => s.classList.remove('active'));
    document.getElementById(`secao-${secao}`).classList.add('active');
    
    document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
    event.target.closest('.menu-item').classList.add('active');
}

// CÁLCULOS AUTOMÁTICOS
function calcularDiasRestantes(dataValidade) {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diff = validade - hoje;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function determinarStatus(diasRestantes) {
    if (diasRestantes < 0) return 'vencido';
    if (diasRestantes <= 5) return 'a-vencer';
    return 'ativo';
}

function calcularTotais() {
    const ativos = assinantes.filter(a => determinarStatus(calcularDiasRestantes(a.validade)) !== 'vencido');
    
    const entrada = ativos.reduce((sum, a) => sum + parseFloat(a.valor), 0);
    const saida = ativos.reduce((sum, a) => sum + parseFloat(a.custo), 0);
    const lucro = entrada - saida;
    
    const totalAtivos = assinantes.filter(a => determinarStatus(calcularDiasRestantes(a.validade)) === 'ativo').length;
    const totalAVencer = assinantes.filter(a => determinarStatus(calcularDiasRestantes(a.validade)) === 'a-vencer').length;
    const totalVencidos = assinantes.filter(a => determinarStatus(calcularDiasRestantes(a.validade)) === 'vencido').length;
    
    return { entrada, saida, lucro, totalAtivos, totalAVencer, totalVencidos };
}

// ATUALIZAR DASHBOARD
function atualizarDashboard() {
    const totais = calcularTotais();
    
    document.getElementById('entradaTotal').textContent = formatarMoeda(totais.entrada);
    document.getElementById('saidaTotal').textContent = formatarMoeda(totais.saida);
    document.getElementById('lucroTotal').textContent = formatarMoeda(totais.lucro);
    document.getElementById('totalAtivos').textContent = totais.totalAtivos;
    document.getElementById('totalAVencer').textContent = totais.totalAVencer;
    document.getElementById('totalVencidos').textContent = totais.totalVencidos;
}

// GRÁFICOS
let chartPagamento, chartStatus, chartReceita;

function criarGraficos() {
    // Gráfico de Forma de Pagamento
    const pagamentos = {};
    assinantes.forEach(a => {
        pagamentos[a.formaPagamento] = (pagamentos[a.formaPagamento] || 0) + 1;
    });
    
    const ctxPagamento = document.getElementById('chartPagamento').getContext('2d');
    if (chartPagamento) chartPagamento.destroy();
    chartPagamento = new Chart(ctxPagamento, {
        type: 'pie',
        data: {
            labels: Object.keys(pagamentos),
            datasets: [{
                data: Object.values(pagamentos),
                backgroundColor: ['#3498db', '#9b59b6', '#e67e22', '#27ae60']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
    
    // Gráfico de Status
    const status = {};
    assinantes.forEach(a => {
        const st = determinarStatus(calcularDiasRestantes(a.validade));
        status[st] = (status[st] || 0) + 1;
    });
    
    const ctxStatus = document.getElementById('chartStatus').getContext('2d');
    if (chartStatus) chartStatus.destroy();
    chartStatus = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Ativo', 'A Vencer', 'Vencido'],
            datasets: [{
                data: [status['ativo'] || 0, status['a-vencer'] || 0, status['vencido'] || 0],
                backgroundColor: ['#27ae60', '#e67e22', '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
    
    // Gráfico de Receita Mensal
    const ctxReceita = document.getElementById('chartReceita').getContext('2d');
    if (chartReceita) chartReceita.destroy();
    chartReceita = new Chart(ctxReceita, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Entrada',
                data: Array(12).fill(0),
                backgroundColor: '#27ae60'
            }, {
                label: 'Saída',
                data: Array(12).fill(0),
                backgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

// RENDERIZAR TABELA
function renderizarTabela(filtro = 'todos') {
    const tbody = document.getElementById('tabelaAssinantes');
    tbody.innerHTML = '';
    
    let assinantesFiltrados = assinantes;
    
    if (filtro !== 'todos') {
        assinantesFiltrados = assinantes.filter(a => {
            const status = determinarStatus(calcularDiasRestantes(a.validade));
            return status === filtro;
        });
    }
    
    assinantesFiltrados.forEach((assinante, index) => {
        const diasRestantes = calcularDiasRestantes(assinante.validade);
        const status = determinarStatus(diasRestantes);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${assinante.nome}</td>
            <td>${assinante.whatsapp}</td>
            <td>${assinante.formaPagamento}</td>
            <td>${formatarMoeda(assinante.valor)}</td>
            <td>${formatarData(assinante.validade)}</td>
            <td>${diasRestantes} dias</td>
            <td><span class="badge badge-${status}">${status.toUpperCase()}</span></td>
            <td>
                <button class="btn-acao btn-ver" onclick="verPerfil(${index})">👁️</button>
                <button class="btn-acao btn-editar" onclick="editarAssinante(${index})">✏️</button>
                <button class="btn-acao btn-deletar" onclick="deletarAssinante(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// MODAL CADASTRO
function abrirModalCadastro() {
    document.getElementById('modalCadastro').style.display = 'block';
    document.getElementById('tituloModal').textContent = 'Novo Assinante';
    document.getElementById('formAssinante').reset();
    document.getElementById('assinanteId').value = '';
}

function fecharModal() {
    document.getElementById('modalCadastro').style.display = 'none';
}

function salvarAssinante(event) {
    event.preventDefault();
    
    const assinante = {
        nome: document.getElementById('nome').value,
        whatsapp: document.getElementById('whatsapp').value,
        formaPagamento: document.getElementById('formaPagamento').value,
        valor: document.getElementById('valor').value.replace(/[^\d,]/g, '').replace(',', '.'),
        custo: document.getElementById('custo').value.replace(/[^\d,]/g, '').replace(',', '.'),
        validade: document.getElementById('validade').value,
        dataCadastro: new Date().toISOString()
    };
    
    const id = document.getElementById('assinanteId').value;
    
    if (id === '') {
        assinantes.push(assinante);
    } else {
        assinantes[id] = assinante;
    }
    
    salvarDados();
    fecharModal();
    atualizarDashboard();
    renderizarTabela();
    criarGraficos();
    verificarAlertas();
}

function editarAssinante(index) {
    const assinante = assinantes[index];
    
    document.getElementById('assinanteId').value = index;
    document.getElementById('nome').value = assinante.nome;
    document.getElementById('whatsapp').value = assinante.whatsapp;
    document.getElementById('formaPagamento').value = assinante.formaPagamento;
    document.getElementById('valor').value = formatarMoeda(assinante.valor);
    document.getElementById('custo').value = formatarMoeda(assinante.custo);
    document.getElementById('validade').value = assinante.validade;
    
    document.getElementById('tituloModal').textContent = 'Editar Assinante';
    document.getElementById('modalCadastro').style.display = 'block';
}

function deletarAssinante(index) {
    if (confirm('Tem certeza que deseja excluir este assinante?')) {
        assinantes.splice(index, 1);
        salvarDados();
        atualizarDashboard();
        renderizarTabela();
        criarGraficos();
    }
}

// PERFIL DO CLIENTE
function verPerfil(index) {
    const assinante = assinantes[index];
    const diasRestantes = calcularDiasRestantes(assinante.validade);
    const status = determinarStatus(diasRestantes);
    
    const historico = historicoPagamentos.filter(h => h.assinanteIndex === index);
    
    let htmlHistorico = '<p>Nenhum pagamento registrado</p>';
    if (historico.length > 0) {
        htmlHistorico = '<ul>';
        historico.forEach(h => {
            htmlHistorico += `<li>${formatarData(h.data)} - ${formatarMoeda(h.valor)}</li>`;
        });
        htmlHistorico += '</ul>';
    }
    
    const conteudo = `
        <h2>${assinante.nome}</h2>
        <div class="perfil-info">
            <p><strong>WhatsApp:</strong> ${assinante.whatsapp}</p>
            <p><strong>Forma de Pagamento:</strong> ${assinante.formaPagamento}</p>
            <p><strong>Valor:</strong> ${formatarMoeda(assinante.valor)}</p>
            <p><strong>Custo:</strong> ${formatarMoeda(assinante.custo)}</p>
            <p><strong>Lucro:</strong> ${formatarMoeda(assinante.valor - assinante.custo)}</p>
            <p><strong>Validade:</strong> ${formatarData(assinante.validade)}</p>
            <p><strong>Status:</strong> <span class="badge badge-${status}">${status.toUpperCase()}</span></p>
            <p><strong>Dias Restantes:</strong> ${diasRestantes}</p>
        </div>
        <h3>Histórico de Pagamentos</h3>
        ${htmlHistorico}
        <button class="btn-primary" onclick="registrarPagamento(${index})">Registrar Pagamento</button>
    `;
    
    document.getElementById('conteudoPerfil').innerHTML = conteudo;
    document.getElementById('modalPerfil').style.display = 'block';
}

function fecharModalPerfil() {
    document.getElementById('modalPerfil').style.display = 'none';
}

function registrarPagamento(index) {
    const valor = assinantes[index].valor;
    const hoje = new Date();
    const novaValidade = new Date(assinantes[index].validade);
    novaValidade.setMonth(novaValidade.getMonth() + 1);
    
    assinantes[index].validade = novaValidade.toISOString().split('T')[0];
    
    historicoPagamentos.push({
        assinanteIndex: index,
        data: hoje.toISOString(),
        valor: valor
    });
    
    salvarDados();
    alert('Pagamento registrado! Validade atualizada.');
    fecharModalPerfil();
    atualizarDashboard();
    renderizarTabela();
}

// FILTROS
function filtrarStatus(status) {
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderizarTabela(status);
}

function filtrarPorPagamento() {
    const pagamento = document.getElementById('filtroPagamento').value;
    const tbody = document.getElementById('tabelaAssinantes');
    tbody.innerHTML = '';
    
    let filtrados = assinantes;
    if (pagamento) {
        filtrados = assinantes.filter(a => a.formaPagamento === pagamento);
    }
    
    filtrados.forEach((assinante, index) => {
        const diasRestantes = calcularDiasRestantes(assinante.validade);
        const status = determinarStatus(diasRestantes);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${assinante.nome}</td>
            <td>${assinante.whatsapp}</td>
            <td>${assinante.formaPagamento}</td>
            <td>${formatarMoeda(assinante.valor)}</td>
            <td>${formatarData(assinante.validade)}</td>
            <td>${diasRestantes} dias</td>
            <td><span class="badge badge-${status}">${status.toUpperCase()}</span></td>
            <td>
                <button class="btn-acao btn-ver" onclick="verPerfil(${index})">👁️</button>
                <button class="btn-acao btn-editar" onclick="editarAssinante(${index})">✏️</button>
                <button class="btn-acao btn-deletar" onclick="deletarAssinante(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function buscarAssinante() {
    const busca = document.getElementById('buscarAssinante').value.toLowerCase();
    const filtrados = assinantes.filter(a => a.nome.toLowerCase().includes(busca));
    
    const tbody = document.getElementById('tabelaAssinantes');
    tbody.innerHTML = '';
    
    filtrados.forEach((assinante, index) => {
        const diasRestantes = calcularDiasRestantes(assinante.validade);
        const status = determinarStatus(diasRestantes);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${assinante.nome}</td>
            <td>${assinante.whatsapp}</td>
            <td>${assinante.formaPagamento}</td>
            <td>${formatarMoeda(assinante.valor)}</td>
            <td>${formatarData(assinante.validade)}</td>
            <td>${diasRestantes} dias</td>
            <td><span class="badge badge-${status}">${status.toUpperCase()}</span></td>
            <td>
                <button class="btn-acao btn-ver" onclick="verPerfil(${index})">👁️</button>
                <button class="btn-acao btn-editar" onclick="editarAssinante(${index})">✏️</button>
                <button class="btn-acao btn-deletar" onclick="deletarAssinante(${index})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ALERTAS E NOTIFICAÇÕES
function verificarAlertas() {
    const listaAlertas = document.getElementById('listaAlertas');
    listaAlertas.innerHTML = '';
    
    assinantes.forEach((assinante, index) => {
        const diasRestantes = calcularDiasRestantes(assinante.validade);
        
        if (diasRestantes <= 5 && diasRestantes > 0) {
            const alert = document.createElement('div');
            alert.className = 'alert-item alert-aviso';
            alert.innerHTML = `
                <span>⚠️ ${assinante.nome} vence em ${diasRestantes} dias</span>
                <button class="btn-acao btn-ver" onclick="verPerfil(${index})">Ver</button>
            `;
            listaAlertas.appendChild(alert);
        } else if (diasRestantes < 0) {
            const alert = document.createElement('div');
            alert.className = 'alert-item alert-erro';
            alert.innerHTML = `
                <span>❌ ${assinante.nome} está vencido há ${Math.abs(diasRestantes)} dias</span>
                <button class="btn-acao btn-ver" onclick="verPerfil(${index})">Ver</button>
            `;
            listaAlertas.appendChild(alert);
        }
    });
    
    if (listaAlertas.children.length === 0) {
        listaAlertas.innerHTML = '<p>✅ Nenhum alerta no momento</p>';
    }
}

// EXPORTAR PDF
function exportarPDF() {
    alert('Funcionalidade de exportar PDF será implementada em breve!');
}

function exportarExcel() {
    alert('Funcionalidade de exportar Excel será implementada em breve!');
}

// MÁSCARAS
function aplicarMascaras() {
    const whatsappInput = document.getElementById('whatsapp');
    whatsappInput.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/\D/g, '');
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2');
        valor = valor.replace(/(\d)(\d{4})$/, '$1-$2');
        e.target.value = valor;
    });
    
    const valorInput = document.getElementById('valor');
    const custoInput = document.getElementById('custo');
    
    [valorInput, custoInput].forEach(input => {
        input.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            valor = (parseInt(valor) / 100).toFixed(2);
            valor = valor.replace('.', ',');
            valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
            e.target.value = 'R$ ' + valor;
        });
    });
}

// UTILITÁRIOS
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function formatarData(data) {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
}

function salvarDados() {
    localStorage.setItem('assinantes', JSON.stringify(assinantes));
    localStorage.setItem('historicoPagamentos', JSON.stringify(historicoPagamentos));
}

// Fechar modais ao clicar fora
window.onclick = function(event) {
    const modalCadastro = document.getElementById('modalCadastro');
    const modalPerfil = document.getElementById('modalPerfil');
    
    if (event.target == modalCadastro) {
        modalCadastro.style.display = 'none';
    }
    if (event.target == modalPerfil) {
        modalPerfil.style.display = 'none';
    }
}
