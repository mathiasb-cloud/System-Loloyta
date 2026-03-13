package com.loloyta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class SystemLoloytaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SystemLoloytaApplication.class, args);
	}


}
