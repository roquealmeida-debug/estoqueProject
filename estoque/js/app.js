const medicamentosArray = [];
const laboratoriosArray = [];
let estoque = {};

// Adicione esta função no início do arquivo
function toUpperCase(input) {
    input.value = input.value.toUpperCase();
}

// Adicione este código após a declaração das variáveis no início do arquivo
document.addEventListener('DOMContentLoaded', function() {
    const inputFields = ['nome', 'laboratorio', 'lote'];
    const selectFields = ['tipoServico', 'tipoMedicamento'];

    inputFields.forEach(field => {
        document.getElementById(field).addEventListener('input', function() {
            toUpperCase(this);
        });
    });

    selectFields.forEach(field => {
        document.getElementById(field).addEventListener('change', function() {
            this.value = this.value.toUpperCase();
        });
    });

    // Modifique o evento para formatar o valorLote
    const valorLoteInput = document.getElementById('valorLote');
    valorLoteInput.addEventListener('input', function() {
        formatCurrency(this);
    });

    // Adicione o event listener para o botão de exportação JSON
    document.getElementById('export-json').addEventListener('click', exportToJSON);
});

// Carregar estoque salvo no localStorage ao iniciar
window.addEventListener('DOMContentLoaded', function() {
    carregarEstoqueDoLocalStorage(); // Carrega o estoque ao iniciar
    verificarMedicamentosVencidos(); // Verifica vencimento após carregar o estoque
});

document.getElementById('form-medicamento').addEventListener('submit', function (event) {
    event.preventDefault();

    if (!validateForm()) {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('feedback').style.display = 'none';
        return;
    }

    const nome = document.getElementById('nome').value.toUpperCase();
    const laboratorio = document.getElementById('laboratorio').value.toUpperCase();
    const tipoServico = document.getElementById('tipoServico').value.toUpperCase();
    const tipoMedicamento = document.getElementById('tipoMedicamento').value.toUpperCase();
    const quantidade = document.getElementById('quantidade').value;
    const validade = document.getElementById('validade').value;
    const valorLote = parseFloat(document.getElementById('valorLote').value.replace('R$ ', '').replace(',', '.'));
    const lote = document.getElementById('lote').value.toUpperCase();
    const valorTotal = (quantidade * valorLote).toFixed(2);

    // Adicionando novo medicamento
    if (!estoque[nome]) {
        estoque[nome] = {
            quantidade: parseInt(quantidade),
            preco: parseFloat(preco)
        };
    } else {
        estoque[nome].quantidade += parseInt(quantidade)
    }

    estoque[nome].push({
        laboratorio, tipoServico, tipoMedicamento, quantidade, validade, valorLote, lote, valorTotal
    });

    // Salvar no localStorage
    salvarEstoqueNoLocalStorage(); // Certifique-se de que esta linha está presente
    exibirEstoqueNaTabela();

    // Atualizar a exibição e o feedback
    document.getElementById('feedback').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    setTimeout(() => {
        document.getElementById('feedback').style.display = 'none';
    }, 3000);
});

// Função para salvar o estoque no localStorage
function salvarEstoqueNoLocalStorage() {
    console.log("Salvando estoque no localStorage:", estoque); // Log para verificar o que está sendo salvo
    localStorage.setItem('estoque', JSON.stringify(estoque));
}

// Função para carregar o estoque do localStorage
function carregarEstoqueDoLocalStorage() {
    try {
        const estoqueSalvo = localStorage.getItem('estoque');
        console.log("Estoque salvo encontrado:", estoqueSalvo); // Verifique se o valor está sendo lido
        if (estoqueSalvo) {
            estoque = JSON.parse(estoqueSalvo);
            console.log("Estoque carregado:", estoque); // Verifique o estoque carregado
            medicamentosArray.push(...Object.keys(estoque));
            laboratoriosArray.push(...new Set(Object.values(estoque).flatMap(lotes => lotes.map(l => l.laboratorio))));
            updateDatalist('medicamentos', medicamentosArray);
            updateDatalist('laboratorios', laboratoriosArray);
            updateFilterLaboratorio(); 
            updateEstoqueDisplay();
            verificarMedicamentosVencidos();
        }
    } catch (e) {
        console.error("Erro ao carregar o estoque do localStorage", e);
        estoque = {};
    }
    console.log("Estoque carregado:", estoque);
}

