# ==============================================================================
# Multi-stage Dockerfile for FarmConnect Spring Boot 3 Backend (Java 21)
# ==============================================================================

FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw 2>/dev/null || true
# Pre-fetch dependencies
COPY src src
RUN ./mvnw clean package -DskipTests 2>/dev/null || mvn clean package -DskipTests 2>/dev/null || true

FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Run as non-root user
RUN groupadd -r farmgroup && useradd -r -g farmgroup farmuser
USER farmuser:farmgroup

COPY --from=builder /workspace/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5000/actuator/health || exit 1

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
