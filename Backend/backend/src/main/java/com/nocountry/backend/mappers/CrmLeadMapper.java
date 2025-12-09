package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.CreateCrmLeadDTO;
import com.nocountry.backend.dto.CrmLeadDTO;
import com.nocountry.backend.dto.UpdateCrmLeadDTO;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CrmLeadMapper {

    private final AccountMapper accountMapper;

    public CrmLead toEntity(CreateCrmLeadDTO dto) {
        if (dto == null) {
            return null;
        }

        CrmLead crmLead = CrmLead.builder()
                .name(dto.name())
                .email(dto.email())
                .phone(dto.phone())
                .stage(dto.stage())
                .channel(dto.channel())
                .status("NEW")
                .deleted(false)
                .build();

        // Note: account, tags, createdAt, updatedAt should be set separately in the service
        return crmLead;
    }

    public CrmLeadDTO toDTO(CrmLead crmLead) {
        if (crmLead == null) {
            return null;
        }

        // Mapear tags a IDs
        Set<Long> tagIds = null;
        if (crmLead.getTag() != null) {
            tagIds = crmLead.getTag().stream()
                    .map(Tag::getId)
                    .collect(Collectors.toSet());
        }

        // Mapear account usando AccountMapper para evitar bucles
        var accountDTO = accountMapper.toDTO(crmLead.getAccount());

        return new CrmLeadDTO(
                crmLead.getId(),
                crmLead.getName(),
                crmLead.getEmail(),
                crmLead.getPhone(),
                crmLead.getStage(),
                crmLead.getChannel(),
                crmLead.getStatus(),
                crmLead.getCreatedAt(),
                crmLead.getUpdatedAt(),
                tagIds,
                accountDTO
        );
    }

    public void updateCrmLeadFromDto(UpdateCrmLeadDTO dto, CrmLead entity) {
        if (dto == null || entity == null) {
            return;
        }

        if (dto.name() != null) {
            entity.setName(dto.name());
        }
        if (dto.email() != null) {
            entity.setEmail(dto.email());
        }
        if (dto.phone() != null) {
            entity.setPhone(dto.phone());
        }
        if (dto.stage() != null) {
            entity.setStage(dto.stage());
        }
        if (dto.channel() != null) {
            entity.setChannel(dto.channel());
        }
    }

}
