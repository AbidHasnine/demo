package com.codecollab.source.service;

import com.codecollab.source.entity.Message;
import com.codecollab.source.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    
    private final MessageRepository messageRepository;
    
    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderBySentAtAsc();
    }
    
    public Message saveMessage(String sender, String content) {
        Message message = new Message();
        message.setSender(sender);
        message.setContent(content);
        return messageRepository.save(message);
    }
}
