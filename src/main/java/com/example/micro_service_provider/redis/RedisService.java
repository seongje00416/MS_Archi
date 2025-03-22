package com.example.micro_service_provider.redis;

import com.example.micro_service_provider.Order;
import com.example.micro_service_provider.OrderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String ORDER_KEY_PREFIX = "order:";
    private static final String ORDER_CHANNEL = "order_channel";
    private static final String ORDER_QUEUE = "order_queue";

    public void saveOrder(Order order) {
        String orderId = order.getOrderId();
        String key = ORDER_KEY_PREFIX + orderId;

        log.info("Saving order to Redis: {}", key);
        redisTemplate.opsForValue().set(key, order);
    }

    public void publishOrderEvent(Order order, String eventType) {
        OrderEvent event = OrderEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .payload(order)
                .timestamp(LocalDateTime.now())
                .build();

        log.info("Publishing order event: {}", event);
        redisTemplate.convertAndSend(ORDER_CHANNEL, event);
    }

    public void addToOrderQueue(String orderId) {
        log.info("Adding order to queue: {}", orderId);
        redisTemplate.opsForList().leftPush(ORDER_QUEUE, orderId);
    }
}
