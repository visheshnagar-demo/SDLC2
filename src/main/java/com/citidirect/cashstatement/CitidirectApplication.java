package com.citidirect.cashstatement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CitidirectApplication {

    public static void main(String[] args) {
        SpringApplication.run(CitidirectApplication.class, args);
    }
}
