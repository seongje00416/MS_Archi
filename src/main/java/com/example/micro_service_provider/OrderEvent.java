package com.example.micro_service_provider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent implements Serializable {
    private String eventId;
    private String eventType;
    private Order payload;
    private LocalDateTime timestamp;
}