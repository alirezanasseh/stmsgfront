import React, { Component } from 'react';
import {Switch, Route, Link} from 'react-router-dom';
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PrivateRoute from './components/PrivateRoute';
import Users from "./pages/Users";
import Permissions from "./pages/Permissions";
import {Col, Container, Row, Navbar, Nav} from "react-bootstrap";

export default class App extends Component {
    state = {
        isAuthenticated: true
    };

    constructor(props){
        super(props);
    }

    componentWillMount() {
        global.config.TOKEN = localStorage.getItem('smtoken');
        if(!global.config.TOKEN){
            this.setState({isAuthenticated: false});
        }
    }
      
    handleLogout(){
        localStorage.removeItem('smtoken');
        localStorage.removeItem('smuser');
        global.config.TOKEN = '';
        window.location = '/';
    }

    render() {
        let {isAuthenticated} = this.state;
        return (
            <Container fluid>
                <Row id="header_row">
                    <Navbar bg="dark">
                        <Navbar.Brand><Link to="/">استارتاپ مسنجر</Link></Navbar.Brand>
                        <Navbar.Text>
                            <Nav.Link href={isAuthenticated ? '/logout' : '/login'}>{isAuthenticated ? 'خروج' : window.location.pathname === '/login' ? '' : 'ورود'}</Nav.Link>
                        </Navbar.Text>
                    </Navbar>
                </Row>
                <Row>
                    <Col>
                        <Switch>
                            <PrivateRoute exact path="/" component={Home} auth={isAuthenticated}/>

                            <PrivateRoute path="/users/add" component={Users} auth={isAuthenticated}/>
                            <PrivateRoute path="/users/edit/:id" component={Users} auth={isAuthenticated}/>
                            <PrivateRoute exact path="/users/:page?" component={Users} auth={isAuthenticated}/>

                            <PrivateRoute path="/permissions/add" component={Permissions} auth={isAuthenticated}/>
                            <PrivateRoute path="/permissions/edit/:id" component={Permissions} auth={isAuthenticated}/>
                            <PrivateRoute exact path="/permissions/:page?" component={Permissions} auth={isAuthenticated}/>

                            <Route exact path="/register" component={Register}/>
                            <Route exact path="/login" component={Login}/>
                            <Route exact path="/logout" render={this.handleLogout}/>
                        </Switch>
                    </Col>
                </Row>
            </Container>
        );
    }
}