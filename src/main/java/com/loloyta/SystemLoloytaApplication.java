package com.loloyta;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableJpaRepositories
public class SystemLoloytaApplication {

	public static void main(String[] args) {
		SpringApplication.run(SystemLoloytaApplication.class, args);
	}
	
	@Bean
	CommandLineRunner probarHash(PasswordEncoder passwordEncoder) {
	    return args -> {
	        System.out.println("HASH PASSWORD => " + passwordEncoder.encode("password"));
	    };
	}


}
