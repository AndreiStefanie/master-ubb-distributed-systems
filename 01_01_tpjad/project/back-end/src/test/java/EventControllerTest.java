import com.bet.controller.EventController;
import org.junit.Test;

public class EventControllerTest {
  @Test
  public void getFootballOffer() throws Exception {
    EventController controller = new EventController();
    controller.getSportOffer("football");
  }

  @Test
  public void generateRandomEvents() throws Exception {
    EventController controller = new EventController();
    controller.generateRandomEvents();
  }

}