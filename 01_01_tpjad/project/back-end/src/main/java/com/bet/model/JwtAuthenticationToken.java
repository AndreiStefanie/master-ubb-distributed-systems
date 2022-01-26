package com.bet.model;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

/**
 * Other fields aren't used but necessary to comply to
 * the contracts of AbstractUserDetailsAuthenticationProvider
 */
public class JwtAuthenticationToken extends UsernamePasswordAuthenticationToken {
  private final String token;

  public JwtAuthenticationToken(String token) {
    super(null, null);
    this.token = token;
  }

  public String getToken() {
    return token;
  }

  @Override
  public Object getCredentials() {
    return null;
  }

  @Override
  public Object getPrincipal() {
    return null;
  }
}
