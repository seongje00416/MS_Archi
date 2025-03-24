package com.example.micro_service_provider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order implements Serializable {
    private String orderId;
    private String customerId;
    private BigDecimal totalAmount;
    private String status;
    private List<OrderItem> items;
    private String orderDate;
    private String receiveDate;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem implements Serializable {
        private String productId;
        private String productName;
        private int quantity;
        private BigDecimal price;
    }
}