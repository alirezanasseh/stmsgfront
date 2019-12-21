import React, {Component} from 'react';
import {Container, Row, Col, Form, Button, Alert} from 'react-bootstrap';
import xhr from '../components/xhr';
const loadingGif = <span className="glyphicon glyphicon-repeat fast-right-spinner"/>;

export default class Register extends Component {
    state = {
        item: {},
        submit_loading: false,
        message: null,
        registered: false
    };

    register = (e) => {
        e.preventDefault();
        this.setState({submit_loading: true});
        let data = this.state.item;
        new xhr(this, 'register', data).Post(response => {
            this.setState({submit_loading: false});
            if(response.status){
                this.setState({message: <Alert variant="success">عضویت شما با موفقیت ثبت شد. اکنون می توانید <a href="/login">وارد شوید</a>.</Alert>, registered: true});
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
        let {item, submit_loading, message, registered} = this.state;

        return (
            <Container>
                <Row>
                    <Col>
                        <h2>عضویت</h2>
                        {message}
                        {!registered &&
                            <Form onSubmit={this.register}>
                                <Form.Group>
                                    <Form.Label column={1}>نام</Form.Label>
                                    <Form.Control type="text" name="name" value={item.name} onChange={this.change}/>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label column={2}>موبایل</Form.Label>
                                    <Form.Control type="text" name="mobile" value={item.mobile} onChange={this.change}/>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label column={2}>رمز عبور</Form.Label>
                                    <Form.Control type="password" name="password" value={item.password} onChange={this.change}/>
                                </Form.Group>
                                <Button type="submit" disabled={submit_loading}>{submit_loading ? loadingGif : "عضویت"}</Button>
                            </Form>
                        }
                    </Col>
                </Row>
            </Container>
        );
    }
}