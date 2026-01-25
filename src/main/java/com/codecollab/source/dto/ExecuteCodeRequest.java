package com.codecollab.source.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecuteCodeRequest {
    private String code;
    private String language;
    private String input; // stdin input for the program
}
