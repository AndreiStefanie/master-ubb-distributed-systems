package com.bet.filter;

import com.bet.exception.JwtTokenMissingException;
import com.bet.model.JwtAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.stereotype.Component;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component("tokenAuthenticationFilter2")
public class TokenAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
  private static final String TOKEN_FILTER_URL = "/**";

  @Autowired
  public TokenAuthenticationFilter(@Value(TOKEN_FILTER_URL) String defaultFilterProcessesUrl) {
    super(defaultFilterProcessesUrl);
    // Authentication will only be initiated for the request url matching this
    // pattern
    super.setRequiresAuthenticationRequestMatcher(new AntPathRequestMatcher(TOKEN_FILTER_URL));
    super.setAuthenticationManager(authentication -> {
      // Authentication manager does not perform the authentication since it had been
      // already done by the
      // attemptAuthentication method in the filter
      return authentication;
    });
    setAuthenticationSuccessHandler(new RestAuthenticationSuccessHandler());
    setContinueChainBeforeSuccessfulAuthentication(true);
  }

  @Override
  public Authentication attemptAuthentication(HttpServletRequest httpServletRequest,
                                              HttpServletResponse httpServletResponse) throws AuthenticationException, IOException, ServletException {
    String header = httpServletRequest.getHeader("Authorization");

    if (header == null || !header.startsWith("Bearer ")) {
      throw new JwtTokenMissingException("No JWT token found in request headers");
    }

    String authToken = header.substring(7);

    JwtAuthenticationToken authRequest = new JwtAuthenticationToken(authToken);

    return getAuthenticationManager().authenticate(authRequest);
  }
}
