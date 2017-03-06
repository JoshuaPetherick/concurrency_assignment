package io;

import org.springframework.stereotype.Component;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class DatabaseLoader implements CommandLineRunner
{
    private final EmployeeRepository repository;

    @Autowired
    public DatabaseLoader(EmployeeRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... strings) throws Exception
    {
        this.repository.save(new Employee("Frodo", "Baggins", "Ring bearer"));
        this.repository.save(new Employee("Bilbo", "Baggins", "Burglar"));
        this.repository.save(new Employee("Gandalf", "the Grey", "Wizard"));
        this.repository.save(new Employee("Samwise", "Gamgee", "Gardener"));
        this.repository.save(new Employee("Meriadoc", "Brandybuck", "Pony rider"));
        this.repository.save(new Employee("Peregrin", "Took", "Pipe smoker"));
    }
}
