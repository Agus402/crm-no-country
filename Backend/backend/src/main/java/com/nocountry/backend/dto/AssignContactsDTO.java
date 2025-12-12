package com.nocountry.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class AssignContactsDTO {
    private List<Long> contactIds;
}
