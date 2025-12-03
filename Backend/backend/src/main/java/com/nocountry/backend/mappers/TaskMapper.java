package com.nocountry.backend.mappers;

import com.nocountry.backend.dto.CrmLeadDTO;
import com.nocountry.backend.dto.TaskDTO;
import com.nocountry.backend.dto.UserDTO;
import com.nocountry.backend.entity.CrmLead;
import com.nocountry.backend.entity.Task;
import com.nocountry.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskMapper {

    @Mapping(target = "isAutomated", source = "isAutomated")
    @Mapping(target = "taskType", source = "taskType")
    @Mapping(target = "crmLead", source = "crmLead", qualifiedByName = "mapContactSummary")
    @Mapping(target = "assignedTo", source = "assignedTo", qualifiedByName = "mapUserSummary")
    TaskDTO toDTO(Task task);

    List<TaskDTO> toDTOList(List<Task> tasks);

    @Named("mapUserSummary")
    @Mapping(target = "account", ignore = true)
    UserDTO toUserDTO(User user);

    @Named("mapContactSummary")
    CrmLeadDTO toCrmLeadDTO(CrmLead crmLead);
}
