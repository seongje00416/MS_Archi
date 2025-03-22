package com.example.micro_service_provider.kafka;

import com.example.micro_service_provider.Order;
import com.example.micro_service_provider.OrderEvent;
import com.example.micro_service_provider.rabbitmq.MessageProducer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class KafkaProducer {
    private static final Logger logger = LoggerFactory.getLogger(MessageProducer.class);

    @Value("${kafka.topic.name}")
    private String topicName;

    private final KafkaTemplate<String, Order> kafkaTemplate;

    public KafkaProducer(KafkaTemplate<String, Order> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendMessage(Order order, String eventType) {
        OrderEvent event = OrderEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .payload(order)
                .timestamp(LocalDateTime.now())
                .build();

        CompletableFuture<SendResult<String, OrderEvent>> future = kafkaTemplate.send(topicName, event.getEventId(), event);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                logger.info("Sent message=[{}] with offset=[{}]", event, result.getRecordMetadata().offset());
            } else {
                logger.error("Unable to send message=[{}] due to : {}", event, ex.getMessage());
            }
        });
    }
}
