package com.reinsurance.portal.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI reinsurancePortalOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Facultative Reinsurance Submission & Underwriting API")
                .description("REST API for specialty lines reinsurance submission intake, validation, rules-based risk scoring, underwriter review queue, quote builder, authority referral workflow, audit logging, and executive analytics.")
                .version("1.0.0")
                .contact(new Contact().name("Reinsurance Portal Team").email("underwriting@reinsurance-demo.com"))
                .license(new License().name("Proprietary").url("https://reinsurance-demo.com/license")));
    }
}
