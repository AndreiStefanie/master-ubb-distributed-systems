import com.bet.controller.AuthenticationController;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

public class AuthenticationControllerTest {
  @Test
  public void register() throws Exception {
    AuthenticationController controller = new AuthenticationController();
    Map<String, String> map = new HashMap<>();
    map.put("username", "test");
    map.put("password", "test");
    map.put("email", "test@test.com");
    controller.register(map);
  }
}