# ============================================================
# Dockerfile — Java Spring Boot 3.3.5 Backend (Temurin 21)
# ============================================================

# --- Build Stage ---
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Runtime Stage ---
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create unprivileged application user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Ensure local data directory exists and has correct permissions
RUN mkdir -p /app/data/uploads /app/data/test-uploads /app/data/db && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

# Configure memory limits for Render 512 MB free tier
ENV JAVA_OPTS="-Xms192m -Xmx320m -XX:+UseSerialGC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

