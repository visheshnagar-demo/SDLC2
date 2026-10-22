package com.reinsurance.portal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
@ConfigurationProperties(prefix = "portal.scoring")
public class ScoringRulesConfig {

    private Map<String, Integer> cyberWeights = new HashMap<>(Map.of(
            "mfa", 20,
            "edr", 15,
            "backups", 15,
            "lossHistory", 30,
            "training", 20
    ));

    private Map<String, Integer> doWeights = new HashMap<>(Map.of(
            "financialStrength", 30,
            "claimsHistory", 35,
            "boardGovernance", 20,
            "regulatoryExposure", 15
    ));

    public Map<String, Integer> getCyberWeights() {
        return cyberWeights;
    }

    public void setCyberWeights(Map<String, Integer> cyberWeights) {
        this.cyberWeights = cyberWeights;
    }

    public Map<String, Integer> getDoWeights() {
        return doWeights;
    }

    public void setDoWeights(Map<String, Integer> doWeights) {
        this.doWeights = doWeights;
    }
}
