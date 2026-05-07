FROM eclipse-temurin:21-jre-alpine

COPY target/family-hub-1.0.0-SNAPSHOT.jar app.jar

ENV DB_HOST=1Panel-mysql-EhHR \
    DB_PORT=3306 \
    DB_USERNAME=root \
    DB_PASSWORD=admin \
    REDIS_HOST=1Panel-redis-YSO8 \
    REDIS_PASSWORD=admin

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
