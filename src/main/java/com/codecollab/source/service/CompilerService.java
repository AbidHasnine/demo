package com.codecollab.source.service;

import com.codecollab.source.dto.ExecuteCodeResponse;
import com.codecollab.source.service.manager.ProcessManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.function.Consumer;

//Abid's part + Sazzad's part
@Slf4j
@Service
@RequiredArgsConstructor
public class CompilerService {

    private final ProcessManager processManager;

    public void executeInteractive(String code, String language, String sessionId, Consumer<ExecuteCodeResponse> outputCallback) {
        new Thread(() -> {
            if (!"cpp".equalsIgnoreCase(language)) {
                outputCallback.accept(new ExecuteCodeResponse("Only C++ is supported.", true));
                return;
            }

            Path tempDir = null;
            try {
                tempDir = Files.createTempDirectory("codecollab-compiler");
                Path sourceFile = tempDir.resolve("main.cpp");
                Files.writeString(sourceFile, code);

                ProcessBuilder compileBuilder = new ProcessBuilder("g++", sourceFile.toString(), "-o", tempDir.resolve("main").toString());
                Process compileProcess = compileBuilder.start();
                int compileExitCode = compileProcess.waitFor();

                if (compileExitCode != 0) {
                    String error = readStream(compileProcess.getErrorStream());
                    outputCallback.accept(new ExecuteCodeResponse(error, true));
                    return;
                }

                ProcessBuilder executeBuilder = new ProcessBuilder(tempDir.resolve("main").toString());
                Process executeProcess = executeBuilder.start();
                processManager.addProcess(sessionId, executeProcess);

                readStream(executeProcess.getInputStream(), (output) -> outputCallback.accept(new ExecuteCodeResponse(output, false)));
                readStream(executeProcess.getErrorStream(), (output) -> outputCallback.accept(new ExecuteCodeResponse(output, true)));

                int executeExitCode = executeProcess.waitFor();
                outputCallback.accept(new ExecuteCodeResponse("\nProcess finished with exit code " + executeExitCode, false));

            } catch (IOException | InterruptedException e) {
                log.error("Error during code execution", e);
                outputCallback.accept(new ExecuteCodeResponse("Error executing code: " + e.getMessage(), true));
            } finally {
                processManager.removeProcess(sessionId);
                if (tempDir != null) {
                    try {
                        Files.walk(tempDir)
                             .map(Path::toFile)
                             .forEach(File::delete);
                    } catch (IOException e) {
                        log.error("Failed to delete temp directory: {}", tempDir, e);
                    }
                }
            }
        }).start();
    }

    public void sendInput(String sessionId, String input) {
        OutputStream outputStream = processManager.getOutputStream(sessionId);
        if (outputStream != null) {
            try {
                outputStream.write((input + "\n").getBytes());
                outputStream.flush();
            } catch (IOException e) {
                log.error("Error sending input to process", e);
            }
        }
    }

    private void readStream(InputStream stream, Consumer<String> outputConsumer) {
        new Thread(() -> {
            try {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = stream.read(buffer)) != -1) {
                    outputConsumer.accept(new String(buffer, 0, bytesRead));
                }
            } catch (IOException e) {
                log.info("Stream closed.", e);
            }
        }).start();
    }
    
    private String readStream(InputStream stream) throws IOException {
        StringBuilder result = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {
            String line;
            while ((line = reader.readLine()) != null) {
                result.append(line).append("\n");
            }
        }
        return result.toString();
    }
}
