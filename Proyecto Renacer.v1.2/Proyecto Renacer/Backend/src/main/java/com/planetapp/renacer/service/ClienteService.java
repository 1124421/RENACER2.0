package com.planetapp.renacer.service;

import com.planetapp.renacer.model.Cliente;
import com.planetapp.renacer.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    // CREATE / SAVE
    public Cliente saveCliente(Cliente cliente) {
        // 1. Validar unicidad del documento (clave UNIQUE)
        if (clienteRepository.findByDocumento(cliente.getDocumento()).isPresent()) {
            throw new IllegalStateException("El Cliente con documento " + cliente.getDocumento() + " ya existe.");
        }
        return clienteRepository.save(cliente);
    }

    // READ ALL
    public List<Cliente> getAllClientes() {
        return clienteRepository.findAll();
    }

    // READ BY ID
    public Optional<Cliente> getClienteById(Integer id) {
        return clienteRepository.findById(id);
    }

    // UPDATE
    public Cliente updateCliente(Integer id, Cliente clienteDetails) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Cliente no encontrado con ID: " + id));

        // Validar unicidad del nuevo documento, excluyendo el objeto actual
        Optional<Cliente> existing = clienteRepository.findByDocumento(clienteDetails.getDocumento());
        if (existing.isPresent() && !existing.get().getIdCliente().equals(id)) {
            throw new IllegalStateException("El Cliente con documento " + clienteDetails.getDocumento() + " ya existe.");
        }

        // Actualizar campos
        cliente.setNombreEmpresa(clienteDetails.getNombreEmpresa());
        cliente.setDocumento(clienteDetails.getDocumento());
        cliente.setTelefono(clienteDetails.getTelefono());
        cliente.setCorreo(clienteDetails.getCorreo());

        return clienteRepository.save(cliente);
    }

    // DELETE
    public void deleteCliente(Integer id) {
        boolean exists = clienteRepository.existsById(id);
        if (!exists) {
            throw new IllegalStateException("Cliente no encontrado con ID: " + id);
        }
        clienteRepository.deleteById(id);
    }
}