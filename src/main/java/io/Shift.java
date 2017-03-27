package io;

import lombok.*;
import javax.persistence.Id;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Version;
import javax.validation.constraints.Null;

import com.sun.istack.internal.Nullable;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Data
@Entity
public class Shift
{
    private @Id @GeneratedValue Long id;
    private String description;
    private String day;
    private @Nullable int employeeId;

    private @Version @JsonIgnore Long version;

    private Shift() {}

    public Shift(String description, String day, int employeeId)
    {
        this.description = description;
        this.day = day;
        this.employeeId = employeeId;
    }
}
