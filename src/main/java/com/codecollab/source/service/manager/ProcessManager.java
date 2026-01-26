package com.codecollab.source.service.manager;

import org.springframework.stereotype.Component;

import java.io.OutputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ProcessManager {

    //Used concurrent because of multiple users can access seamlessly
    private final Map<String, Process> processes = new ConcurrentHashMap<>();
    private final Map<String, OutputStream> processOutputStreams = new ConcurrentHashMap<>();

    public void addProcess(String sessionId, Process process) {
        processes.put(sessionId, process);
        processOutputStreams.put(sessionId, process.getOutputStream());
    }

    public Process getProcess(String sessionId) {
        return processes.get(sessionId);
    }

    public OutputStream getOutputStream(String sessionId) {
        return processOutputStreams.get(sessionId);
    }

    public void removeProcess(String sessionId) {
        Process process = processes.remove(sessionId);
        if (process != null && process.isAlive()) {
            process.destroy();
        }
        processOutputStreams.remove(sessionId);
    }
}
