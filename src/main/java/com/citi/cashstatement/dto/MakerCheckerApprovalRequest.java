package com.citi.cashstatement.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MakerCheckerApprovalRequest {

    @JsonProperty("comments")
    private String comments;
}
