package com.bet.filter;

import com.bet.exception.JwtTokenMalformedException;
import com.bet.model.AuthenticatedUser;
import com.bet.model.JwtAuthenticationToken;
import com.bet.model.JwtUserDTO;
import com.bet.util.JwtTokenValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.AbstractUserDetailsAuthenticationProvider;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JwtAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {
  @Autowired
  private JwtTokenValidator jwtTokenValidator;

  @Override
  public boolean supports(Class<?> authentication) {
    return (JwtAuthenticationToken.class.isAssignableFrom(authentication));
  }

  @Override
  protected void additionalAuthenticationChecks(UserDetails userDetails, UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken) throws AuthenticationException {

  }

  @Override
  protected UserDetails retrieveUser(String s, UsernamePasswordAuthenticationToken authentication) throws JwtTokenMalformedException {
    JwtAuthenticationToken jwtAuthenticationToken = (JwtAuthenticationToken) authentication;
    String token = jwtAuthenticationToken.getToken();
    JwtUserDTO parsedUser = jwtTokenValidator.parseToken(token);
    if (parsedUser == null) {
      throw new JwtTokenMalformedException("JWT token is not valid");
    }
    List<GrantedAuthority> authorityList = AuthorityUtils.commaSeparatedStringToAuthorityList(parsedUser.getRole());
    return new AuthenticatedUser(parsedUser.getId(), parsedUser.getUsername(), token, authorityList);
  }
}
