package io;
import static io.WebSocketConfiguration.*;
import org.springframework.hateoas.EntityLinks;
import org.springframework.stereotype.Component;
import org.springframework.data.rest.core.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;

// The below was provided by the reference tutorial under the Creative Commons License

@Component
@RepositoryEventHandler(Employee.class)
public class EventHandler
{
    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @Autowired
    public EventHandler(SimpMessagingTemplate websocket, EntityLinks entityLinks) {
        this.websocket = websocket;
        this.entityLinks = entityLinks;
    }

    /*
        Handle Employees
     */
    @HandleAfterCreate
    public void newEmployee(Employee employee) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newEmployee", getPath(employee));
    }

    @HandleAfterDelete
    public void deleteEmployee(Employee employee) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteEmployee", getPath(employee));
    }

    @HandleAfterSave
    public void updateEmployee(Employee employee) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateEmployee", getPath(employee));
    }

    /*
        Handle Shifts
     */
    @HandleAfterCreate
    public void newShift(Shift shift) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newShift", getPath(shift));
    }

    @HandleAfterDelete
    public void deleteShift(Shift shift) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteShift", getPath(shift));
    }

    @HandleAfterSave
    public void updateShift(Shift shift) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateShift", getPath(shift));
    }

    private String getPath(Employee employee) {
        return this.entityLinks.linkForSingleResource(employee.getClass(),
                employee.getId()).toUri().getPath();
    }

    private String getPath(Shift shift) {
        return this.entityLinks.linkForSingleResource(shift.getClass(),
                shift.getId()).toUri().getPath();
    }
}
