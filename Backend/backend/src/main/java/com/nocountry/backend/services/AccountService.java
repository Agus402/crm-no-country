package com.nocountry.backend.services;

import com.nocountry.backend.dto.AccountDTO;
import com.nocountry.backend.entity.Account;
import com.nocountry.backend.mappers.AccountMapper;
import com.nocountry.backend.repository.AccountRepository;
import com.nocountry.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountMapper accountMapper;

    public List<AccountDTO> findAllAccounts() {
        List<Account> accountList = accountRepository.findAll();
        return accountMapper.toDTOList(accountList);
    }

    public AccountDTO getAccountById(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada con el ID " + id));
        return accountMapper.toDTO(account);
    }

    // Consultar si un Account puede crear otros Accounts
    /*@Transactional
    public AccountDTO createAccount(Account account, Long ownerId) {

        // 1. Validación de unicidad
        if (accountRepository.findByName(account.getName()).isPresent()) {
            throw new RuntimeException("El nombre de la cuenta ya existe.");
        }

        // 2. Asignar el dueño (owner)
        if (ownerId != null) {
            User owner = userRepository.findById(ownerId)
                    .orElseThrow(() -> new RuntimeException("Usuario Dueño (Owner) no encontrado."));
            account.setOwner(owner);
        }

        account.setCreatedAt(LocalDateTime.now());

        Account savedAccount = accountRepository.save(account);
        return accountMapper.toDTO(savedAccount);
    }*/

    @Transactional
    public AccountDTO updateAccount(Long id, Account updatedAccount) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuenta no encontrada con ID: " + id));

        account.setName(updatedAccount.getName());
        account.setIndustry(updatedAccount.getIndustry());
        account.setWebsite(updatedAccount.getWebsite());
        account.setPhone(updatedAccount.getPhone());
        account.setAddress(updatedAccount.getAddress());
        account.setTimeZone(updatedAccount.getTimeZone());
        account.setDateFormat(updatedAccount.getDateFormat());

        Account savedAccount = accountRepository.save(account);
        return accountMapper.toDTO(savedAccount);
    }

    @Transactional
    public void deleteAccount(Long id) {
        if (!accountRepository.existsById(id)) {
            throw new RuntimeException("Cuenta no encontrada con ID: " + id);
        }
        accountRepository.deleteById(id);
    }
}
