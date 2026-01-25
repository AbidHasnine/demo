package com.codecollab.source.service;

import com.codecollab.source.dto.ExecuteCodeResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CompilerService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

    public ExecuteCodeResponse executeCode(String code, String language, String input) {
        try {
            PistonRequest request = createPistonRequest(code, language, input);
            PistonResponse response = restTemplate.postForObject(PISTON_API_URL, request, PistonResponse.class);

            if (response != null) {
                if (response.getMessage() != null) {
                    return new ExecuteCodeResponse("Piston API Error: " + response.getMessage(), true);
                }

                if (response.getRun() != null) {
                    String output = response.getRun().getOutput();

                    // Fallback if output is null
                    if (output == null) {
                        output = "";
                        if (response.getRun().getStdout() != null)
                            output += response.getRun().getStdout();
                        if (response.getRun().getStderr() != null)
                            output += "\n" + response.getRun().getStderr();
                    }

                    if (output.isEmpty()) {
                        output = "Program executed successfully but returned no output.";
                    }

                    boolean isError = response.getRun().getCode() != 0;
                    return new ExecuteCodeResponse(output, isError);
                }
            }

            return new ExecuteCodeResponse("Failed to execute code: No valid response from compiler API", true);

        } catch (Exception e) {
            return new ExecuteCodeResponse("Error executing code: " + e.getMessage(), true);
        }
    }

    private PistonRequest createPistonRequest(String code, String language, String input) {
        String pistonLang;
        String version;
        String fileName = "main";

        // Only support C++ now
        if (!"cpp".equalsIgnoreCase(language)) {
            throw new IllegalArgumentException("Only C++ is supported. Received: " + language);
        }

        pistonLang = "c++";
        version = "10.2.0";
        fileName = "main.cpp";

        PistonFile file = new PistonFile(fileName, code);
        return new PistonRequest(pistonLang, version, Collections.singletonList(file), input);
    }

    // Inner classes for Piston API mapping
    @Data
    private static class PistonRequest {
        private String language;
        private String version;
        private List<PistonFile> files;
        private String stdin;

        public PistonRequest(String language, String version, List<PistonFile> files, String stdin) {
            this.language = language;
            this.version = version;
            this.files = files;
            this.stdin = stdin != null ? stdin : "";
        }
    }

    @Data
    private static class PistonFile {
        private String name;
        private String content;

        public PistonFile(String name, String content) {
            this.name = name;
            this.content = content;
        }
    }

    @Data
    private static class PistonResponse {
        private RunResult run;
        private String message;
    }

    @Data
    private static class RunResult {
        private String stdout;
        private String stderr;
        private int code;
        private String output;
    }
}
