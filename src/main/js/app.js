'use strict';
import Keycloak from 'keycloak-js';

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
            shifts: [], sAttributes: [], sPage: 1, sPageSize: 1, sLinks: {}
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
        this.refreshCurrentPageShift = this.refreshCurrentPageShift.bind(this);

        this.refreshAndGoToLastPage = this.refreshAndGoToLastPage.bind(this);
        this.refreshAndGoToLastPageShift = this.refreshAndGoToLastPageShift.bind(this);
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
                this.eSchema = schema.entity;
                this.state.eLinks = employeeCollection.entity._links;
                return employeeCollection;
            });
        }).then(employeeCollection => {
            this.state.ePage = employeeCollection.entity.page;
            return employeeCollection.entity._embedded.employees.map(employee =>
            client({
                method: 'GET',
                path: employee._links.self.href
            }));
        }).then(employeePromises => {
            return when.all(employeePromises);
        }).done(employees => {
            this.setState({
                employees: employees,
                eAttributes: Object.keys(this.eSchema.properties),
                ePageSize: ePageSize});
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
                this.sSchema = schema.entity;
                this.state.sLinks = shiftCollection.entity._links;
                return shiftCollection;
            });
        }).then(shiftCollection => {
            this.state.sPage = shiftCollection.entity.page;
            return shiftCollection.entity._embedded.shifts.map(shift =>
                client({
                    method: 'GET',
                    path: shift._links.self.href
                }));
        }).then(shiftPromises => {
            return when.all(shiftPromises);
        }).done(shifts => {
            this.setState({
                shifts: shifts,
                sAttributes: Object.keys(this.sSchema.properties),
                sPageSize: sPageSize});
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
            this.state.eLinks = employeeCollection.entity._links;
            this.state.ePage = employeeCollection.entity.page;
            return employeeCollection.entity._embedded.employees.map(employee =>
                client({
                    method: 'GET',
                    path: employee._links.self.href
                }));
        }).then(employeePromises => {
            return when.all(employeePromises);
        }).done(employees => {
            this.setState({
                employees: employees,
                eAttributes: Object.keys(this.eSchema.properties),
                ePageSize: this.state.ePageSize});
        });
    }

    onNavigateShift(navUri) {
        client({method: 'GET', path: navUri}).then(shiftCollection => {
            this.state.sLinks = shiftCollection.entity._links;
            this.state.sPage = shiftCollection.entity.page;
            return shiftCollection.entity._embedded.shifts.map(shift =>
                client({
                    method: 'GET',
                    path: shift._links.self.href
                }));
        }).then(shiftPromises => {
            return when.all(shiftPromises);
        }).done(shifts => {
            this.setState({
                shifts: shifts,
                sAttributes: Object.keys(this.sSchema.properties),
                sPageSize: this.state.sPageSize});
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

    refreshAndGoToLastPageShift(message) {
        follow(client, root, [{
            rel: 'shifts',
            params: {size: this.state.sPageSize}
        }]).done(response => {
            if (response.entity._links.last !== undefined) {
                this.onNavigateShift(response.entity._links.last.href);
            } else {
                this.onNavigateShift(response.entity._links.self.href);
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
            this.state.eLinks = employeeCollection.entity._links;
            this.state.ePage = employeeCollection.entity.page;

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
                employees: employees,
                eAttributes: Object.keys(this.eSchema.properties),
                ePageSize: this.state.ePageSize});
        });
    }

    refreshCurrentPageShift(message) {
        follow(client, root, [{
            rel: 'shifts',
            params: {
                size: this.state.sPageSize,
                page: this.state.sPage.number
            }
        }]).then(shiftCollection => {
            this.state.sLinks = shiftCollection.entity._links;
            this.state.sPage = shiftCollection.entity.page;

            return shiftCollection.entity._embedded.shifts.map(shift => {
                return client({
                    method: 'GET',
                    path: shift._links.self.href
                })
            });
        }).then(shiftPromises => {
            return when.all(shiftPromises);
        }).then(shifts => {
            this.setState({
                shifts: shifts,
                sAttributes: Object.keys(this.sSchema.properties),
                sPageSize: this.state.sPageSize});
        });
    }

    componentDidMount() {
        this.loadFromServer(this.state.ePageSize);
        this.loadFromServerShift(this.state.sPageSize);
        stompClient.register([
            {route: '/topic/newEmployee', callback: this.refreshAndGoToLastPage},
            {route: '/topic/updateEmployee', callback: this.refreshCurrentPage},
            {route: '/topic/deleteEmployee', callback: this.refreshCurrentPage},
            {route: '/topic/newShift', callback: this.refreshAndGoToLastPageShift},
            {route: '/topic/updateShift', callback: this.refreshCurrentPageShift},
            {route: '/topic/deleteShift', callback: this.refreshCurrentPageShift}
        ]);
    }

    render() {
        return (
            <div>
                <RecordList type="Employees"
                            page={this.state.ePage}
                            records={this.state.employees}
                            links={this.state.eLinks}
                            pageSize={this.state.ePageSize}
                            attributes={this.state.eAttributes}
                            onNavigate={this.onNavigate}
                            onUpdate={this.onUpdate}
                            onDelete={this.onDelete}
                            updatePageSize={this.updatePageSize}/>
                <CreateDialog type="Employees" attributes={this.state.eAttributes} onCreate={this.onCreate}/>
                <RecordList type="Shifts"
                            page={this.state.sPage}
                            records={this.state.shifts}
                            links={this.state.sLinks}
                            pageSize={this.state.sPageSize}
                            attributes={this.state.sAttributes}
                            onNavigate={this.onNavigateShift}
                            onUpdate={this.onUpdateShift}
                            onDelete={this.onDeleteShift}
                            updatePageSize={this.updateShiftPageSize}/>
                <CreateDialog type="Shifts" attributes={this.state.sAttributes} onCreate={this.onCreateShift}/>
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
        var newRecord = {};
        this.props.attributes.forEach(attribute => {
            newRecord[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onCreate(newRecord);
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
                <a href={"#create"+this.props.type}>Create new {this.props.type}</a>
                <div id={"create"+this.props.type} className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>
                        <h2>Create new {this.props.type}</h2>
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

class UpdateDialog extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        var updateRecord = {};
        this.props.attributes.forEach(attribute => {
            updateRecord[attribute] = ReactDOM.findDOMNode(this.refs[attribute]).value.trim();
        });
        this.props.onUpdate(this.props.record, updateRecord);
        window.location = '#';
    }

    render() {
        var inputs = this.props.attributes.map(attribute =>
            <p key={this.props.record.entity[attribute]}>
                <input type="text" placeholder={attribute} defaultValue={this.props.record.entity[attribute]} ref={attribute} className="field" />
            </p>);
        var dialogID = "update" + this.props.type + "-" + this.props.record.entity._links.self.href;
        return (
            <div key={this.props.record.entity._links.self.href}>
                <button className="roundButtons"><a className="buttonText" href={"#" + dialogID}>Update</a></button>
                <div id={dialogID} className="modalDialog">
                    <div>
                        <a href="#" title="Close" className="close">X</a>
                        <h2>Update a {this.props.type}</h2>
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
class RecordList extends React.Component {

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
        var pageInfo = <h3>{this.props.type}</h3>;

        var records = this.props.records.map(record =>
            <Record key={record.entity._links.self.href} record={record} attributes={this.props.attributes}
                      onUpdate={this.props.onUpdate} onDelete={this.props.onDelete} type={this.props.type}/>
        );

        var navLinks = [];
        if ("first" in this.props.links) {
            navLinks.push(<button key="first" onClick={this.handleNavFirst}>&lt;&lt;</button>);
        }
        else {
            navLinks.push(<button key="first" className="disabledButton">&lt;&lt;</button>);
        }
        if ("prev" in this.props.links) {
            navLinks.push(<button key="prev" onClick={this.handleNavPrev}>&lt;</button>);
        }
        else {
            navLinks.push(<button key="prev" className="disabledButton">&lt;</button>);
        }
        navLinks.push(this.props.page.hasOwnProperty("number") ? <b key="pageOf">Page {this.props.page.number + 1} of {this.props.page.totalPages}</b> : null);

        if ("next" in this.props.links) {
            navLinks.push(<button key="next" onClick={this.handleNavNext}>&gt;</button>);
        }
        else {
            navLinks.push(<button key="next" className="disabledButton">&gt;</button>);
        }
        if ("last" in this.props.links) {
            navLinks.push(<button key="last" onClick={this.handleNavLast}>&gt;&gt;</button>);
        }
        else {
            navLinks.push(<button key="last" className="disabledButton">&gt;&gt;</button>);
        }

        var headers = [];
        for(var i = 0; i < this.props.attributes.length; i++) {
            // Replace uses Regex to replace first character of space with Capital letter
            headers.push(<td key={i}><b>{this.props.attributes[i].replace(/\b\w/g, l => l.toUpperCase())}</b></td>);
        }

        return (
            <div>
                {pageInfo}
                <input ref="pageSize" defaultValue={this.props.pageSize} onInput={this.handleInput}/>
                <table>
                    <tbody>
                    <tr>
                        {headers}
                        <th className="invisibleBorders"></th>
                        <th className="invisibleBorders"></th>
                    </tr>
                    {records}
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
    Handles individual records
 */
class Record extends React.Component {
    constructor(props) {
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleDelete() {
        this.props.onDelete(this.props.record);
    }

    render() {
        var values = [];
        for(var i = 0; i < this.props.attributes.length; i++) {
            values.push(<td key={i}>{this.props.record.entity[this.props.attributes[i]]}</td>);
        }

        return (
            <tr>
                {values}
                <td className="invisibleBorders">
                    <UpdateDialog record={this.props.record} type={this.props.type} attributes={this.props.attributes} onUpdate={this.props.onUpdate}/>
                </td>
                <td className="invisibleBorders">
                    <button className="roundButtons" onClick={this.handleDelete}>Delete</button>
                </td>
            </tr>
        )
    }
}

var kcState;
const kc = Keycloak('/keycloak.json');
kc.init({onLoad: 'check-sso'}).success(authenticated => {
    if (authenticated) {
        kcState = kc;

        setInterval(() => {
            kc.updateToken(10).error(() => kc.logout());
        }, 10000);

        ReactDOM.render(<App />, document.getElementById("react"));

    } else {
        kc.login();
    }});
