package com.bet.util;

import com.bet.model.JwtUserDTO;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Class validates a given token by using the secret configured in the
 * application
 */
@Component
public class JwtTokenValidator {
  @Value("${jwt.secret}")
  private String secret;

  /**
   * Tries to parse specified String as a JWT token. If successful, returns User
   * object with username, id and role prefilled (extracted from token).
   * If unsuccessful (token is invalid or not containing all required user
   * properties), simply returns null.
   *
   * @param token the JWT token to parse
   * @return the User object extracted from specified token or null if a token is
   * invalid.
   */
  public JwtUserDTO parseToken(String token) {
    JwtUserDTO u = null;
    try {
      Claims body = Jwts.parser()
          .setSigningKey(secret)
          .parseClaimsJws(token)
          .getBody();
      u = new JwtUserDTO();
      u.setUsername(body.getSubject());
      u.setId(Long.parseLong((String) body.get("userId")));
      u.setRole((String) body.get("role"));
    } catch (JwtException e) {
      // Simply print the exception and null will be returned for the userDto
      e.printStackTrace();
    }
    return u;
  }
}
