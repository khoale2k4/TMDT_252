# Stage 1: Build stage (Sử dụng Maven kết hợp Amazon Corretto 17 chạy mượt trên Mac M-series)
FROM maven:3.9-amazoncorretto-17 AS build
WORKDIR /app

# Copy pom.xml và tải trước thư viện để tận dụng cache
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy code nguồn và build file JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage (Sử dụng bản JRE siêu gọn của Amazon Corretto công thức cho ARM64/AMD64)
FROM amazoncorretto:17-alpine-jdk
WORKDIR /app

# Copy file jar đã build thành công từ stage 1 sang
COPY --from=build /app/target/*.jar app.jar

# Cổng chạy của Spring Boot
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]