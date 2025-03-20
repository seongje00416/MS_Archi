package com.example.micro_service_provider;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 키에 대해서는 StringRedisSerializer 사용
        template.setKeySerializer(new StringRedisSerializer());

        // 값에 대해서는 Jackson2JsonRedisSerializer 사용
        template.setValueSerializer(new Jackson2JsonRedisSerializer<>(Object.class));

        // 해시 키/값에 대한 직렬화 설정
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(new Jackson2JsonRedisSerializer<>(Object.class));

        template.afterPropertiesSet();
        return template;
    }
}
