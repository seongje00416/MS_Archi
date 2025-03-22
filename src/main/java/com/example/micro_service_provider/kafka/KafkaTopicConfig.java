package com.example.micro_service_provider.kafka;

import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaTopicConfig {
    @Value("${spring.kafka.producer.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.producer.bootstrap-port}")
    private String bootstrapPort;

    @Value("${kafka.topic.name}")
    private String topicName;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers + bootstrapPort);
        return new KafkaAdmin(configs);
    }

    @Bean
    public NewTopic messagesTopic() {
        // 토픽 이름, 파티션 수, 복제 팩터
        return new NewTopic(topicName, 1, (short) 1);
    }
}
