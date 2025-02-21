package it.epicode.capstom_epicode.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("*")
                        .allowedMethods("*")
                        .allowedHeaders("*")
                        .allowCredentials(false);
            }
        };
    }

    @Service
    public static class CustomUserDetailsService implements UserDetailsService {

        @Autowired
        private AppUserRepository appUserRepository;

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
            Optional<AppUser> optionalUser = appUserRepository.findByUsername(username);

            if (optionalUser.isEmpty()) {
                throw new UsernameNotFoundException("Utente non trovato con username: " + username +
                        ". Se hai cambiato username, effettua nuovamente il login.");
            }

            AppUser appUser = optionalUser.get();

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(appUser.getRuolo().name());

            return new User(
                    appUser.getUsername(),
                    appUser.getPassword(),
                    List.of(authority)
            );
        }

    }
}
