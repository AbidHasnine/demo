package com.codecollab.source.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSolutionRequest {
    private String problemId;
    private String username;
    private String userId;
    private String title;
    private String content;
}
