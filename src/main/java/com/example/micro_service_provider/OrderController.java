package com.example.micro_service_provider;

import com.example.micro_service_provider.kafka.KafkaProducer;
import com.example.micro_service_provider.rabbitmq.MessageProducer;
import com.example.micro_service_provider.redis.RedisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name="Redis Provider API", description = "Redis 제공자 API 주문 생성")
public class OrderController {
    // To use Redis
    private final RedisService redisService;
    // To use RabbitMQ
    private final MessageProducer messageProducer;
    // To use Kafka
    private final KafkaProducer kafkaProducer;

    private String getNowTime() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");
        return now.format(formatter);
    }

    @Operation( summary = "Redis 테스트 API", description = "주문 생성 -> Redis로 전송" )
    @ApiResponses( value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "생성 성공"
            )
    })
    @PostMapping("/order/redis")
    public ResponseEntity<Map<String, Object>> createOrderRedis(@RequestBody Order order) {
        try {
            String orderId = UUID.randomUUID().toString();
            order.setOrderId(orderId);
            order.setOrderDate(getNowTime());
            order.setStatus("CREATED");

            // To use Redis
            // Redis에 주문 저장
            redisService.saveOrder(order);
            // 주문 생성 이벤트 발행
            redisService.publishOrderEvent(order, "REDIS_ORDER_CREATED");
            // 주문 큐에 추가
            redisService.addToOrderQueue(orderId);

            // 응답 생성
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "[Redis] 주문이 성공적으로 생성되었습니다");
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

    @Operation( summary = "RabbitMQ 테스트 API", description = "주문 생성 -> RabbitMQ로 전송" )
    @ApiResponses( value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "생성 성공"
            )
    })
    @PostMapping("/order/rabbitmq")
    public ResponseEntity<Map<String, Object>> createOrderRabbitMQ(@RequestBody Order order) {
        try {
            String orderId = UUID.randomUUID().toString();
            order.setOrderId(orderId);
            order.setOrderDate(getNowTime());
            order.setStatus("CREATED");

            // To use RabbitMQ
            messageProducer.sendOrder( order, "RABBITMQ_ORDER_CREATED");


            // 응답 생성
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "[RabbitMQ] 주문이 성공적으로 생성되었습니다");
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

    @Operation( summary = "Kafka 테스트 API", description = "주문 생성 -> Kafka로 전송" )
    @ApiResponses( value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "생성 성공"
            )
    })
    @PostMapping("/order/kafka")
    public ResponseEntity<Map<String, Object>> createOrderKafka(@RequestBody Order order) {
        try {
            String orderId = UUID.randomUUID().toString();
            order.setOrderId(orderId);
            order.setOrderDate(getNowTime());
            order.setStatus("CREATED");

            // To use Kafka
            kafkaProducer.sendMessage( order, "KAFKA_ORDER_CREATED" );

            // 응답 생성
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "[Kafka] 주문이 성공적으로 생성되었습니다");
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