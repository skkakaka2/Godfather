FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache tzdata

ENV TZ=Asia/Shanghai

COPY target/*.jar app.jar

ENV DB_HOST=godfather-mysql \
    DB_PORT=3306 \
    DB_USERNAME=root \
    DB_PASSWORD=admin \
    REDIS_HOST=godfather-redis \
    REDIS_PASSWORD=admin

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
