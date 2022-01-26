package com.bet.util;

import com.bet.model.JwtUserDTO;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * Convenience class to generate a token for testing your requests.
 */
public class JwtTokenGenerator {
  /**
   * Generates a JWT token containing username as subject, and userId and role as
   * additional claims. These properties are taken from the specified
   * User object. Tokens validity is infinite.
   *
   * @param u the user for which the token will be generated
   * @return the JWT token
   */
  public static String generateToken(JwtUserDTO u, String secret) {
    Claims claims = Jwts.claims().setSubject(u.getUsername());
    claims.put("userId", u.getId() + "");
    claims.put("role", u.getRole());
    return Jwts.builder().setClaims(claims).signWith(SignatureAlgorithm.HS512, secret).compact();
  }
}
