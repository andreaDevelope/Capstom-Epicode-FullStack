package it.epicode.capstom_epicode.web.controller;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserService;
import it.epicode.capstom_epicode.db.service.PayPalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/")
public class PayPalController {

    @Autowired
    PayPalService payPalService;

    @Autowired
    AppUserService appUserService;

    @PostMapping("/create-plan")
    public ResponseEntity<?> createSubscriptionPlan() {
        try {
            String token = payPalService.getAccessToken();
            String productId = payPalService.createProduct(token);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            headers.setContentType(MediaType.APPLICATION_JSON);

            String body = "{\n" +
                    "  \"product_id\": \"" + productId + "\", \n" +
                    "  \"name\": \"Abbonamento Annuale\",\n" +
                    "  \"description\": \"Accesso annuale al servizio\",\n" +
                    "  \"billing_cycles\": [\n" +
                    "    {\n" +
                    "      \"frequency\": {\n" +
                    "        \"interval_unit\": \"YEAR\",\n" +
                    "        \"interval_count\": 1\n" +
                    "      },\n" +
                    "      \"tenure_type\": \"REGULAR\",\n" +
                    "      \"sequence\": 1,\n" +
                    "      \"total_cycles\": 0,\n" +
                    "      \"pricing_scheme\": {\n" +
                    "        \"fixed_price\": {\n" +
                    "          \"value\": \"20.00\",\n" +
                    "          \"currency_code\": \"EUR\"\n" +
                    "        }\n" +
                    "      }\n" +
                    "    }\n" +
                    "  ],\n" +
                    "  \"payment_preferences\": {\n" +
                    "    \"auto_bill_outstanding\": true,\n" +
                    "    \"setup_fee\": {\n" +
                    "      \"value\": \"0\",\n" +
                    "      \"currency_code\": \"EUR\"\n" +
                    "    },\n" +
                    "    \"setup_fee_failure_action\": \"CONTINUE\",\n" +
                    "    \"payment_failure_threshold\": 3\n" +
                    "  }\n" +
                    "}";

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api-m.sandbox.paypal.com/v1/billing/plans",
                    request,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.CREATED) {
                String planId = response.getBody().get("id").toString();
                return ResponseEntity.ok(Map.of("plan_id", planId));
            } else {
                throw new RuntimeException("Errore nella creazione del piano: " + response.getBody());
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping("/attiva-abbonamento")
    public ResponseEntity<?> attivaAbbonamento(@RequestBody Map<String, String> requestBody) {
        String username = requestBody.get("username");
        System.out.println(" Ricevuto payload: " + requestBody);
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username non valido"));
        }

        AppUser user = appUserService.findByUsername(username);

        LocalDate scadenza = LocalDate.now().plusYears(1);
        payPalService.attivaAbbonamento(user.getId(), scadenza);

        return ResponseEntity.ok(Map.of("message", "Abbonamento attivato con successo"));
    }

}
