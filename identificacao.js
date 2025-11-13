// Máscara para CPF/CNPJ
function aplicarMascara(valor) {
    // Remove tudo que não é dígito
    valor = valor.replace(/\D/g, '');
    
    if (valor.length <= 11) {
        // Máscara CPF: 000.000.000-00
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // Máscara CNPJ: 00.000.000/0000-00
        valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
        valor = valor.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    return valor;
}

// Aplicar máscara no input
const inputCpfCnpj = document.getElementById('cpfCnpj');

inputCpfCnpj.addEventListener('input', function(e) {
    e.target.value = aplicarMascara(e.target.value);
});

// Validar CPF
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

// Validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
        return false;
    }
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
}

// Validar formulário
function validarFormulario(event) {
    event.preventDefault();
    
    const cpfCnpj = document.getElementById('cpfCnpj').value;
    const formGroup = document.querySelector('.form-group');
    
    // Remove mensagens anteriores
    const erroAnterior = formGroup.querySelector('.error-message');
    if (erroAnterior) {
        erroAnterior.remove();
    }
    formGroup.classList.remove('error');
    
    // Remove mensagem de sucesso anterior
    const sucessoAnterior = document.querySelector('.success-message');
    if (sucessoAnterior) {
        sucessoAnterior.remove();
    }
    
    const valorLimpo = cpfCnpj.replace(/\D/g, '');
    let isValid = false;
    
    if (valorLimpo.length === 11) {
        isValid = validarCPF(cpfCnpj);
    } else if (valorLimpo.length === 14) {
        isValid = validarCNPJ(cpfCnpj);
    }
    
    if (!isValid) {
        formGroup.classList.add('error');
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'CPF/CNPJ inválido. Por favor, verifique os dados informados.';
        formGroup.appendChild(errorMsg);
        return false;
    }
    
    // Mostrar mensagem de sucesso
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = '✓ Documento validado com sucesso! Redirecionando...';
    
    const form = document.getElementById('formIdentificacao');
    form.insertBefore(successMsg, form.firstChild);
    
    // Simular redirecionamento
    setTimeout(() => {
        alert('Documento validado: ' + cpfCnpj);
        // Aqui você pode redirecionar para outra página
        // window.location.href = 'proxima-pagina.html';
    }, 1500);
    
    return false;
}