// Função para validar o formulário
function validateForm() {
    const nome = document.getElementById('nome').value.toUpperCase();
    const laboratorio = document.getElementById('laboratorio').value.toUpperCase();
    const tipoServico = document.getElementById('tipoServico').value.toUpperCase();
    const tipoMedicamento = document.getElementById('tipoMedicamento').value.toUpperCase();
    const quantidade = document.getElementById('quantidade').value;
    const validade = document.getElementById('validade').value;
    const valorLote = document.getElementById('valorLote').value.replace(',', '.');
    const lote = document.getElementById('lote').value.toUpperCase();

    return nome && laboratorio && tipoServico && tipoMedicamento && quantidade && validade && valorLote && lote;
}

// Função para atualizar o datalist
function updateDatalist(datalistId, itemsArray) {
    const datalist = document.getElementById(datalistId);
    datalist.innerHTML = '';
    itemsArray.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });
}

// Função para atualizar o filtro de laboratórios
function updateFilterLaboratorio() {
    const filterLaboratorio = document.getElementById('filter-laboratorio');
    filterLaboratorio.innerHTML = '<option value="">Todos os Laboratórios</option>';

    laboratoriosArray.forEach(laboratorio => {
        const option = document.createElement('option');
        option.value = laboratorio;
        option.innerText = laboratorio;
        filterLaboratorio.appendChild(option);
    });
}

