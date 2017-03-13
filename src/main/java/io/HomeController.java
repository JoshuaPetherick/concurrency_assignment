package io;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by Joshua on 27/02/2017.
 */
@Controller
public class HomeController
{
    @RequestMapping(value = "/")
    public String index() {
        return "index";
    }

}
