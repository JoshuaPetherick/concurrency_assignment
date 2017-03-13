'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');
const when = require('when');
const follow = require('./follow');
const stompClient = require('./websocket-listener');

const root = '/api';

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            employees: [], eAttributes: [], ePage: 1, ePageSize: 3, eLinks: {},
            shifts: [], sAttributes: [], sPage: 1, sPageSize: 2, sLinks: {}
        };
        this.updatePageSize = this.updatePageSize.bind(this);
        this.updateShiftPageSize = this.updateShiftPageSize.bind(this);

        this.onCreate = this.onCreate.bind(this);
        this.onCreateShift = this.onCreateShift.bind(this);

        this.onUpdate = this.onUpdate.bind(this);
        this.onUpdateShift = this.onUpdateShift.bind(this);

        this.onDelete = this.onDelete.bind(this);
        this.onDeleteShift = this.onDeleteShift.bind(this);

        this.onNavigate = this.onNavigate.bind(this);
        this.onNavigateShift = this.onNavigateShift.bind(this);

        this.refreshCurrentPage = this.refreshCurrentPage.bind(this);
        this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);
    }

    loadFromServer(ePageSize) {
        follow(client, root, [
            {rel: 'employees', params: {size: ePageSize}}]
        ).then(employeeCollection => {
            return client({
                method: 'GET',
                path: employeeCollection.entity._links.profile.href,
                headers: {'Accept': 'application/schema+json'}
            }).then(schema => {
                this.schema = schema.entity;
                this.links = employeeCollection.entity._links;
                return employeeCollection;
            });
        }).then(employeeCollection => {
            this.page = employeeCollection.entity.page;
            return employeeCollection.entity._embedded.employees.map(employee =>
            client({
                method: 'GET',
                path: employee._links.self.href
            }));
        }).then(employeePromises => {
            return when.all(employeePromises);
        }).done(employees => {
            this.setState({
                ePage: this.page,
                employees: employees,
                eAttributes: Object.keys(this.schema.properties),
                ePageSize: ePageSize,
                eLinks: this.links});
        });
    }

    loadFromServerShift(sPageSize) {
        follow(client, root, [
            {rel: 'shifts', params: {size: sPageSize}}]
        ).then(shiftCollection => {
            return client({
                method: 'GET',
                path: shiftCollection.entity._links.profile.href,
                headers: {'Accept': 'application/schema+json'}
            }).then(schema => {
                this.schema = schema.entity;
                this.links = shiftCollection.entity._links;
                return shiftCollection;
            });
        }).then(shiftCollection => {
            this.page = shiftCollection.entity.page;
            return shiftCollection.entity._embedded.shifts.map(shift =>
                client({
                    method: 'GET',
                    path: shift._links.self.href
                }));
        }).then(shiftPromises => {
            return when.all(shiftPromises);
        }).done(shifts => {
            this.setState({
                sPage: this.page,
                shifts: shifts,
                sAttributes: Object.keys(this.schema.properties),
                sPageSize: sPageSize,
                sLinks: this.links
            });
        });
    }

    onCreate(newEmployee) {
        follow(client, root, ['employees']).done(response => {
            client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newEmployee,
                headers: {'Content-Type': 'application/json'}
            })
        })
    }

    onCreateShift(newShift) {
        follow(client, root, ['shifts']).done(response => {
            client({
                method: 'POST',
                path: response.entity._links.self.href,
                entity: newShift,
                headers: {'Content-Type': 'application/json'}
            })
        })
    }

    onDelete(employee) {
        client({method: 'DELETE', path: employee.entity._links.self.href});
    }

    onDeleteShift(shift) {
        client({method: 'DELETE', path: shift.entity._links.self.href});
    }

    onUpdate(employee, updatedEmployee) {
        client({
            method: 'PUT',
            path: employee.entity._links.self.href,
            entity: updatedEmployee,
            headers: {
                'Content-Type': 'application/json',
                'If-Match': employee.headers.Etag
            }
        }).done(response => {
            this.loadFromServer(this.state.ePageSize);
        }, response => {
            if (response.status.code === 412) {
                alert('DENIED: Unable to update' + employee.entity._links.self.href + '. Your copy is stale. ');
            }
        });
    }

    onUpdateShift(shift, updatedShift) {
        client({
            method: 'PUT',
            path: shift.entity._links.self.href,
            entity: updatedShift,
            headers: {
                'Content-Type': 'application/json',
                'If-Match': shift.headers.Etag
            }
        }).done(response => {
            this.loadFromServerShift(this.state.sPageSize);
        }, response => {
            if (response.status.code === 412) {
                alert('DENIED: Unable to update' + shift.entity._links.self.href + '. Your copy is stale. ');
            }
        });
    }

    onNavigate(navUri) {
        client({method: 'GET', path: navUri}).then(employeeCollection => {
            this.links = employeeCollection.entity._links;
            this.page = employeeCollection.entity.page;
            return employeeCollection.entity._embedded.employees.map(employee =>
                client({
                    method: 'GET',
                    path: employee._links.self.href
                }));
        }).then(employeePromises => {
            return when.all(employeePromises);
        }).done(employees => {
            this.setState({
                ePage: this.page,
                employees: employees,
                eAttributes: Object.keys(this.schema.properties),
                ePageSize: this.state.ePageSize,
                eLinks: this.links});
        });
    }

    onNavigateShift(navUri) {
        client({method: 'GET', path: navUri}).then(shiftCollection => {
            this.links = shiftCollection.entity._links;
            this.page = shiftCollection.entity.page;
            return shiftCollection.entity._embedded.shifts.map(shift =>
                client({
                    method: 'GET',
                    path: shift._links.self.href
                }));
        }).then(shiftPromises => {
            return when.all(shiftPromises);
        }).done(shifts => {
            this.setState({
                sPage: this.page,
                shifts: shifts,
                sAttributes: Object.keys(this.schema.properties),
                sPageSize: this.state.sPageSize,
                sLinks: this.links});
        });
    }

    updatePageSize(pageSize) {
        if (pageSize !== this.state.ePageSize) {
            this.loadFromServer(pageSize);
        }
    }

    updateShiftPageSize(pageSize) {
        if (pageSize !== this.state.sPageSize) {
            this.loadFromServerShift(pageSize);
        }
    }

    refreshAndGoToLastPage(message) {
        follow(client, root, [{
            rel: 'employees',
            params: {size: this.state.ePageSize}
        }]).done(response => {
            if (response.entity._links.last !== undefined) {
                this.onNavigate(response.entity._links.last.href);
            } else {
                this.onNavigate(response.entity._links.self.href);
            }
        })
    }

    refreshCurrentPage(message) {
        follow(client, root, [{
            rel: 'employees',
            params: {
                size: this.state.ePageSize,
                page: this.state.ePage.number
            }
        }]).then(employeeCollection => {
            this.links = employeeCollection.entity._links;
            this.page = employeeCollection.entity.page;

            return employeeCollection.entity._embedded.employees.map(employee => {
                return client({
                    method: 'GET',
                    path: employee._links.self.href
                })
            });
        }).then(employeePromises => {
            return when.all(employeePromises);
        }).then(employees => {
            this.setState({
                ePage: this.page,
                employees: employees,
                eAttributes: Object.keys(this.schema.properties),
                ePageSize: this.state.ePageSize,
                eLinks: this.links
            });
        });
    }

    componentDidMount() {
        this.loadFromServer(this.state.ePageSize);
        this.loadFromServerShift(this.state.sPageSize);
        stompClient.register([
            {route: '/topic/newEmployee', callback: this.refreshAndGoToLastPage},
            {route: '/topic/updateEmployee', callback: this.refreshCurrentPage},
            {route: '/topic/deleteEmployee', callback: this.refreshCurrentPage}
        ]);
    }

    render() {
        console.log(this.state);
        return (
            <div>
                <CreateDialog attributes={this.state.eAttributes} onCreate={this.onCreate}/>
                <EmployeeList page={this.state.ePage}
                              employees={this.state.employees}
                              links={this.state.eLinks}
                              pageSize={this.state.ePageSize}
                              attributes={this.state.eAttributes}
                              onNavigate={this.onNavigate}
                              onUpdate={this.onUpdate}
                              onDelete={this.onDelete}
                              updatePageSize={this.updatePageSize}/>
                <ShiftList page={this.state.sPage}
                           shifts={this.state.shifts}
                           links={this.state.sLinks}
                           pageSize={this.state.sPageSize}
                           attributes={this.state.sAttributes}
                           onNavigate={this.onNavigateShift}
                           onUpdate={this.onUpdateShift}
                           onDelete={this.onDeleteShift}
                           updatePageSize={this.updateShiftPageSize}/>
            </div>
        )
    }
}

class CreateDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        var newEmployee = {};
        this.props.attributes.forEach(attribute => {
            newEmployee[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onCreate(newEmployee);
        this.props.attributes.forEach(attribute => {
            ReactDOM.findDOMNode(this.refs[attribute]).value = '';
        });
        window.location = "#";
    }

    render() {
        var inputs = this.props.attributes.map(attribute =>
            <p key={attribute}>
                <input type="text" placeholder={attribute} ref={attribute} className="field" />
            </p>
        );

        return (
            <div>
                <a href="#createEmployee">Create</a>
                <div id="createEmployee" className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>
                        <h2>Create new employee</h2>
                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>Create</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

class UpdateEmployeeDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        var updateEmployee = {};
        this.props.attributes.forEach(attribute => {
            updateEmployee[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onUpdate(this.props.employee, updateEmployee);
        window.locatiom = '#';
    }

    render() {
        var inputs = this.props.attributes.map(attribute =>
            <p key={this.props.employee.entity[attribute]}>
                <input type="text" placeholder={attribute} defaultValue={this.props.employee.entity[attribute]} ref={attribute} className="field" />
            </p>);
        var dialogID = "updateEmployee-" + this.props.employee.entity._links.self.href;
        return (
            <div key={this.props.employee.entity._links.self.href}>
                <a href={"#" + dialogID}>Update</a>
                <div id={dialogID} className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>
                        <h2>Update an employee</h2>
                        <form> {inputs} <button onClick={this.handleSubmit}>Update</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

class UpdateShiftDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        var updateShift = {};
        this.props.attributes.forEach(attribute => {
            updateShift[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onUpdate(this.props.shift, updateShift);
        window.locatiom = '#';
    }

    render() {
        var inputs = this.props.attributes.map(attribute =>
            <p key={this.props.shift.entity[attribute]}>
                <input type="text" placeholder={attribute} defaultValue={this.props.shift.entity[attribute]} ref={attribute} className="field" />
            </p>);
        var dialogID = "updateShift-" + this.props.shift.entity._links.self.href;
        return (
            <div key={this.props.shift.entity._links.self.href}>
                <a href={"#" + dialogID}>Update</a>
                <div id={dialogID} className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>
                        <h2>Update a shift</h2>
                        <form> {inputs} <button onClick={this.handleSubmit}>Update</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

/*
    Handles entire table
 */
class EmployeeList extends React.Component {

    constructor(props) {
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e) {
        e.preventDefault();
        var pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
        if (/^[0-9]+$/.test(pageSize)) {
            this.props.updatePageSize(pageSize);
        } else {
            ReactDOM.findDOMNode(this.refs.pageSize).value =
                pageSize.substring(0, pageSize.length - 1);
        }
    }

    handleNavFirst(e){
        e.preventDefault();
        this.props.onNavigate(this.props.links.first.href);
    }

    handleNavPrev(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.prev.href);
    }

    handleNavNext(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.next.href);
    }

    handleNavLast(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.last.href);
    }

    render() {
        var pageInfo = this.props.page.hasOwnProperty("number") ?
            <h3>Employees - Page {this.props.page.number + 1} of {this.props.page.totalPages}</h3> : null;

        var employees = this.props.employees.map(employee =>
            <Employee key={employee.entity._links.self.href} employee={employee} attributes={this.props.attributes}
                      onUpdate={this.props.onUpdate} onDelete={this.props.onDelete}/>
        );

        var navLinks = [];
        if ("first" in this.props.links) {
            navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
        }
        if ("prev" in this.props.links) {
            navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
        }
        if ("next" in this.props.links) {
            navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
        }
        if ("last" in this.props.links) {
            navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
        }

        return (
            <div>
                {pageInfo}
                <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
                <table>
                    <tbody>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Description</th>
                        <th></th>
                        <th></th>
                    </tr>
                    {employees}
                    </tbody>
                </table>
                <div>
                    {navLinks}
                </div>
            </div>
        )
    }
}

/*
    Handles individual employee records in the table
 */
class Employee extends React.Component {

    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        this.props.onDelete(this.props.employee);
    }

    render() {
        return (
            <tr>
                <td>{this.props.employee.entity.firstName}</td>
                <td>{this.props.employee.entity.lastName}</td>
                <td>{this.props.employee.entity.description}</td>
                <td>
                    <UpdateEmployeeDialog employee={this.props.employee} attributes={this.props.attributes} onUpdate={this.props.onUpdate}/>
                </td>
                <td>
                    <button onClick={this.handleDelete}>Delete</button>
                </td>
            </tr>
        )
    }
}

/*
 Handles entire table
 */
class ShiftList extends React.Component {

    constructor(props) {
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleInput(e) {
        e.preventDefault();
        var pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
        if (/^[0-9]+$/.test(pageSize)) {
            this.props.updatePageSize(pageSize);
        } else {
            ReactDOM.findDOMNode(this.refs.pageSize).value =
                pageSize.substring(0, pageSize.length - 1);
        }
    }

    handleNavFirst(e){
        e.preventDefault();
        this.props.onNavigate(this.props.links.first.href);
    }

    handleNavPrev(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.prev.href);
    }

    handleNavNext(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.next.href);
    }

    handleNavLast(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.links.last.href);
    }

    render() {
        var pageInfo = this.props.page.hasOwnProperty("number") ?
            <h3>Shifts - Page {this.props.page.number + 1} of {this.props.page.totalPages}</h3> : null;

        var shifts = this.props.shifts.map(shift =>
            <Shift key={shift.entity._links.self.href} shift={shift} attributes={this.props.attributes}
                      onUpdate={this.props.onUpdate} onDelete={this.props.onDelete}/>
        );

        var navLinks = [];
        if ("first" in this.props.links) {
            navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
        }
        if ("prev" in this.props.links) {
            navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
        }
        if ("next" in this.props.links) {
            navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
        }
        if ("last" in this.props.links) {
            navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
        }

        return (
            <div>
                {pageInfo}
                <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
                <table>
                    <tbody>
                    <tr>
                        <th>Description</th>
                        <th>Day/Time</th>
                        <th>EmployeeID</th>
                        <th></th>
                        <th></th>
                    </tr>
                    {shifts}
                    </tbody>
                </table>
                <div>
                    {navLinks}
                </div>
            </div>
        )
    }
}

/*
 Handles individual shift records in the table
 */
class Shift extends React.Component {

    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        this.props.onDelete(this.props.shift);
    }

    render() {
        return (
            <tr>
                <td>{this.props.shift.entity.description}</td>
                <td>{this.props.shift.entity.day}</td>
                <td>{this.props.shift.entity.employeeId}</td>
                <td>
                    <UpdateShiftDialog shift={this.props.shift} attributes={this.props.attributes} onUpdate={this.props.onUpdate}/>
                </td>
                <td>
                    <button onClick={this.handleDelete}>Delete</button>
                </td>
            </tr>
        )
    }
}
/*

 */

ReactDOM.render(<App />, document.getElementById('react'));
