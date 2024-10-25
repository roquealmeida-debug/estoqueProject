import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MedicamentoForm from './MedicamentoForm'; // Ajuste o caminho conforme necessário

test('submits the form with correct values', () => {
    render(<MedicamentoForm />);

    // Preencha os campos do formulário
    fireEvent.change(screen.getByPlaceholderText(/nome/i), { target: { value: 'Medicamento A' } });
    fireEvent.change(screen.getByPlaceholderText(/laboratório/i), { target: { value: 'Laboratório A' } });
    
    // Use getByRole para os selects
    fireEvent.change(screen.getByRole('combobox', { name: /tipo de serviço/i }), { target: { value: 'ANEMIA FALCIFORME' } });
    fireEvent.change(screen.getByRole('combobox', { name: /tipo de medicamento/i }), { target: { value: 'ADESIVO' } });
    
    fireEvent.change(screen.getByPlaceholderText(/lote/i), { target: { value: 'Lote 1' } });
    fireEvent.change(screen.getByPlaceholderText(/quantidade/i), { target: { value: '10' } });
    fireEvent.change(screen.getByPlaceholderText(/data de validade/i), { target: { value: '2023-12-31' } });
    fireEvent.change(screen.getByPlaceholderText(/valor/i), { target: { value: '100' } });

    // Envie o formulário
    fireEvent.click(screen.getByText(/adicionar medicamento/i));

    // Verifique se os dados foram salvos no localStorage
    const medicamentos = JSON.parse(localStorage.getItem('medicamentos'));
    expect(medicamentos).toHaveLength(1);
    expect(medicamentos[0].nome).toBe('MEDICAMENTO A');
    expect(medicamentos[0].laboratorio).toBe('LABORATÓRIO A');
});
