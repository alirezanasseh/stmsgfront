import React, { Component } from 'react';
import List from "../components/List";
import entityModel from "../models/Users";
import Item from "../components/Item";
import {Col, Container, Row} from "react-bootstrap";

export default class Users extends Component {
    state = {
        entities: {}
    };

    componentDidMount(){
        this.setState({
            entities : entityModel({
                page: this.props.match.params.page,
                id: this.props.match.params.id,
                show_sessions: this.show_sessions,
                ROLES: global.config.ROLES,
                lockIcon: <span className="glyphicon glyphicon-lock"/>
            })
        });
    }

    show_sessions = (args) => {
        window.open("/sessions/" + args.id);
    };

    render(){
        let {entities} = this.state;
        let {pathname} = this.props.location;
        return (
            <Container>
                <Row>
                    <Col>
                        {entities.base ?
                            pathname.indexOf("add") > -1 || pathname.indexOf("edit") > -1 ?
                                <Item base={entities.base} data={entities.item}/>
                                :
                                <List base={entities.base} data={entities.list}/>
                            : ''
                        }
                    </Col>
                </Row>
            </Container>
        );
    }
}