// Função para exibir o estoque filtrado
function updateEstoqueDisplay() {
    const estoqueTableBody = document.getElementById('estoque').querySelector('tbody');
    estoqueTableBody.innerHTML = '';

    const searchValue = document.getElementById('search-bar').value.toLowerCase();
    const filterLaboratorio = document.getElementById('filter-laboratorio').value;

    for (let medicamento in estoque) {
        if (medicamento.toLowerCase().includes(searchValue) && (filterLaboratorio === "" || estoque[medicamento].some(lote => lote.laboratorio === filterLaboratorio))) {
            estoque[medicamento].forEach((lote, index) => {
                if (filterLaboratorio === "" || lote.laboratorio === filterLaboratorio) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${medicamento}</td>
                        <td>${lote.laboratorio}</td>
                        <td>${lote.tipoServico}</td>
                        <td>${lote.tipoMedicamento}</td> <!-- Certifique-se de que esta linha está presente -->
                        <td>${lote.lote}</td>
                        <td>${lote.quantidade}</td>
                        <td>${lote.validade}</td>
                        <td>R$${parseFloat(lote.valorLote).toFixed(2)}</td>
                        <td>R$${parseFloat(lote.valorTotal).toFixed(2)}</td>
                        <td>
                            <button onclick="editarMedicamento('${medicamento}', ${index})">Editar</button>
                            <button onclick="excluirMedicamento('${medicamento}', ${index})">Excluir</button>
                        </td>
                    `;
                    estoqueTableBody.appendChild(row);
                }
            });
        }
    }
}

// Função para exportar para CSV
function exportToCSV() {
    const rows = [];
    // Cabeçalhos
    rows.push(['Nome', 'Laboratório', 'Lote', 'Data de Validade', 'Quantidade', 'Valor', 'Tipo de Medicamento'].join(','));

    // Dados
    for (const [nome, lotes] of Object.entries(estoque)) {
        for (const lote of lotes) {
            rows.push([
                nome,
                lote.laboratorio,
                lote.lote,
                lote.validade,
                lote.quantidade,
                lote.valorLote,
                lote.tipoMedicamento
            ].join(','));
        }
    }

    const csvString = rows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estoque_medicamentos.csv';
    a.click();
    URL.revokeObjectURL(url);
}

function exibirEstoqueNaTabela() {
    const tabelaEstoque = document.getElementById('estoque');
    tabelaEstoque.innerHTML = ''; // Limpa a tabela antes de preencher

    // Verifica se há itens no estoque
    if (Object.keys(estoque).length === 0) {
        const linha = tabelaEstoque.insertRow();
        const cell = linha.insertCell();
        cell.colSpan = 4; // Se você tiver 4 colunas
        cell.textContent = 'Nenhum medicamento no estoque.';
        return;
    }

    // Itera sobre o objeto estoque e insere uma nova linha para cada item
    for (let nome in estoque) {
        const medicamento = estoque[nome];
        const linha = tabelaEstoque.insertRow();

        const cellNome = linha.insertCell();
        cellNome.textContent = nome;

        const cellQuantidade = linha.insertCell();
        cellQuantidade.textContent = medicamento.quantidade;

        const cellPreco = linha.insertCell();
        cellPreco.textContent = medicamento.preco;

        // Adiciona mais células conforme necessário, como para o botão de editar ou excluir
    }
}

// Função para exportar para Excel
function exportToExcel() {
    const rows = [];
    for (const [nome, lotes] of Object.entries(estoque)) {
        for (const lote of lotes) {
            rows.push({
                Nome: nome,
                Laboratório: lote.laboratorio,
                Lote: lote.lote,
                DataDeValidade: lote.validade,
                Quantidade: lote.quantidade,
                Valor: lote.valorLote,
                TipoDeMedicamento: lote.tipoMedicamento
            });
        }
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicamentos');
    XLSX.writeFile(workbook, 'estoque_medicamentos.xlsx');
}

async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const estoque = JSON.parse(localStorage.getItem('estoque')) || {};
    const doc = new jsPDF();

    // Função para formatar valores monetários
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);

    // Definir larguras fixas para cada coluna
    const colWidths = {
        lote: 20,
        validade: 30,
        tipoServico: 25,
        tipoMedicamento: 30,
        quantidade: 20,
        valorTotal: 30,
        laboratorio: 40,
    };

    let y = 20; // Posição inicial Y
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 10; // Margem esquerda
    const rightMargin = 10; // Margem direita

    // Títulos
    doc.setFontSize(10);
    doc.text('Posição de Estabelecimento', pageWidth / 2, y, { align: 'center' });
    y += 6; // Espaço reduzido após o título
    doc.setFontSize(9);
    doc.text(`Estoque em: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 6; // Espaço reduzido após o título de data

    Object.keys(estoque).forEach((medicamentoNome) => {
        const lotes = estoque[medicamentoNome];

        // Cabeçalho do medicamento
        doc.setFontSize(10);
        const rectHeight = 8; // Altura do retângulo
        const rectY = y; // Posição Y do retângulo

        // Desenhar o retângulo cinza
        doc.setFillColor(220, 220, 220); // Cor cinza
        doc.rect(0, rectY, pageWidth, rectHeight, 'F'); // Desenha o retângulo

        // Centralizar o texto à esquerda dentro do retângulo
        doc.setTextColor(0); // Cor do texto (preto)
        doc.text(`${medicamentoNome}`, leftMargin, rectY + 5); // Adiciona 5 para posicionar o texto no meio do retângulo

        y += rectHeight + 3; // Ajustar Y para a próxima seção (menos espaço abaixo do retângulo)

        // Resetar cor do texto e fonte para os lotes
        doc.setFontSize(7);
        let totalQuantidade = 0; // Para somar a quantidade
        let totalValor = 0; // Para somar o valor total

        lotes.forEach((lote) => {
            // Informações do lote
            let x = leftMargin; // Reinicia a posição X para as informaões do lote

            // Desenhar informações centralizadas
            doc.text(lote.lote, x + (colWidths.lote / 2), y, { align: 'center' });
            x += colWidths.lote; // Atualiza x para a próxima coluna

            doc.text(lote.validade, x + (colWidths.validade / 2), y, { align: 'center' });
            x += colWidths.validade; // Atualiza x para a próxima coluna

            let tipoServicoLines = doc.splitTextToSize(lote.tipoServico, colWidths.tipoServico);
            tipoServicoLines.forEach((line, index) => {
                doc.text(line, x + (colWidths.tipoServico / 2), y + (index * 3), { align: 'center' });
            });
            x += colWidths.tipoServico; // Atualiza x para a próxima coluna

            doc.text(lote.tipoMedicamento, x + (colWidths.tipoMedicamento / 2), y, { align: 'center' });
            x += colWidths.tipoMedicamento; // Atualiza x para a próxima coluna

            // A quantidade agora é tratada como um número
            const quantidade = Number(lote.quantidade);
            doc.text(quantidade.toString(), x + (colWidths.quantidade / 2), y, { align: 'center' });
            totalQuantidade += quantidade; // Acumula a quantidade total
            x += colWidths.quantidade; // Atualiza x para a próxima coluna

            // O valor do lote agora é tratado corretamente como número
            const valorLote = Number(lote.valorLote);
            doc.text(formatCurrency(valorLote), x + (colWidths.valorTotal / 2), y, { align: 'center' });
            totalValor += valorLote; // Acumula o valor total
            x += colWidths.valorTotal; // Atualiza x para a próxima coluna

            // Quebrar texto em várias linhas
            let laboratorioLines = doc.splitTextToSize(lote.laboratorio, colWidths.laboratorio);
            laboratorioLines.forEach((line, index) => {
                doc.text(line, x + (colWidths.laboratorio / 2), y + (index * 3), { align: 'center' });
            });

            y += 3 * Math.max(tipoServicoLines.length, laboratorioLines.length); // Ajustar posião y conforme o número de linhas mais longo
            y += 3; // Espaçamento extra após cada lote
        });

        // Total de Quantidade e Valor após cada medicamento, alinhado à direita na tabela
        y += 3; // Espaçamento extra antes dos totais
        const totalX = leftMargin + colWidths.lote + colWidths.validade + colWidths.tipoServico + 5; // X para o total

        doc.setFontSize(7);
        doc.text(`Total:`, totalX + 7, y); // Texto "Total"
        doc.text(`${totalQuantidade}`, totalX + 33, y); // Quantidade
        doc.text(`${formatCurrency(totalValor)}`, totalX + 55, y); // Valor total

        y += 5; // Espaçamento extra após cada medicamento
    });

    // Finalizar o PDF e salvar
    doc.save('estoque_medicamentos.pdf');
}

window.onload = function() {
    carregarEstoqueDoLocalStorage();
    exibirEstoqueNaTabela(); // Exibe o estoque na tabela ao carregar a página
};


// Função para editar medicamento
function editarMedicamento(medicamento, index) {
    const lote = estoque[medicamento][index];
    document.getElementById('nome').value = medicamento;
    document.getElementById('laboratorio').value = lote.laboratorio;
    document.getElementById('tipoServico').value = lote.tipoServico;
    document.getElementById('tipoMedicamento').value = lote.tipoMedicamento; // Certifique-se de que esta linha está presente
    document.getElementById('quantidade').value = lote.quantidade;
    document.getElementById('validade').value = lote.validade;
    document.getElementById('valorLote').value = `R$ ${lote.valorLote.toFixed(2).replace('.', ',')}`;
    document.getElementById('lote').value = lote.lote;
    document.getElementById('edit-index').value = index; // Salva o índice para edição
    document.getElementById('nome').disabled = true; // Desabilita o campo nome durante edição
}

// Função para excluir medicamento
function excluirMedicamento(medicamento, index) {
    estoque[medicamento].splice(index, 1);
    if (estoque[medicamento].length === 0) {
        delete estoque[medicamento];
        medicamentosArray.splice(medicamentosArray.indexOf(medicamento), 1);
        updateDatalist('medicamentos', medicamentosArray);
    }
    salvarEstoqueNoLocalStorage(); // Salva após a exclusão
    updateEstoqueDisplay(); // Atualiza a exibição
}

// Função para verificar medicamentos vencidos
function verificarMedicamentosVencidos() {
    const hoje = new Date();
    const notificacaoDiv = document.getElementById('notificacao-vencimento');
    notificacaoDiv.innerHTML = ''; // Limpa notificações anteriores

    let temVencidos = false; // Flag para verificar se há medicamentos vencidos

    for (const [nome, lotes] of Object.entries(estoque)) {
        lotes.forEach(lote => {
            const dataValidade = new Date(lote.validade);
            if (dataValidade < hoje) {
                temVencidos = true; // Marca que há medicamentos vencidos
                const mensagem = `O medicamento "${nome}" do lote "${lote.lote}" está vencido!`;
                const p = document.createElement('p');
                p.textContent = mensagem;
                notificacaoDiv.appendChild(p);
            }
        });
    }

    // Se não houver medicamentos vencidos, exiba uma mensagem padrão
    if (!temVencidos) {
        notificacaoDiv.innerHTML = '<p>Não há medicamentos vencidos.</p>';
        notificacaoDiv.classList.add('success'); // Adiciona classe de sucesso
    } else {
        notificacaoDiv.classList.remove('success'); // Remove classe de sucesso se houver vencidos
    }
}

// Função para resetar o formulário
function resetForm() {
    document.getElementById('form-medicamento').reset();
    document.getElementById('edit-index').value = "";
    document.getElementById('nome').disabled = false; // Reabilita o campo nome
}

// Filtro de pesquisa
document.getElementById('search-bar').addEventListener('input', updateEstoqueDisplay);
document.getElementById('filter-laboratorio').addEventListener('change', updateEstoqueDisplay);
// Eventos para exportação
document.getElementById('export-csv').addEventListener('click', exportToCSV);
document.getElementById('export-excel').addEventListener('click', exportToExcel);
document.getElementById('export-pdf').addEventListener('click', exportToPDF);

// Modifique a função formatCurrency
function formatCurrency(input) {
    const value = input.value.replace(/\D/g, '');
    input.value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);
}

// Adicione estas funções no final do arquivo

// Função para exportar dados para JSON
function exportToJSON() {
    const data = JSON.stringify(estoque);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'estoque_medicamentos.json';
    a.click();
    URL.revokeObjectURL(url);
}


// Adicione estes event listeners no final do arquivo
document.getElementById('export-json').addEventListener('click', exportToJSON);
document.getElementById('import-json').addEventListener('change', importFromJSON);

console.log(estoque); // Adicione esta linha para verificar o conteúdo do estoque

// Teste a função diretamente
function testExport() {
    estoque = {
        "Medicamento A": [
            {
                laboratorio: "Laboratório X",
                lote: "12345",
                validade: "2023-12-31",
                quantidade: 10,
                valorLote: 50.00,
                tipoMedicamento: "Comprimido"
            }
        ]
    };
    exportToJSON();
}

document.getElementById('import-file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                console.log("Dados importados:", importedData);

                // Verificar se os dados importados são válidos
                if (importedData && typeof importedData === 'object') {
                    // Mesclar os dados importados com o estoque atual
                    estoque = { ...estoque, ...importedData };

                    // Atualizar arrays e exibição
                    medicamentosArray.push(...Object.keys(importedData));
                    laboratoriosArray.push(...new Set(Object.values(importedData).flatMap(lotes => lotes.map(l => l.laboratorio))));

                    salvarEstoqueNoLocalStorage();  // Salva o estoque atualizado
                    updateDatalist('medicamentos', medicamentosArray);
                    updateDatalist('laboratorios', laboratoriosArray);
                    updateEstoqueDisplay();
                    verificarMedicamentosVencidos();
                } else {
                    alert('O arquivo JSON é inválido.');
                }
            } catch (error) {
                console.error('Erro ao importar JSON:', error);
                alert('Erro ao importar o arquivo JSON.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('Por favor, selecione um arquivo JSON válido.');
    }
});

// Chame a função de teste
testExport();

console.log("Medicamentos Array:", medicamentosArray);
console.log("Laboratorios Array:", laboratoriosArray);

