package it.epicode.capstom_epicode.db.service;

import it.epicode.capstom_epicode.auth.AppUser;
import it.epicode.capstom_epicode.auth.AppUserRepository;
import it.epicode.capstom_epicode.exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.Base64;
import java.util.Map;

@Service
public class PayPalService {

    @Autowired
    AppUserRepository appUserRepository;

    @Value("${paypal.id}")
    private String clientId;

    @Value("${paypal.secret}")
    private String clientSecret;

    public void attivaAbbonamento(Long userId, LocalDate scadenza) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato"));

        user.setAbbonamentoAttivo(true);
        user.setDataScadenzaAbbonamento(scadenza);

        appUserRepository.save(user);
    }


    public String createProduct(String accessToken) {
        String url = "https://api-m.sandbox.paypal.com/v1/catalogs/products";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String body = "{\n" +
                "  \"name\": \"Abbonamento Annuale\",\n" +
                "  \"description\": \"Accesso annuale al servizio\",\n" +
                "  \"type\": \"SERVICE\",\n" +
                "  \"category\": \"SOFTWARE\"\n" +
                "}";

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response;

        try {
            response = restTemplate.postForEntity(url, request, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Errore durante la creazione del prodotto: " + e.getMessage());
        }

        if (response.getStatusCode() == HttpStatus.CREATED) {
            return response.getBody().get("id").toString();
        } else {
            throw new RuntimeException("Errore nella creazione del prodotto: " + response.getBody());
        }
    }

    public String getAccessToken() {

        try {


            String credentials = Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(clientId, clientSecret);
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<String> request = new HttpEntity<>("grant_type=client_credentials", headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api-m.sandbox.paypal.com/v1/oauth2/token",
                    request,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody().get("access_token").toString();
            } else {
                throw new RuntimeException("Failed to get access token");
            }
        } catch (Exception e) {
            throw new RuntimeException("Errore durante il recupero del token di accesso: " + e.getMessage());
        }
    }

}
