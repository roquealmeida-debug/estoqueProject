import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';

const MedicamentoForm = () => {
  const [nome, setNome] = useState('');
  const [laboratorio, setLaboratorio] = useState('');
  const [tipoServico, setTipoServico] = useState('');
  const [tipoMedicamento, setTipoMedicamento] = useState(''); // Inicializado como string vazia
  const [lote, setLote] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [valor, setValor] = useState(''); // Armazenar como string para formatação
  const [medicamentos, setMedicamentos] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // Índice do medicamento a ser editado

  // Carregar medicamentos do localStorage ao iniciar o componente
  useEffect(() => {
    const storedMedicamentos = localStorage.getItem('medicamentos');
    if (storedMedicamentos) {
      setMedicamentos(JSON.parse(storedMedicamentos));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Adicione logs para verificar os valores dos campos
    console.log('Nome:', nome);
    console.log('Laboratório:', laboratorio);
    console.log('Tipo de Serviço:', tipoServico);
    console.log('Tipo de Medicamento:', tipoMedicamento);
    console.log('Lote:', lote);
    console.log('Quantidade:', quantidade);
    console.log('Data de Validade:', dataValidade);
    console.log('Valor:', valor);

    const medicamento = {
        nome: nome.toUpperCase(),
        laboratorio: laboratorio.toUpperCase(),
        tipoServico: tipoServico.toUpperCase(),
        tipoMedicamento: tipoMedicamento.toUpperCase(), // Certifique-se de que este campo está presente
        lotes: [{ 
            lote: lote.toUpperCase(), 
            quantidade, 
            dataValidade, 
            valor: parseFloat(valor.replace(/\./g, '').replace(',', '.')) 
        }], // Converter para número
    };
    console.log('Medicamento a ser salvo:', medicamento);

    // Verifique se os campos estão preenchidos corretamente
    console.log('Medicamento:', medicamento);

    const updatedMedicamentos = editIndex !== null 
        ? medicamentos.map((med, index) => (index === editIndex ? medicamento : med)) 
        : [...medicamentos, medicamento];

    setMedicamentos(updatedMedicamentos);
    localStorage.setItem('medicamentos', JSON.stringify(updatedMedicamentos));
    resetForm();
  };

  const resetForm = () => {
    setNome('');
    setLaboratorio('');
    setTipoServico('');
    setTipoMedicamento('');
    setLote('');
    setQuantidade('');
    setDataValidade('');
    setValor(''); // Resetar valor
    setEditIndex(null); // Resetar o índice de edição
  };

  const handleValueChange = (e) => {
    const inputValue = e.target.value;
    // Remove caracteres não numéricos
    const numericValue = inputValue.replace(/\D/g, '');
    // Formata como moeda
    const formattedValue = formatCurrency(numericValue / 100); // Divide por 100 para formatar corretamente
    setValor(numericValue); // Armazenar o valor numérico
    e.target.value = formattedValue; // Atualiza o campo de entrada com o valor formatado
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleEdit = (index) => {
    const medicamento = medicamentos[index];
    setNome(medicamento.nome);
    setLaboratorio(medicamento.laboratorio);
    setTipoServico(medicamento.tipoServico);
    setTipoMedicamento(medicamento.tipoMedicamento);
    setLote(medicamento.lotes[0].lote);
    setQuantidade(medicamento.lotes[0].quantidade);
    setDataValidade(medicamento.lotes[0].dataValidade);
    setValor(formatCurrency(medicamento.lotes[0].valor)); // Formata o valor para exibição
    setEditIndex(index); // Definir o índice de edição
  };

  const handleDelete = (index) => {
    const updatedMedicamentos = medicamentos.filter((_, i) => i !== index);
    setMedicamentos(updatedMedicamentos);
    localStorage.setItem('medicamentos', JSON.stringify(updatedMedicamentos));
  };

  const exportToJSON = () => {
    const json = JSON.stringify(medicamentos, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'medicamentos.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportToPDF = async () => {
    const estoque = JSON.parse(localStorage.getItem('medicamentos')) || [];
    const doc = new jsPDF();

    // Definir larguras fixas para cada coluna
    const colWidths = {
        lote: 20,
        validade: 30,
        tipoServico: 25,
        tipoMedicamento: 30,
        quantidade: 20,
        valor: 30,
        laboratorio: 40,
    };

    let y = 20; // Posição inicial Y
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftMargin = 10; // Margem esquerda

    // Títulos
    doc.setFontSize(10);
    doc.text('Controle de Estoque de Medicamentos', pageWidth / 2, y, { align: 'center' });
    y += 6; // Espaço reduzido após o título
    doc.setFontSize(9);
    doc.text(`Data: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
    y += 10; // Espaço após a data

    estoque.forEach((medicamento) => {
        // Cabeçalho do medicamento
        doc.setFontSize(10);
        const rectHeight = 8; // Altura do retângulo
        const rectY = y; // Posição Y do retângulo

        // Desenhar o retângulo cinza
        doc.setFillColor(220, 220, 220); // Cor cinza
        doc.rect(0, rectY, pageWidth, rectHeight, 'F'); // Desenha o retângulo

        // Centralizar o texto à esquerda dentro do retângulo
        doc.setTextColor(0); // Cor do texto (preto)
        const nomeMedicamento = medicamento.nome || '';
        doc.text(nomeMedicamento, leftMargin, rectY + 5); // Adiciona 5 para posicionar o texto no meio do retângulo

        y += rectHeight + 3; // Ajustar Y para a próxima seção (menos espaço abaixo do retângulo)

        // Resetar cor do texto e fonte para os lotes
        doc.setFontSize(7);
        let totalQuantidade = 0; // Para somar a quantidade
        let totalValor = 0; // Para somar o valor total

        medicamento.lotes.forEach((lote) => {
            let x = leftMargin; // Reinicia a posição X para as informações do lote

            // Verificações para garantir que os valores são válidos
            const loteText = lote.lote || '';
            const validadeText = lote.dataValidade || '';
            const tipoServicoText = medicamento.tipoServico || '';
            const tipoMedicamentoText = medicamento.tipoMedicamento || '';
            const quantidade = Number(lote.quantidade) || 0;
            const valorLote = Number(lote.valor) || 0;
            const laboratorioText = medicamento.laboratorio || '';

            // Desenhar informações centralizadas
            if (loteText) {
                const loteLines = doc.splitTextToSize(loteText, colWidths.lote);
                loteLines.forEach((line, index) => {
                    const centerX = x + (colWidths.lote / 2);
                    doc.text(line, centerX, y + (index * 5), { align: 'center' }); // Centraliza o texto
                });
            }
            x += colWidths.lote; // Atualiza x para a próxima coluna

            if (validadeText) {
                const validadeLines = doc.splitTextToSize(validadeText, colWidths.validade);
                validadeLines.forEach((line, index) => {
                    const centerX = x + (colWidths.validade / 2);
                    doc.text(line, centerX, y + (index * 5), { align: 'center' });
                });
            }
            x += colWidths.validade; // Atualiza x para a próxima coluna

            // Renderizar tipo de serviço
            if (tipoServicoText) {
                const tipoServicoLines = doc.splitTextToSize(tipoServicoText, colWidths.tipoServico);
                tipoServicoLines.forEach((line, index) => {
                    const centerX = x + (colWidths.tipoServico / 2);
                    doc.text(line, centerX, y + (index * 5), { align: 'center' });
                });
            }
            x += colWidths.tipoServico; // Atualiza x para a próxima coluna

            // Renderizar tipo de medicamento
            if (tipoMedicamentoText) {
                const tipoMedicamentoLines = doc.splitTextToSize(tipoMedicamentoText, colWidths.tipoMedicamento);
                tipoMedicamentoLines.forEach((line, index) => {
                    const centerX = x + (colWidths.tipoMedicamento / 2);
                    doc.text(line, centerX, y + (index * 5), { align: 'center' });
                });
            }
            x += colWidths.tipoMedicamento; // Atualiza x para a próxima coluna

            // A quantidade agora é tratada como um número
            const centerXQuantidade = x + (colWidths.quantidade / 2);
            doc.text(quantidade.toString(), centerXQuantidade, y); // Centraliza a quantidade
            totalQuantidade += quantidade; // Acumula a quantidade total
            x += colWidths.quantidade; // Atualiza x para a próxima coluna

            // O valor do lote agora é tratado corretamente como número
            const centerXValor = x + (colWidths.valor / 2);
            doc.text(formatCurrency(valorLote), centerXValor, y); // Centraliza o valor
            totalValor += valorLote; // Acumula o valor total
            x += colWidths.valor; // Atualiza x para a próxima coluna

            // Quebrar texto em várias linhas para o laboratório
            if (laboratorioText) {
                const laboratorioLines = doc.splitTextToSize(laboratorioText, colWidths.laboratorio);
                laboratorioLines.forEach((line, index) => {
                    const centerX = x + (colWidths.laboratorio / 2);
                    doc.text(line, centerX, y + (index * 5), { align: 'center' });
                });
            }

            // Ajustar a posição Y
            y += 3; // Ajustar posição y conforme o número de linhas mais longo
            y += 3; // Espaçamento extra após cada lote
        });

        // Total de Quantidade e Valor após cada medicamento, alinhado à direita na tabela
        y += 3; // Espaçamento extra antes dos totais
        const totalX = leftMargin + colWidths.lote + colWidths.validade + colWidths.tipoServico + 5; // X para o total

        doc.setFontSize(7);
        // Centralizar o texto "Total"
        const totalText = `Total:`;
        const totalTextWidth = doc.getTextWidth(totalText);
        doc.text(totalText, totalX + (colWidths.tipoServico / 2) - (totalTextWidth / 2), y); // Centraliza o texto "Total"

        // Alinhar quantidade total
        const quantidadeX = totalX + (colWidths.tipoServico + 10);
        doc.text(`${totalQuantidade}`, quantidadeX, y); // Centraliza a quantidade total

        // Alinhar valor total
        const valorX = totalX + (colWidths.tipoServico + 35);
        doc.text(`${formatCurrency(totalValor)}`, valorX, y); // Centraliza o valor total

        y += 5; // Espaçamento extra após cada medicamento
    });

    // Finalizar o PDF e salvar
    doc.save('estoque_medicamentos.pdf');
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) {
        alert("Por favor, selecione um arquivo.");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            // Verifique se data é um array e se contém objetos com a estrutura correta
            if (Array.isArray(data) && data.every(item => item.nome && item.laboratorio && item.tipoServico && item.tipoMedicamento && item.lotes)) {
                setMedicamentos(data);
                localStorage.setItem('medicamentos', JSON.stringify(data)); // Salvar no localStorage
            } else {
                console.error("Os dados importados não estão no formato correto.");
                alert("Os dados importados não estão no formato correto.");
            }
        } catch (error) {
            console.error("Erro ao importar JSON:", error);
            alert("Erro ao importar JSON. Verifique o formato do arquivo.");
        }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
        />
        <input
            type="text"
            placeholder="Laboratório"
            value={laboratorio}
            onChange={(e) => setLaboratorio(e.target.value)}
            required
        />
        <select
            value={tipoServico}
            onChange={(e) => setTipoServico(e.target.value)}
            required
            aria-label="Tipo de Serviço" // Adicione um aria-label
        >
            <option value="">Selecione um tipo de serviço...</option>
            <option value="ANEMIA FALCIFORME">ANEMIA FALCIFORME</option>
            <option value="ANTIMICROBIANOS">ANTIMICROBIANOS</option>
            {/* Adicione mais opções conforme necessário */}
        </select>
        <select
            value={tipoMedicamento}
            onChange={(e) => setTipoMedicamento(e.target.value)}
            required
            aria-label="Tipo de Medicamento" // Adicione um aria-label
        >
            <option value="">Selecione um tipo de medicamento...</option>
            <option value="ADESIVO">ADESIVO</option>
            <option value="AMPOLA">AMPOLA</option>
            {/* Adicione mais opções conforme necessário */}
        </select>
        <input
            type="text"
            placeholder="Lote"
            value={lote}
            onChange={(e) => setLote(e.target.value)}
            required
        />
        <input
            type="number"
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            required
        />
        <input
            type="date"
            placeholder="Data de Validade"
            value={dataValidade}
            onChange={(e) => setDataValidade(e.target.value)}
            required
        />
        <input
            type="text"
            placeholder="Valor"
            value={formatCurrency(valor / 100)} // Chama a função de formatação
            onChange={handleValueChange}
            required
        />
        <button type="submit">{editIndex !== null ? 'Atualizar Medicamento' : 'Adicionar Medicamento'}</button>
      </form>

      {/* Botões para exportar e importar */}
      <div className="export-buttons">
        <button onClick={exportToJSON}>Exportar para JSON</button>
        <button onClick={exportToPDF}>Exportar para PDF</button>
        <label htmlFor="import-json" className="import-json-label">
          <button type="button" onClick={() => document.getElementById('import-json').click()}>Importar de JSON</button>
        </label>
        <input
          type="file"
          id="import-json"
          accept=".json"
          onChange={importJSON}
          style={{ display: 'none' }} // Esconde o input de arquivo
        />
      </div>

      {/* Tabela para exibir os medicamentos */}
      <div id="estoque">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Laboratório</th>
              <th>Tipo de Serviço</th>
              <th>Tipo de Medicamento</th>
              <th>Lote</th>
              <th>Quantidade</th>
              <th>Data de Validade</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
              {medicamentos && medicamentos.length > 0 ? (
                medicamentos.map((medicamento, index) => {
                  console.log('Medicamento na tabela:', medicamento); // Log do medicamento
                  return (
                    <tr key={index}>
                      <td>{medicamento.nome}</td>
                      <td>{medicamento.laboratorio || 'N/A'}</td>
                      <td>{medicamento.tipoServico || 'N/A'}</td>
                      <td>{medicamento.tipoMedicamento || 'N/A'}</td>
                      <td>{medicamento.lotes.map(lote => lote.lote).join(', ')}</td>
                      <td>{medicamento.lotes.map(lote => lote.quantidade).join(', ')}</td>
                      <td>{medicamento.lotes.map(lote => lote.dataValidade).join(', ')}</td>
                      <td>{medicamento.lotes.map(lote => formatCurrency(lote.valor)).join(', ')}</td>
                      <td>
                        <button onClick={() => handleEdit(index)}>Editar</button>
                        <button onClick={() => handleDelete(index)}>Excluir</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">Nenhum medicamento encontrado.</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicamentoForm;
