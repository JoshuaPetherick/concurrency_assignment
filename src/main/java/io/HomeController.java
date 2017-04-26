package io;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

// The below was provided by the reference tutorial under the Creative Commons License

@Controller
public class HomeController
{
    @RequestMapping(value = "/")
    public String index() {
        return "index";
    }

}
