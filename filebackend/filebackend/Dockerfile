# file: ./filebackend/filebackend/Dockerfile
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY target/filebackend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
