let resultadoCalculo = null;

function calcularDrinks() {
    const numPessoas = parseInt(document.getElementById('numPessoas').value);
    const duracao = parseInt(document.getElementById('duracaoFesta').value);
    const tipoFesta = document.getElementById('tipoFesta').value;
    const incluirAlcoolicos = document.getElementById('incluirAlcoolicos').checked;
    const incluirNaoAlcoolicos = document.getElementById('incluirNaoAlcoolicos').checked;
    
    // Validações
    if (isNaN(numPessoas) || numPessoas < 1) {
        alert('Por favor, insira um número válido de pessoas.');
        return;
    }
    
    if (isNaN(duracao) || duracao < 1) {
        alert('Por favor, insira uma duração válida.');
        return;
    }
    
    // Definir drinks por pessoa por hora baseado no tipo de festa
    let drinksPorPessoaPorHora;
    switch(tipoFesta) {
        case 'leve':
            drinksPorPessoaPorHora = 1.5;
            break;
        case 'moderada':
            drinksPorPessoaPorHora = 2;
            break;
        case 'intensa':
            drinksPorPessoaPorHora = 3;
            break;
        default:
            drinksPorPessoaPorHora = 2;
    }
    
    // Calcular total de drinks
    const totalDrinks = Math.ceil(numPessoas * duracao * drinksPorPessoaPorHora);
    
    // Calcular distribuição de bebidas
    const resultado = {
        pessoas: numPessoas,
        duracao: duracao,
        totalDrinks: totalDrinks,
        alcoolicas: {},
        naoAlcoolicas: {},
        extras: {}
    };
    
    // Bebidas alcoólicas (60% do total se ambas estiverem marcadas, 100% se só alcoólicas)
    if (incluirAlcoolicos) {
        const percentualAlcoolico = incluirNaoAlcoolicos ? 0.6 : 1.0;
        const drinksAlcoolicos = Math.ceil(totalDrinks * percentualAlcoolico);
        
        resultado.alcoolicas = {
            'Cerveja (Latas 350ml)': Math.ceil(drinksAlcoolicos * 0.40),
            'Cerveja (Long Neck)': Math.ceil(drinksAlcoolicos * 0.20),
            'Vinho (Garrafas)': Math.ceil((drinksAlcoolicos * 0.15) / 6),
            'Vodka (Garrafas)': Math.ceil((drinksAlcoolicos * 0.10) / 12),
            'Whisky (Garrafas)': Math.ceil((drinksAlcoolicos * 0.08) / 12),
            'Caipirinha (Doses)': Math.ceil(drinksAlcoolicos * 0.07)
        };
    }
    
    // Bebidas não alcoólicas
    if (incluirNaoAlcoolicos) {
        const percentualNaoAlcoolico = incluirAlcoolicos ? 0.4 : 1.0;
        const drinksNaoAlcoolicos = Math.ceil(totalDrinks * percentualNaoAlcoolico);
        
        resultado.naoAlcoolicas = {
            'Refrigerante (2L)': Math.ceil((drinksNaoAlcoolicos * 0.35) / 8),
            'Suco (1L)': Math.ceil((drinksNaoAlcoolicos * 0.25) / 4),
            'Água (1.5L)': Math.ceil((drinksNaoAlcoolicos * 0.25) / 6),
            'Energético (Latas)': Math.ceil(drinksNaoAlcoolicos * 0.15)
        };
    }
    
    // Itens extras
    resultado.extras = {
        'Gelo (kg)': Math.ceil(numPessoas * 0.5 * duracao),
        'Limão (unidades)': Math.ceil(numPessoas * 0.3),
        'Copos Descartáveis': Math.ceil(numPessoas * duracao * 2),
        'Guardanapos': Math.ceil(numPessoas * 5),
        'Canudos': Math.ceil(numPessoas * duracao * 1.5)
    };
    
    resultadoCalculo = resultado;
    exibirResultado(resultado, incluirAlcoolicos, incluirNaoAlcoolicos);
}

