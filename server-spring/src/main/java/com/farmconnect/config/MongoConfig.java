package com.farmconnect.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.mongo.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

import java.util.concurrent.TimeUnit;

@Configuration
@ConditionalOnProperty(name = "farmconnect.mongodb.enabled", havingValue = "true")
@EnableMongoRepositories(basePackages = "com.farmconnect.modules.content.mongo.repository")
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoSettingsCustomizer() {
        return builder -> builder
                .applyToClusterSettings(cs -> cs.serverSelectionTimeout(2000, TimeUnit.MILLISECONDS))
                .applyToSocketSettings(ss -> ss.connectTimeout(2000, TimeUnit.MILLISECONDS));
    }
}
