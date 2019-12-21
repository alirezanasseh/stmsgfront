import React, { Component } from 'react';
import List from "../components/List";
import entityModel from "../models/Permissions";
import Item from "../components/Item";
import {Container, Row, Col} from 'react-bootstrap';

let methods = [
    {key: 'get', value: 'GET'},
    {key: 'post', value: 'POST'},
    {key: 'put', value: 'PUT'},
    {key: 'delete', value: 'DELETE'},
];
let permissionMethods = ["get", "post", "put_query", "put_set", "delete"];

export default class Permissions extends Component {
    state = {
        entities: {}
    };

    componentDidMount(){
        this.setState({
            entities : entityModel({
                page: this.props.match.params.page,
                id: this.props.match.params.id,
                ROLES: global.config.ROLES,
                convertFields: this.convertFields,
                convertBackFields: this.convertBackFields,
                stringify: this.stringify,
                beforeLoad: this.beforeLoad,
                methods
            })
        });
    }

    stringify = args => {
        return JSON.stringify(args[0]);
    };

    convertFields = args => {
        for(let i = 0; i < permissionMethods.length; i++){
            args[permissionMethods[i]] = args[permissionMethods[i]] ? JSON.parse(args[permissionMethods[i]]) : {};
        }
        return args;
    };

    convertBackFields = child => {
        let item = child.state.item;
        for(let i = 0; i < permissionMethods.length; i++){
            item[permissionMethods[i]] = JSON.stringify(item[permissionMethods[i]]);
        }
        child.setState({item});
    };

    beforeLoad = item => {
        for(let i = 0; i < permissionMethods.length; i++){
            item[permissionMethods[i]] = JSON.stringify(item[permissionMethods[i]]);
        }
        return item;
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