function exibirResultado(resultado, incluirAlcoolicos, incluirNaoAlcoolicos) {
    // Mostrar seção de resultado
    const resultadoSection = document.getElementById('resultado');
    resultadoSection.style.display = 'block';
    
    // Scroll suave até o resultado
    setTimeout(() => {
        resultadoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    
    // Preencher resumo
    document.getElementById('totalPessoas').textContent = resultado.pessoas + ' pessoas';
    document.getElementById('totalHoras').textContent = resultado.duracao + ' horas';
    document.getElementById('totalDrinks').textContent = resultado.totalDrinks + ' drinks';
    
    // Bebidas alcoólicas
    const alcoolicasDiv = document.getElementById('bebidasAlcoolicas');
    const alcoolicasGrid = document.getElementById('alcoolicasGrid');
    
    if (incluirAlcoolicos) {
        alcoolicasDiv.style.display = 'block';
        alcoolicasGrid.innerHTML = '';
        
        for (const [bebida, quantidade] of Object.entries(resultado.alcoolicas)) {
            const card = document.createElement('div');
            card.className = 'bebida-card';
            card.innerHTML = `
                <div class="nome">${bebida}</div>
                <div class="quantidade">${quantidade}</div>
            `;
            alcoolicasGrid.appendChild(card);
        }
    } else {
        alcoolicasDiv.style.display = 'none';
    }
    
    // Bebidas não alcoólicas
    const naoAlcoolicasDiv = document.getElementById('bebidasNaoAlcoolicas');
    const naoAlcoolicasGrid = document.getElementById('naoAlcoolicasGrid');
    
    if (incluirNaoAlcoolicos) {
        naoAlcoolicasDiv.style.display = 'block';
        naoAlcoolicasGrid.innerHTML = '';
        
        for (const [bebida, quantidade] of Object.entries(resultado.naoAlcoolicas)) {
            const card = document.createElement('div');
            card.className = 'bebida-card';
            card.innerHTML = `
                <div class="nome">${bebida}</div>
                <div class="quantidade">${quantidade}</div>
            `;
            naoAlcoolicasGrid.appendChild(card);
        }
    } else {
        naoAlcoolicasDiv.style.display = 'none';
    }
    
    // Extras
    const extrasGrid = document.getElementById('extrasGrid');
    extrasGrid.innerHTML = '';
    
    for (const [item, quantidade] of Object.entries(resultado.extras)) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'extra-item';
        itemDiv.innerHTML = `
            <span class="nome">${item}</span>
            <span class="quantidade">${quantidade}</span>
        `;
        extrasGrid.appendChild(itemDiv);
    }
}

function compartilharCalculo() {
    if (!resultadoCalculo) {
        alert('Nenhum cálculo foi realizado ainda.');
        return;
    }
    
    let mensagem = `🍹 *LISTA DE DRINKS PARA FESTA* 🎉\n\n`;
    mensagem += `👥 Pessoas: ${resultadoCalculo.pessoas}\n`;
    mensagem += `⏰ Duração: ${resultadoCalculo.duracao} horas\n`;
    mensagem += `🍸 Total de Drinks: ${resultadoCalculo.totalDrinks}\n\n`;
    
    // Bebidas alcoólicas
    if (Object.keys(resultadoCalculo.alcoolicas).length > 0) {
        mensagem += `🍺 *BEBIDAS ALCOÓLICAS:*\n`;
        for (const [bebida, quantidade] of Object.entries(resultadoCalculo.alcoolicas)) {
            mensagem += `• ${bebida}: ${quantidade}\n`;
        }
        mensagem += `\n`;
    }
    
    // Bebidas não alcoólicas
    if (Object.keys(resultadoCalculo.naoAlcoolicas).length > 0) {
        mensagem += `🥤 *BEBIDAS NÃO ALCOÓLICAS:*\n`;
        for (const [bebida, quantidade] of Object.entries(resultadoCalculo.naoAlcoolicas)) {
            mensagem += `• ${bebida}: ${quantidade}\n`;
        }
        mensagem += `\n`;
    }
    
    // Extras
    mensagem += `🧊 *ITENS EXTRAS:*\n`;
    for (const [item, quantidade] of Object.entries(resultadoCalculo.extras)) {
        mensagem += `• ${item}: ${quantidade}\n`;
    }
    
    // Copiar para clipboard
    navigator.clipboard.writeText(mensagem).then(() => {
        mostrarToast('✅ Lista copiada para a área de transferência!');
    }).catch(() => {
        mostrarToast('❌ Erro ao copiar lista');
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

function exportarPDF() {
    if (!resultadoCalculo) {
        alert('Nenhum cálculo foi realizado ainda.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Cores
    const corPrimaria = [240, 147, 251];
    const corSecundaria = [245, 87, 108];
    const corTexto = [51, 51, 51];
    const corCinza = [128, 128, 128];
    
    // Header com gradiente simulado
    doc.setFillColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('LISTA DE DRINKS', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Calculadora para Festa', 105, 30, { align: 'center' });
    
    // Data
    doc.setFontSize(10);
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, 105, 38, { align: 'center' });
    
    let y = 55;
    
    // Box de Resumo
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, y, 180, 35, 3, 3, 'F');
    
    doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    
    doc.text(`Pessoas: ${resultadoCalculo.pessoas}`, 25, y + 10);
    doc.text(`Duracao: ${resultadoCalculo.duracao} horas`, 25, y + 20);
    
    doc.setFontSize(14);
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(`Total de Drinks: ${resultadoCalculo.totalDrinks}`, 25, y + 30);
    
    y += 45;
    
    // Bebidas Alcoólicas
    if (Object.keys(resultadoCalculo.alcoolicas).length > 0) {
        // Título da seção
        doc.setFillColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
        doc.rect(15, y, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('BEBIDAS ALCOOLICAS', 20, y + 5.5);
        
        y += 12;
        
        doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        for (const [bebida, quantidade] of Object.entries(resultadoCalculo.alcoolicas)) {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(20, y, 170, 8, 2, 2, 'F');
            
            doc.text(`* ${bebida}`, 25, y + 5.5);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
            doc.text(`${quantidade}`, 180, y + 5.5, { align: 'right' });
            doc.setFont(undefined, 'normal');
            doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
            
            y += 10;
        }
        
        y += 5;
    }
    
    // Bebidas Não Alcoólicas
    if (Object.keys(resultadoCalculo.naoAlcoolicas).length > 0) {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }
        
        // Título da seção
        doc.setFillColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
        doc.rect(15, y, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('BEBIDAS NAO ALCOOLICAS', 20, y + 5.5);
        
        y += 12;
        
        doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        for (const [bebida, quantidade] of Object.entries(resultadoCalculo.naoAlcoolicas)) {
            if (y > 270) {
                doc.addPage();
                y = 20;
            }
            
            doc.setFillColor(250, 250, 250);
            doc.roundedRect(20, y, 170, 8, 2, 2, 'F');
            
            doc.text(`* ${bebida}`, 25, y + 5.5);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
            doc.text(`${quantidade}`, 180, y + 5.5, { align: 'right' });
            doc.setFont(undefined, 'normal');
            doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
            
            y += 10;
        }
        
        y += 5;
    }
    
    // Itens Extras
    if (y > 230) {
        doc.addPage();
        y = 20;
    }
    
    // Título da seção
    doc.setFillColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.rect(15, y, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ITENS EXTRAS', 20, y + 5.5);
    
    y += 12;
    
    doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    for (const [item, quantidade] of Object.entries(resultadoCalculo.extras)) {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(20, y, 170, 8, 2, 2, 'F');
        
        doc.text(`* ${item}`, 25, y + 5.5);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
        doc.text(`${quantidade}`, 180, y + 5.5, { align: 'right' });
        doc.setFont(undefined, 'normal');
        doc.setTextColor(corTexto[0], corTexto[1], corTexto[2]);
        
        y += 10;
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(corCinza[0], corCinza[1], corCinza[2]);
        doc.text(
            `Pagina ${i} de ${pageCount} | Calculadora de Drinks para Festa`,
            105,
            290,
            { align: 'center' }
        );
    }
    
    // Salvar PDF
    doc.save(`Lista-Drinks-${resultadoCalculo.pessoas}-pessoas.pdf`);
    mostrarToast('PDF exportado com sucesso!');
}
