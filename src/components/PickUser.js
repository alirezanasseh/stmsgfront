import React, { Component } from 'react';
import List from "../components/List";
import UserModel from "../models/Users";
import {Button, Modal} from "react-bootstrap";
import xhr from "./xhr";

export default class PickUser extends Component {
    state={
        page: 1,
        show: false,
        user: {},
    };

    componentWillReceiveProps(nextProps){
        if(!nextProps.user) return;
        if(nextProps.user.id !== this.state.user.id){
            this.setState({user: nextProps.user});
            if(!nextProps.user.full_name){
                new xhr(this, "users", nextProps.user.id).GetOne(user => {
                    let stateUser = this.state.user;
                    stateUser.full_name = user.name + ' ' + user.family;
                    this.setState({stateUser});
                });
            }
        }
    }

    handlePick = (args) => {
        if(args.id){
            this.setState({
                user: {
                    id: args.id,
                    full_name: args.name + " " + args.family
                },
                show: false
            });
            this.props.changeUser(args.id, args.name + " " + args.family, this.props.field);
        }
    };

    handleHide = () => {
        window.history.replaceState(null, null, this.props.path);
        this.setState({show: false});
    };

    render(){
        let {user} = this.state;
        return (
            <div>
                <Modal show={this.state.show} onHide={this.handleHide} bsSize="large" aria-labelledby="contained-modal-title-lg">
                    <Modal.Header closeButton>
                        <Modal.Title>انتخاب کاربر {user && ": " + user.full_name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <List
                            base={{
                                entities: "کاربران",
                                entity: "کاربر",
                                module: "users",
                                path: "/users",
                                model: UserModel,
                                picker: true
                            }}
                            data={{
                                page: this.state.page,
                                perPage: 10,
                                fields: [
                                    {name: "pic"},
                                    {name: "name"},
                                    {name: "family"},
                                    {name: "mobile"},
                                    {name: "instagram"},
                                    {name: "gender"},
                                ],
                                search: [
                                    {
                                        component_type: "text",
                                        type: "field",
                                        name: "name",
                                        value: "name",
                                        field: "name",
                                        placeholder: "جستجو براساس نام",
                                        search_type: "regex",
                                        regex_type: "middle"
                                    },
                                    {
                                        component_type: "text",
                                        type: "field",
                                        name: "family",
                                        value: "family",
                                        field: "family",
                                        placeholder: "جستجو براساس نام خانوادگی",
                                        search_type: "regex",
                                        regex_type: "middle"
                                    },
                                    {
                                        component_type: "text",
                                        type: "field",
                                        name: "mobile",
                                        value: "mobile",
                                        field: "mobile",
                                        placeholder: "جستجو براساس موبایل",
                                        search_type: "regex",
                                        regex_type: "start"
                                    },
                                ],
                                custom_operations: [
                                    {
                                        'class': 'success',
                                        caption: "انتخاب",
                                        click: {
                                            func: this.handlePick,
                                            params: ["id", "name", "family"]
                                        }
                                    }
                                ]
                            }}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleHide}>بستن</Button>
                    </Modal.Footer>
                </Modal>
                <Button variant="info" onClick={() => this.setState({show: true})}>انتخاب کاربر</Button>
                <div className="show_user">
                    {user && user.id && <a href={'/users/edit/' + user.id} target="_blank" rel="noopener noreferrer">{user.full_name}</a>}
                </div>
            </div>
        );
    }
}