import React, {Component} from 'react';
import {Container, Row, Col, Form, Button, Alert} from 'react-bootstrap';
import xhr from '../components/xhr';
import clientJS from 'clientjs';
const loadingGif = <span className="glyphicon glyphicon-repeat fast-right-spinner"/>;

export default class Login extends Component {
    state = {
        item: {},
        submit_loading: false,
        message: null
    };

    login = (e) => {
        e.preventDefault();
        this.setState({submit_loading: true, message: ''});
        let data = this.state.item;
        let client = new clientJS();
        data.device = client.getResult();
        new xhr(this, 'login', data).Post(response => {
            this.setState({submit_loading: false});
            if(response.status){
                if(response.token){
                    localStorage.setItem("smtoken", response.token);
                    localStorage.setItem("smuser", response.user_name);
                    global.config.TOKEN = response.token;
                    window.location = "/";
                }else{
                    this.setState({message: <Alert variant="danger">خطا در ورود</Alert>});
                }
            }else{
                this.setState({message: <Alert variant="danger">{response.note}</Alert>});
            }
        });
    };

    change = (e) => {
        let target = e.target;
        let {item} = this.state;
        item[target.name] = target.value;
        this.setState({item});
    };

    render(){
        let {item, submit_loading, message} = this.state;

        return (
            <Container>
                <Row>
                    <Col>
                        <h2>ورود به استارتاپ مسنجر</h2>
                        {message}
                        <Form onSubmit={this.login}>
                            <Form.Group>
                                <Form.Label column={2}>موبایل</Form.Label>
                                <Form.Control type="text" name="mobile" value={item.mobile} onChange={this.change}/>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label column={2}>رمز عبور</Form.Label>
                                <Form.Control type="password" name="password" value={item.password} onChange={this.change}/>
                            </Form.Group>
                            <Button type="submit" disabled={submit_loading}>{submit_loading ? loadingGif : "ورود"}</Button>
                        </Form>
                        <div style={{marginTop: "20px"}}>
                            <a href="/register">عضویت در استارتاپ مسنجر</a>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}