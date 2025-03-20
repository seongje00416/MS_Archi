package com.example.micro_service_provider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final RedisService redisService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Order order) {
        try {
            // 주문 ID 및 주문일자 설정
            String orderId = UUID.randomUUID().toString();
            order.setOrderId(orderId);
            order.setOrderDate(LocalDateTime.now());
            order.setStatus("CREATED");

            // Redis에 주문 저장
            redisService.saveOrder(order);

            // 주문 생성 이벤트 발행
            redisService.publishOrderEvent(order, "ORDER_CREATED");

            // 주문 큐에 추가
            redisService.addToOrderQueue(orderId);

            // 응답 생성
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "주문이 성공적으로 생성되었습니다");
            response.put("orderId", orderId);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("주문 생성 중 오류 발생", e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "주문 처리 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("service", "service-a");
        return ResponseEntity.ok(response);
    }
}