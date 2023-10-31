package edu.eci.arsw.collabpaint;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;

@Controller
public class STOMPMessagesHandler {

    ConcurrentHashMap<String, List<Point>> ListPoints = new ConcurrentHashMap<>();

    @Autowired
    SimpMessagingTemplate msgt;

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        if (ListPoints.containsKey(numdibujo)) {
            ListPoints.get(numdibujo).add(pt);
        } else {
            List<Point> t = new ArrayList<Point>();
            t.add(pt);
            ListPoints.put(numdibujo, t);
        }

        if (ListPoints.get(numdibujo).size() > 3) {
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, ListPoints.get(numdibujo));
        }
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);

    }
}
