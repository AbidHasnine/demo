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

//Sazzad's part
@Slf4j
@Service
@RequiredArgsConstructor
public class CompilerService {

    private final ProcessManager processManager;

    public void executeInteractive(String code, String language, String sessionId, Consumer<ExecuteCodeResponse> outputCallback) {
        new Thread(() -> {

            //Only Cpp file is supported
            if (!"cpp".equalsIgnoreCase(language)) {
                outputCallback.accept(new ExecuteCodeResponse("Only C++ is supported.", true));
                return;
            }

            Path tempDir = null;

            try {

                //this part is responsible for creating temp file path
                tempDir = Files.createTempDirectory("codecollab-compiler");
                Path sourceFile = tempDir.resolve("main.cpp");
                Files.writeString(sourceFile, code);

                //This is the compilation Part
                //With the help of ProcessBuilder
                //This becomes easy and deploy ready
                //but g++ has to be installed on that native machine
                ProcessBuilder compileBuilder = new ProcessBuilder("g++", sourceFile.toString(), "-o", tempDir.resolve("main").toString());
                Process compileProcess = compileBuilder.start();
                int compileExitCode = compileProcess.waitFor();

                if (compileExitCode != 0) {
                    String error = readStream(compileProcess.getErrorStream());
                    outputCallback.accept(new ExecuteCodeResponse(error, true));
                    return;
                }

                //this is the .exe part
                ProcessBuilder executeBuilder = new ProcessBuilder(tempDir.resolve("main").toString());
                Process executeProcess = executeBuilder.start();
                processManager.addProcess(sessionId, executeProcess);

                //these lines return the output to the frontend
                readStream(executeProcess.getInputStream(), (output) -> outputCallback.accept(new ExecuteCodeResponse(output, false)));
                readStream(executeProcess.getErrorStream(), (output) -> outputCallback.accept(new ExecuteCodeResponse(output, true)));

                //ending part this returns 0
                int executeExitCode = executeProcess.waitFor();
                outputCallback.accept(new ExecuteCodeResponse("\nProcess finished with exit code " + executeExitCode, false));

            } catch (IOException | InterruptedException e) {
                log.error("Error during code execution", e);
                outputCallback.accept(new ExecuteCodeResponse("Error executing code: " + e.getMessage(), true));
            } finally {
                //This is the cache cleaner
                processManager.removeProcess(sessionId);

                if (tempDir != null) {
                    try {
                        Files.walk(tempDir).map(Path::toFile).forEach(File::delete);
                    } catch (IOException e) {
                        log.error("Failed to delete temp directory: {}", tempDir, e);
                    }
                }
            }
        }).start();
    }

    //This part is responsible for cin from user
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
        //Again threading is introduced because in the case of multiple input
        // a secondary threading is started
        new Thread(() -> {
            try {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = stream.read(buffer)) != -1) {
                    //-1 means end of line
                    outputConsumer.accept(new String(buffer, 0, bytesRead));
                }
            } catch (IOException e) {
                log.info("Stream closed.", e);
            }
        }).start();
    }


    //This method is used for blocking the main thread and giving errors
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
