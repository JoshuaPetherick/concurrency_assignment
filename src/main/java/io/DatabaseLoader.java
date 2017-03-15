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
        // Only required to populate database on first run
        /*
        this.eRepository.save(new Employee("Frodo", "Baggins", "Ring bearer"));
        this.eRepository.save(new Employee("Bilbo", "Baggins", "Burglar"));
        this.eRepository.save(new Employee("Gandalf", "the Grey", "Wizard"));
        this.eRepository.save(new Employee("Samwise", "Gamgee", "Gardener"));
        this.eRepository.save(new Employee("Meriadoc", "Brandybuck", "Pony rider"));
        this.eRepository.save(new Employee("Peregrin", "Took", "Pipe smoker"));
        this.sRepository.save(new Shift("Dispose of One Ring", "ASAP", 2));
        this.sRepository.save(new Shift("Help Aragorn become King", "Friday"));
        */
    }
}
