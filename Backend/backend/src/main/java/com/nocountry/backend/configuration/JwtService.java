package com.nocountry.backend.configuration;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.io.Decoders;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret-key}")
    private String SECRET_KEY;

    // MÉTODOS DE EXTRACCION DE CLAIMS

    // 1. Extrae el nombre de usuario (subject) del token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // 2. Método genérico para extraer un claim específico (ej: expiración, roles)
    public<T> T extractClaim(String token, Function<Claims, T> claimsTFunction) {
        final Claims claims = extractAllClaims(token);
        return claimsTFunction.apply(claims);
    }

    // 3. Obtiene todos los claims del token (requiere la clave secreta)
    public Claims extractAllClaims(String token) {

        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    //MÉTODOS DE GENERACIÓN DEL TOKEN

    // 4. Genera el token con claims extra (vacíos en este caso)
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    // 5. Genera el token final con la clave, expiración y claims
    public String generateToken(
            Map<String, Object> extractClaims,
            UserDetails userDetails
    ) {
        return Jwts
                .builder()
                .setClaims(extractClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000*60*3600))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();

    }

    //MÉTODOS DE VALIDACIÓN

    // 6. Verifica si el token es válido
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Verifica si el username del token coincide Y si el token no ha expirado
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // 7. Verifica si el token expiró
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // 8. Extrae la fecha de expiración
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    //MÉTODO DE CLAVE SECRETA
    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
