package io;

import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class DatabaseLoader implements CommandLineRunner
{
    private final EmployeeRepository eRepository;
    private final ShiftRepository sRepository;

    @Autowired
    public DatabaseLoader(EmployeeRepository eRepository, ShiftRepository sRepository) {
        this.eRepository = eRepository;
        this.sRepository = sRepository;
    }

    @Override
    public void run(String... strings) throws Exception
    {

    }
}
